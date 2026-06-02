.PHONY: dev backend frontend install

install:
	python3 -m venv backend/.venv
	backend/.venv/bin/pip install --upgrade pip -q
	backend/.venv/bin/pip install -r backend/requirements.txt
	cd frontend && npm install

backend:
	cd backend && .venv/bin/uvicorn main:app --reload --port 8080

frontend:
	cd frontend && npm run dev

dev:
	@echo "Start the backend in one terminal:  make backend"
	@echo "Start the frontend in another:      make frontend"
