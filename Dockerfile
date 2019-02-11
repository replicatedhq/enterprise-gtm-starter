FROM node:8-alpine as build
RUN mkdir /app
WORKDIR /app
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm install --pure-lockfile
ENV NODE_ENV=production

ADD . /app
RUN npm run tslint
RUN npm run test
RUN npx tsc --project .
RUN npm run build-fe

FROM node:8-alpine

RUN mkdir -p /app
RUN mkdir -p /run/nginx
WORKDIR /app
RUN apk add --no-cache ca-certificates nginx
COPY nginx-server.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /app/build
COPY --from=build /app/tsc-out /app/tsc-out
COPY --from=build /app/node_modules /app/node_modules

CMD ["node", "/app/tsc-out/server/index.js"]
