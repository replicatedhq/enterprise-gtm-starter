FROM node:alpine as frontend
WORKDIR /app
COPY frontend/package.json /app
COPY frontend/package-lock.json /app
RUN npm install
COPY frontend /app
RUN npm run build


FROM cgr.dev/chainguard/go:latest as build

WORKDIR /work

COPY go.mod /work
COPY go.sum /work
RUN go mod download
COPY ./cmd /work/cmd
COPY ./pkg /work/pkg

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o enterprise-gtm-starter ./cmd/enterprise-gtm-starter \

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o preflight-config ./cmd/preflight-config

FROM cgr.dev/chainguard/static:latest

COPY --from=build /work/enterprise-gtm-starter /enterprise-gtm-starter
COPY --from=build /work/preflight-config /preflight-config
COPY --from=frontend /app/build /frontend
ENV STATIC_DIR="/frontend"
ENV GIN_ADDRESS=":8888"
CMD ["/enterprise-gtm-starter"]