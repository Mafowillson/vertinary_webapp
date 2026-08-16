from pydantic import BaseModel, ConfigDict, field_validator, model_validator
from typing import Dict, Optional, Any


class SiteConfigResponse(BaseModel):
    """camelCase keys for frontend AppContext (socialLinks, siteName, currencySymbol)."""

    model_config = ConfigDict(from_attributes=True)

    siteName: str
    currency: str
    currencySymbol: str
    exchangeRates: Dict[str, float]
    socialLinks: Dict[str, str]

    @model_validator(mode="before")
    @classmethod
    def from_orm(cls, data: Any) -> Any:
        if isinstance(data, dict):
            return data
        if hasattr(data, "site_name"):
            links = dict(data.social_links or {})
            rates = dict(data.exchange_rates or {})
            return {
                "siteName": data.site_name,
                "currency": data.currency,
                "currencySymbol": data.currency_symbol,
                "exchangeRates": rates,
                "socialLinks": links,
            }
        return data


class SocialLinksUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    whatsapp: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None


class ExchangeRatesUpdate(BaseModel):
    """
    Conversion factor FROM the base currency (FCFA) TO each currency —
    e.g. USD=0.00164 means 1 FCFA = 0.00164 USD. FCFA itself is always 1 and
    isn't editable here.
    """

    model_config = ConfigDict(populate_by_name=True)

    USD: Optional[float] = None
    EUR: Optional[float] = None
    NGN: Optional[float] = None

    @field_validator("USD", "EUR", "NGN")
    @classmethod
    def rate_must_be_positive(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value <= 0:
            raise ValueError("Exchange rate must be a positive number")
        return value
