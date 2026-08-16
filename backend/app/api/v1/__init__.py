from fastapi import APIRouter
from app.api.v1 import auth, users, products, product_engagement, lessons, orders, config, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/v1/users", tags=["users"])
api_router.include_router(product_engagement.router, prefix="/products", tags=["product-engagement"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(lessons.router, prefix="/products", tags=["lessons"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(config.router, prefix="/config", tags=["config"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
