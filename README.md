# MatchaTaxa Development Guide

## Commands
- **Run app**: `flask run --host 0.0.0.0`
- **Start services**: `docker-compose up`
- **Database migrations**:
  - Create: `flask makemigrations <message>`
  - Apply: `flask migrate`
- **Production server**: `gunicorn --bind 0.0.0.0:8001 wsgi:app`

## Code Style
- **Imports**: Group by 1) standard library, 2) third-party, 3) local
- **Naming**: PascalCase for classes, snake_case for functions/variables
- **Type annotations**: Use SQLAlchemy Mapped types
  ```python
  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str] = mapped_column(String(500))
  ```
- **Indentation**: 4 spaces
- **Error handling**: Use appropriate exception classes, log errors

## Architecture
- Flask web application with SQLAlchemy ORM
- PostgreSQL database with Alembic migrations
- Docker containerization for development/deployment

## Frontend
- papaparse
- w2ui
