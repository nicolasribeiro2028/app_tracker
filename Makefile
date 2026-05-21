.PHONY: dev backend frontend install

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

backend:
	cd backend && uvicorn main:app --reload --port 8080

frontend:
	cd frontend && npm run dev

dev:
	@echo "Start the backend in one terminal:  make backend"
	@echo "Start the frontend in another:      make frontend"
