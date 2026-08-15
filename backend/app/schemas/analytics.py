from typing import List
from pydantic import BaseModel


class TopProduct(BaseModel):
    name: str
    sales: int
    revenue: float


class AnalyticsResponse(BaseModel):
    totalRevenue: float
    totalOrders: int
    totalProducts: int
    totalUsers: int
    revenueGrowth: float
    ordersGrowth: float
    usersGrowth: float
    productsGrowth: float
    conversionRate: float
    conversionRateDelta: float
    averageOrderValue: float
    labels: List[str]
    revenueData: List[float]
    ordersData: List[int]
    usersData: List[int]
    topProducts: List[TopProduct]
