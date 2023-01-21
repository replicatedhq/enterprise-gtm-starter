.PHONY: fmt
fmt:
	cd frontend && npx prettier --write "src//**/*.{js,css}"
	go fmt ./cmd/...
	go fmt ./pkg/...

build-fe: frontend/*
	cd frontend && npm run build

dev-fe:
	cd frontend && npm run start
	
serve: build-fe
	go run ./cmd/enterprise-gtm-starter
