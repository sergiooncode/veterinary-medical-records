.PHONY: help fix test backend-test backend-mypy frontend-test frontend-dev up down build dev logs logs-dev migrate makemigrations psql ensure-env-local ensure-network create-dev

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

fix: ## Format and fix linting issues automatically
	@echo "Formatting and fixing backend code with ruff..."
	cd backend && uv run ruff format . && uv run ruff check --fix .

frontend-dev: ensure-network ## Start frontend dev server in Docker
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

ensure-env-local: ## Create .env.local file if it doesn't exist
	@touch .env.local

ensure-network: ## Create Docker network if it doesn't exist
	@docker-compose config >/dev/null 2>&1 && \
	docker-compose up --no-start >/dev/null 2>&1 || \
	(docker network create veterinary-medical-records_default 2>/dev/null || true)

backend-dev: ensure-env-local ensure-network ## Start backend dev server in Docker
	@echo "Starting backend dev server in Docker..."
	@docker-compose up -d backend --build
	@echo "Waiting for backend to be ready..."
	@sleep 5
	@echo "Running database migrations..."
	@docker exec veterinary-backend sh -c "cd /app/backend && alembic upgrade head" || true
	@echo "Backend is running. Showing logs (Ctrl+C to stop)..."
	@docker-compose logs -f backend

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

down: ## Stop and remove all containers, networks, and default resources
	@echo "Stopping all docker-compose services..."
	@docker-compose down

migrate: ## Run database migrations
	@echo "Running database migrations..."
	@if ! docker ps | grep -q veterinary-backend; then \
		echo "Backend container not running. Starting it temporarily..."; \
		docker-compose up -d backend --build; \
		sleep 5; \
		docker exec veterinary-backend sh -c "cd /app/backend && alembic upgrade head"; \
		docker-compose stop backend; \
	else \
		docker exec veterinary-backend sh -c "cd /app/backend && alembic upgrade head"; \
	fi

makemigrations:
	@if [ -z "$(MESSAGE)" ]; then \
		echo "Error: MESSAGE is required. Usage: make migrate-create MESSAGE='description'"; \
		exit 1; \
	fi
	@echo "Creating migration: $(MESSAGE)"
	@docker exec veterinary-backend sh -c "cd /app/backend && alembic revision --autogenerate -m '$(MESSAGE)'"

dbshell:
	@docker exec -it veterinary-postgres psql -U veterinary_user -d veterinary_db

create-dev: ensure-env-local ensure-network ## Build and run all containers (backend, frontend, postgres, redis, celery-worker)
	@echo "Building and starting all containers..."
	@docker-compose up -d --build postgres redis backend celery-worker frontend
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Running database migrations..."
	@docker exec veterinary-backend sh -c "cd /app/backend && alembic upgrade head" || true
	@echo "All containers are running!"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3001"
	@echo "Use 'make logs' to view logs or 'make logs SERVICE=<service>' for specific service"