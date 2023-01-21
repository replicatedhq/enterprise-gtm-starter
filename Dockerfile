FROM node:alpine as frontend
WORKDIR /app
COPY frontend/package.json /app
COPY frontend/package-lock.json /app
RUN npm install
COPY frontend /app
RUN npm run build
ENTRYPOINT "/bin/sh"


# syntax=docker/dockerfile:1.4
FROM cgr.dev/chainguard/go:latest as build

WORKDIR /work

COPY go.mod /work
COPY go.sum /work
RUN go mod download
COPY ./cmd /work/cmd
COPY ./pkg /work/pkg

RUN go build -o enterprise-gtm-starter ./cmd/enterprise-gtm-starter

FROM cgr.dev/chainguard/static:latest

COPY --from=build /work/enterprise-gtm-starter /enterprise-gtm-starter
COPY --from=frontend /app/build /frontend
CMD ["/enterprise-gtm-starter"]