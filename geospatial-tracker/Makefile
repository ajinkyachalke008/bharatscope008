.PHONY: setup dev docker test clean status

setup:
	cp .env.example .env
	@echo "Created .env file. Please edit it to add your GEMINI_API_KEY and MAPBOX_TOKEN."

dev-backend:
	cd backend && pip install -r requirements.txt && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm install && npm run dev

dev:
	@echo "Starting both backend and frontend in development mode..."
	# Note: This runs both in the background. For active development, it's better to run them in separate terminal tabs.
	make dev-backend & make dev-frontend & wait

docker:
	docker-compose up --build

stop:
	docker-compose down

clean:
	docker-compose down -v
	rm -rf backend/__pycache__
	rm -rf frontend/node_modules
	rm -rf frontend/dist

status:
	curl -s http://localhost:8000/api/status | json_pp

test-python:
	find backend/ -name "*.py" -exec python -m py_compile {} \;
	@echo "Python syntax check passed."

test-ts:
	cd frontend && npx tsc --noEmit
	@echo "TypeScript check passed."

test: test-python test-ts
	@echo "All static checks passed."
