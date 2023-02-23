.PHONY: fmt
fmt:
	cd frontend && npx prettier --write "src/*.{js,css}"
	go fmt ./cmd/...
	go fmt ./pkg/...

.PHONY: dev-fe
dev-fe:
	cd frontend && npm run start

.PHONY: check-env
check-env:
	: REPLICATED_API_TOKEN
	@if [ -z "${REPLICATED_API_TOKEN}" ]; then exit 1; fi
	: ✅
	: REPLICATED_APP
	@if [ -z "${REPLICATED_APP}" ]; then exit 1; fi
	: ✅

.PHONY: serve
serve: check-env
	go run ./cmd/enterprise-gtm-starter

.PHONY: helm-release-dev
helm-release-dev:
	helm dependency update
	helm package -d manifests .
	replicated release create --auto -y

.PHONY: test
test:
	go test ./...

.PHONY: vet
vet:
	go vet ./...

.PHONY: vet
lint:
	replicated release lint --yaml-dir=manifests


.PHONY: pre-push
pre-push: check-env vet test lint
	
.PHONY: pre-push
setup-git-hooks:
	echo "make pre-push" > .git/hooks/pre-push
	chmod +x .git/hooks/pre-push

