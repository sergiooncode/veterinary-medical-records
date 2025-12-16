.PHONY: help fix test backend-test frontend-test frontend-dev up down build dev logs logs-dev migrate makemigrations psql

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

logs: ## Show Docker logs (use SERVICE=name for specific service)
	@if [ -z "$(SERVICE)" ]; then \
		docker-compose logs -f --tail=100; \
	else \
		docker-compose logs -f --tail=100 $(SERVICE); \
	fi