FROM node:22-alpine AS builder

WORKDIR /app
COPY . .

RUN apk update && apk upgrade
RUN npm install

FROM node:22-alpine

COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json . 
COPY --from=builder /app/package-lock.json . 

EXPOSE 4000

CMD ["node", "src/server.js"]