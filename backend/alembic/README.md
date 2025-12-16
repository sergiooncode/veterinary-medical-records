# Database Migrations with Alembic

This directory contains Alembic migration scripts for managing database schema changes.

## Usage

### Running Migrations

To apply all pending migrations:
```bash
make migrate
```

Or manually:
```bash
docker exec veterinary-backend sh -c "cd /app/backend && alembic upgrade head"
```

### Creating a New Migration

To create a new migration based on model changes:
```bash
make migrate-create MESSAGE="add new field to document"
```

Or manually:
```bash
docker exec veterinary-backend sh -c "cd /app/backend && alembic revision --autogenerate -m 'add new field to document'"
```

### Checking Migration Status

To see the current migration version:
```bash
make migrate-current
```

To see migration history:
```bash
make migrate-history
```

### Rolling Back

To rollback to a previous version:
```bash
docker exec veterinary-backend sh -c "cd /app/backend && alembic downgrade -1"
```

To rollback to a specific revision:
```bash
docker exec veterinary-backend sh -c "cd /app/backend && alembic downgrade <revision_id>"
```

## Important Notes

- Always review auto-generated migrations before applying them
- Test migrations in a development environment first
- Keep migrations small and focused on a single change when possible
- Never edit existing migration files that have been applied to production


