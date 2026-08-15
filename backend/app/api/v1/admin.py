from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, List, Tuple
from app.db.database import get_db
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.user import User, UserRole
from app.api.dependencies import get_current_admin_user
from app.models.user import User as UserModel
from app.schemas.user import AdminUserResponse, UserStatusUpdate, UserRoleUpdate
from app.schemas.analytics import AnalyticsResponse, TopProduct

router = APIRouter()


def _to_admin_user_response(db: Session, user: User) -> AdminUserResponse:
    orders_count = db.query(func.count(Order.id)).filter(Order.user_id == user.id).scalar() or 0
    return AdminUserResponse.model_validate(user).model_copy(update={"orders_count": orders_count})


FR_WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
FR_MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

Bucket = Tuple[datetime, datetime]


def _add_months(d: datetime, months: int) -> datetime:
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    return d.replace(year=year, month=month, day=1)


def _build_buckets(timeframe: str) -> Tuple[List[Bucket], List[Bucket], List[str]]:
    """Return (buckets, previous_period_buckets, labels), oldest first, buckets ending today."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    if timeframe == "weekly":
        buckets = []
        for i in range(6, -1, -1):
            start = today_start - timedelta(days=i)
            buckets.append((start, start + timedelta(days=1)))
        labels = [FR_WEEKDAYS[start.weekday()] for start, _ in buckets]
        span = timedelta(days=7)
        prev_buckets = [(s - span, e - span) for s, e in buckets]
    elif timeframe == "yearly":
        month_start = today_start.replace(day=1)
        buckets = [
            (_add_months(month_start, -i), _add_months(month_start, -i + 1))
            for i in range(11, -1, -1)
        ]
        labels = [FR_MONTHS[start.month - 1] for start, _ in buckets]
        prev_buckets = [(_add_months(s, -12), _add_months(e, -12)) for s, e in buckets]
    else:  # monthly -> rolling last 4 weeks
        buckets = []
        for i in range(3, -1, -1):
            start = today_start - timedelta(days=7 * i + 6)
            buckets.append((start, start + timedelta(days=7)))
        labels = [f"Sem. {idx + 1}" for idx in range(len(buckets))]
        span = timedelta(days=28)
        prev_buckets = [(s - span, e - span) for s, e in buckets]

    return buckets, prev_buckets, labels


def _pct_change(current: float, previous: float) -> float:
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round((current - previous) / previous * 100, 1)


def _revenue_and_orders(db: Session, start: datetime, end: datetime) -> Tuple[float, int]:
    revenue = db.query(func.sum(Order.amount)).filter(
        Order.status == OrderStatus.COMPLETED,
        Order.created_at >= start,
        Order.created_at < end,
    ).scalar() or 0
    count = db.query(func.count(Order.id)).filter(
        Order.status == OrderStatus.COMPLETED,
        Order.created_at >= start,
        Order.created_at < end,
    ).scalar() or 0
    return float(revenue), count


def _count_in_range(db: Session, model, start: datetime, end: datetime) -> int:
    return db.query(func.count(model.id)).filter(
        model.created_at >= start, model.created_at < end
    ).scalar() or 0


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    timeframe: str = Query("monthly", pattern="^(weekly|monthly|yearly)$"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin_user)
):
    """Get real analytics for the given timeframe (admin only)."""
    buckets, prev_buckets, labels = _build_buckets(timeframe)
    period_start, period_end = buckets[0][0], buckets[-1][1]

    revenue_data: List[float] = []
    orders_data: List[int] = []
    users_data: List[int] = []
    for start, end in buckets:
        revenue, orders = _revenue_and_orders(db, start, end)
        revenue_data.append(revenue)
        orders_data.append(orders)
        users_data.append(_count_in_range(db, User, start, end))

    prev_revenue = prev_orders = 0.0
    prev_users = prev_products = 0
    for start, end in prev_buckets:
        r, o = _revenue_and_orders(db, start, end)
        prev_revenue += r
        prev_orders += o
        prev_users += _count_in_range(db, User, start, end)
        prev_products += _count_in_range(db, Product, start, end)

    new_products_in_period = _count_in_range(db, Product, period_start, period_end)

    total_revenue = sum(revenue_data)
    total_orders = sum(orders_data)
    total_new_users = sum(users_data)

    total_orders_created = db.query(func.count(Order.id)).filter(
        Order.created_at >= period_start, Order.created_at < period_end
    ).scalar() or 0
    prev_orders_created = db.query(func.count(Order.id)).filter(
        Order.created_at >= prev_buckets[0][0], Order.created_at < prev_buckets[-1][1]
    ).scalar() or 0

    conversion_rate = round(total_orders / total_orders_created * 100, 1) if total_orders_created else 0.0
    prev_conversion_rate = round(prev_orders / prev_orders_created * 100, 1) if prev_orders_created else 0.0

    top_products_q = (
        db.query(
            Product.title,
            func.count(Order.id).label("sales"),
            func.sum(Order.amount).label("revenue"),
        )
        .join(Order, Order.product_id == Product.id)
        .filter(
            Order.status == OrderStatus.COMPLETED,
            Order.created_at >= period_start,
            Order.created_at < period_end,
        )
        .group_by(Product.id, Product.title)
        .order_by(func.sum(Order.amount).desc())
        .limit(5)
        .all()
    )

    return AnalyticsResponse(
        totalRevenue=total_revenue,
        totalOrders=total_orders,
        totalProducts=db.query(func.count(Product.id)).scalar() or 0,
        totalUsers=db.query(func.count(User.id)).scalar() or 0,
        revenueGrowth=_pct_change(total_revenue, prev_revenue),
        ordersGrowth=_pct_change(total_orders, prev_orders),
        usersGrowth=_pct_change(total_new_users, prev_users),
        productsGrowth=_pct_change(new_products_in_period, prev_products),
        conversionRate=conversion_rate,
        conversionRateDelta=round(conversion_rate - prev_conversion_rate, 1),
        averageOrderValue=round(total_revenue / total_orders, 2) if total_orders else 0.0,
        labels=labels,
        revenueData=revenue_data,
        ordersData=orders_data,
        usersData=users_data,
        topProducts=[
            TopProduct(name=name, sales=sales, revenue=float(revenue or 0))
            for name, sales, revenue in top_products_q
        ],
    )

@router.get("/orders")
async def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin_user)
):
    """Get all orders, most recent first (admin only)."""
    from app.schemas.order import OrderResponse
    from sqlalchemy.orm import joinedload

    orders = db.query(Order).options(
        joinedload(Order.product),
        joinedload(Order.user),
    ).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return [OrderResponse.model_validate(o) for o in orders]


@router.get("/users", response_model=List[AdminUserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin_user)
):
    """List all users with order counts (admin only)."""
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return [_to_admin_user_response(db, u) for u in users]


@router.patch("/users/{user_id}/status", response_model=AdminUserResponse)
async def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin_user)
):
    """Activate/deactivate a user account (admin only)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot change your own active status")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return _to_admin_user_response(db, user)


@router.patch("/users/{user_id}/role", response_model=AdminUserResponse)
async def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin_user)
):
    """Promote/demote a user's role (admin only)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot change your own role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = UserRole(payload.role)
    db.commit()
    db.refresh(user)
    return _to_admin_user_response(db, user)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_admin_user)
):
    """Delete a user account (admin only). Users with order history must be deactivated instead."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    has_orders = db.query(Order.id).filter(Order.user_id == user_id).first() is not None
    if has_orders:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a user with order history. Deactivate the account instead.",
        )

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

