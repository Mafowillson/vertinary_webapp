# Vertinary Website Backend

FastAPI backend for L'Académie DES Éleveurs e-commerce platform.

## Features

- **Authentication**: JWT-based authentication with user roles (user/admin)
- **Products**: CRUD operations for products with search and filtering
- **Orders**: Order management with payment processing
- **Lessons**: Course content (video/audio/PDF) — uploaded per product, streamed in-app to purchasers only, never downloadable
- **Admin Dashboard**: Analytics and management endpoints
- **Configuration**: Site configuration and social links management

## Tech Stack

- **FastAPI**: Modern, fast web framework
- **PostgreSQL**: Relational database
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migrations
- **JWT**: Token-based authentication
- **Pydantic**: Data validation

## Setup

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip

### Installation

1. **Clone the repository and navigate to backend:**

```bash
cd backend
```

2. **Create a virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials (PostgreSQL only — use **pgAdmin 4** or `psql` to inspect data):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vertinary_db
SECRET_KEY=your-secret-key-here-change-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@your-domain.com
VERIFICATION_URL_BASE=http://localhost:5173/verify-email
VERIFICATION_RESEND_COOLDOWN_SECONDS=60
VERIFICATION_EMAIL_MODE=console
```

Do **not** use `sqlite:///...` URLs; the app validates that `DATABASE_URL` is PostgreSQL.

**Email verification:** For local development, set `VERIFICATION_EMAIL_MODE=console` so registration succeeds without SMTP; copy the verification link from the server log. For production, set `VERIFICATION_EMAIL_MODE=smtp`, fill in `SMTP_*`, and use port **587** (STARTTLS) or **465** (SSL). Gmail requires an [app password](https://support.google.com/accounts/answer/185833), not your normal password.

5. **Create the database:**

```bash
createdb vertinary_db
```

Or using PostgreSQL client:

```sql
CREATE DATABASE vertinary_db;
```

6. **Initialize the database:**

```bash
python scripts/init_db.py
```

This will:
- Create all database tables
- Create a default admin user (email: `admin@example.com`, password: `admin123`)
- Create default site configuration

**⚠️ IMPORTANT**: Change the default admin password in production!

7. **Run database migrations (optional, if using Alembic):**

```bash
alembic upgrade head
```

## Running the Server

### Development

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Production

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and send verification email
- `POST /api/auth/verify-email` - Verify email after registration
- `POST /api/auth/resend-verification-email` - Resend verification email (rate-limited)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get all products (with pagination and filters)
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/my-orders` - Get user's orders
- `POST /api/orders/{id}/payment` - Process payment

### Lessons (course content)
- `POST /api/products/{product_id}/lessons` - Upload a lesson file (video/audio/pdf) (admin only)
- `GET /api/products/{product_id}/lessons` - List a product's lessons (public metadata, no file access)
- `PUT /api/products/{product_id}/lessons/{lesson_id}` - Update a lesson's title/description/order (admin only)
- `DELETE /api/products/{product_id}/lessons/{lesson_id}` - Delete a lesson (admin only)
- `POST /api/products/{product_id}/lessons/{lesson_id}/access` - Verify purchase, issue a short-lived streaming token
- `GET /api/products/{product_id}/lessons/{lesson_id}/stream` - Stream the file inline (Range-enabled, token-gated)

### Configuration
- `GET /api/config` - Get site configuration
- `PUT /api/config/social-links` - Update social links (admin only)

### Admin
- `GET /api/admin/analytics` - Get analytics statistics (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)

## Database Models

- **User**: Users with roles (user/admin)
- **Product**: Products with pricing, stock, and metadata
- **Order**: Orders with status and payment information
- **ProductLesson**: Video/audio/PDF content attached to a product, ordered within a course
- **SiteConfig**: Site-wide configuration and settings

## File Uploads (course content)

Lesson files (video/audio/PDF) are stored via the storage abstraction in `app/core/storage.py`. Today only
`local` (the `uploads/` directory, configurable via `UPLOAD_DIR` in `.env`) is implemented — set
`STORAGE_BACKEND=local`. The interface is designed so a future S3-compatible backend (AWS S3, Cloudflare R2,
Backblaze B2) can be dropped in later without changing any caller. Max upload size is controlled by
`MAX_LESSON_FILE_SIZE_MB` (default 1024 = 1GB).

Content is never downloadable: it's streamed in-app to purchasers only, gated by a short-lived signed token
(`MEDIA_TOKEN_EXPIRE_MINUTES`, default 360) issued after verifying the user has a completed order for that product.

Make sure to create the uploads directory:

```bash
mkdir uploads
```

## Security Notes

1. **Change default admin password** in production
2. **Use a strong SECRET_KEY** for JWT tokens
3. **Configure CORS_ORIGINS** properly for your frontend
4. **Use HTTPS** in production
5. **Set proper file permissions** for uploads directory

## Development

### Running Tests

```bash
pytest
```

### Database Migrations

Create a new migration:

```bash
alembic revision --autogenerate -m "Description"
```

Apply migrations:

```bash
alembic upgrade head
```

Rollback:

```bash
alembic downgrade -1
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── lessons.py
│   │   │   ├── orders.py
│   │   │   ├── config.py
│   │   │   └── admin.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── storage.py
│   ├── db/
│   │   └── database.py
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── product_lesson.py
│   │   ├── order.py
│   │   └── config.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── product.py
│   │   ├── lesson.py
│   │   ├── order.py
│   │   └── config.py
│   └── main.py
├── alembic/
├── scripts/
│   └── init_db.py
├── requirements.txt
├── alembic.ini
└── README.md
```

## License

This project is part of the Vertinary Website application.

