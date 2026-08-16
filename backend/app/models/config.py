from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class SiteConfig(Base):
    __tablename__ = "site_config"

    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String, default="L'Académie DES Éleveurs", nullable=False)
    currency = Column(String, default="FCFA", nullable=False)
    currency_symbol = Column(String, default="FCFA", nullable=False)
    # Conversion factor FROM the base currency (FCFA) TO each listed currency —
    # e.g. amount_in_usd = amount_in_fcfa * exchange_rates["USD"]. Approximate,
    # point-in-time rates; update periodically (NGN especially is volatile).
    exchange_rates = Column(
        JSON,
        default={"FCFA": 1, "USD": 0.00164, "EUR": 0.00152, "NGN": 2.6},
    )
    social_links = Column(JSON, default={"whatsapp": "", "facebook": "", "youtube": ""})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

