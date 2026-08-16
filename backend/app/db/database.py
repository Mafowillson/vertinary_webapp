from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# PostgreSQL is the supported database (view data in pgAdmin, DBeaver, etc.)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_auth_verification_columns() -> None:
    """Sync auth verification columns for existing PostgreSQL databases."""
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    statements = []

    if "is_verified" not in columns:
        statements.append(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE"
        )
    if "email_verification_token" not in columns:
        statements.append(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR"
        )
    if "email_verification_expires_at" not in columns:
        statements.append(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ"
        )
    if "verification_email_last_sent_at" not in columns:
        statements.append(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_email_last_sent_at TIMESTAMPTZ"
        )

    index_statements = [
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email_verification_token ON users (email_verification_token)",
        "CREATE INDEX IF NOT EXISTS ix_users_is_verified ON users (is_verified)",
    ]

    with engine.begin() as connection:
        for statement in statements + index_statements:
            connection.execute(text(statement))


def ensure_password_reset_columns() -> None:
    """Sync password reset columns for existing PostgreSQL databases."""
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    statements = []

    if "password_reset_token" not in columns:
        statements.append(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR"
        )
    if "password_reset_expires_at" not in columns:
        statements.append(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ"
        )
    if "password_reset_email_last_sent_at" not in columns:
        statements.append(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_email_last_sent_at TIMESTAMPTZ"
        )

    index_statements = [
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_password_reset_token ON users (password_reset_token)",
    ]

    with engine.begin() as connection:
        for statement in statements + index_statements:
            connection.execute(text(statement))


def ensure_preferred_language_column() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "preferred_language" in columns:
        return
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE users ADD COLUMN preferred_language VARCHAR(5) NOT NULL DEFAULT 'en'"
            )
        )


def ensure_exchange_rates_column() -> None:
    inspector = inspect(engine)
    if "site_config" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("site_config")}
    if "exchange_rates" in columns:
        return
    default_rates = '{"FCFA": 1, "USD": 0.00164, "EUR": 0.00152, "NGN": 2.6}'
    with engine.begin() as connection:
        connection.execute(
            text(
                f"ALTER TABLE site_config ADD COLUMN exchange_rates JSON NOT NULL DEFAULT '{default_rates}'::json"
            )
        )


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

