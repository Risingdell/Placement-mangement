# =============================================================
# Makefile — shortcuts for Docker commands
# Usage:  make <target>
# Windows users: install "make" via  winget install GnuWin32.Make
#                or use Git Bash / WSL where make is available
# =============================================================

.PHONY: help up build down restart logs db-shell reset clean

# ── Default target: show help ─────────────────────────────────
help:
	@echo ""
	@echo "  Placement Management System — Docker Commands"
	@echo "  ─────────────────────────────────────────────"
	@echo "  make build    → Build all images + start containers (first time)"
	@echo "  make up       → Start containers (images already built)"
	@echo "  make down     → Stop containers (data preserved)"
	@echo "  make reset    → Stop + wipe DB, then rebuild from scratch"
	@echo "  make restart  → Restart all containers"
	@echo "  make logs     → Tail logs for all services"
	@echo "  make logs-be  → Tail backend logs only"
	@echo "  make logs-fe  → Tail frontend logs only"
	@echo "  make logs-db  → Tail database logs only"
	@echo "  make db-shell → Open MySQL shell inside the DB container"
	@echo "  make clean    → Remove stopped containers + dangling images"
	@echo "  make status   → Show running containers + health status"
	@echo ""

# ── First-time build + start ──────────────────────────────────
build:
	docker-compose up --build -d
	@echo ""
	@echo "  Building... wait ~3-5 min on first run."
	@echo "  App will be available at → http://localhost:3000"
	@echo "  Run 'make logs' to watch startup progress."

# ── Start (images already built) ─────────────────────────────
up:
	docker-compose up -d
	@echo "  Started → http://localhost:3000"

# ── Stop (preserve DB data) ───────────────────────────────────
down:
	docker-compose down

# ── Stop + wipe volumes + rebuild fresh ───────────────────────
reset:
	@echo "  WARNING: This will delete all database data!"
	docker-compose down -v
	docker-compose up --build -d
	@echo "  Fresh start → http://localhost:3000"

# ── Restart all containers ────────────────────────────────────
restart:
	docker-compose restart

# ── Logs ──────────────────────────────────────────────────────
logs:
	docker-compose logs -f

logs-be:
	docker-compose logs -f backend

logs-fe:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f db

# ── Open MySQL shell in the DB container ──────────────────────
db-shell:
	docker exec -it placement_db mysql -u root -p${DB_PASSWORD:-testpass123} placement_management

# ── Show running containers + health ─────────────────────────
status:
	docker-compose ps

# ── Remove stopped containers + dangling images ───────────────
clean:
	docker system prune -f
