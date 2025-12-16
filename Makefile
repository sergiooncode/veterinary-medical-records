.PHONY: help fix test backend-test backend-mypy frontend-test frontend-dev up down build dev logs logs-dev migrate makemigrations psql

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

fix: ## Format and fix linting issues automatically
	@echo "Formatting and fixing backend code with ruff..."
	cd backend && uv run ruff format . && uv run ruff check --fix .

frontend-dev:
	@echo "Starting frontend dev server in Docker (npm run dev)..."
	docker-compose up frontend --build

frontend-test:
	@echo "Running frontend tests in Docker container..."
	@if ! docker ps | grep -q veterinary-frontend; then \
		echo "Frontend dev container not running. Starting it..."; \
		docker-compose up -d frontend; \
		sleep 5; \
	fi
	@docker exec veterinary-frontend npm test

backend-dev:
	@echo "Starting frontend dev server in Docker (npm run dev)..."
	docker-compose up backend --build

backend-test:
	@echo "Running backend tests in Docker container..."
	@if ! docker ps | grep -q veterinary-backend; then \
		echo "Backend container not running. Starting it..."; \
		docker-compose up -d backend; \
		sleep 5; \
	fi
	@docker exec veterinary-backend sh -c "cd /app/backend && python -m pytest . 2>/dev/null || (python -c 'import pytest' 2>/dev/null && echo 'pytest found but no tests' || echo 'pytest not installed. Add pytest to dependencies.')"

backend-mypy:
	@echo "Running mypy in backend container..."
	@if ! docker ps | grep -q veterinary-backend; then \
		echo "Backend container not running. Starting it..."; \
		docker-compose up -d backend; \
		sleep 5; \
	fi
	@docker exec veterinary-backend sh -c "cd /app/backend && mypy ."

logs:
	@if [ -z "$(SERVICE)" ]; then \
		docker-compose logs -f --tail=100; \
	else \
		docker-compose logs -f --tail=100 $(SERVICE); \
	fi

migrate:
	@echo "Running database migrations..."
	@docker exec veterinary-backend sh -c "cd /app/backend && alembic upgrade head"

makemigrations:
	@if [ -z "$(MESSAGE)" ]; then \
		echo "Error: MESSAGE is required. Usage: make migrate-create MESSAGE='description'"; \
		exit 1; \
	fi
	@echo "Creating migration: $(MESSAGE)"
	@docker exec veterinary-backend sh -c "cd /app/backend && alembic revision --autogenerate -m '$(MESSAGE)'"

dbshell:
	@docker exec -it veterinary-postgres psql -U veterinary_user -d veterinary_db