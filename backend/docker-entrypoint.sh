#!/bin/sh
set -e

# Idempotent: creates tables + seeds the default admin/site-config if missing.
# app.main also runs create_all + the ensure_* column-sync helpers at import
# time regardless, so schema setup happens twice on cold start — harmless.
python scripts/init_db.py

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers "${UVICORN_WORKERS:-2}"
