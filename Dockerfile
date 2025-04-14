FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN apk update && apk upgrade && npm install

# 이후 소스 복사
COPY . .

# --- 실행용 스테이지 ---
FROM node:22-alpine

WORKDIR /app

# node_modules까지 복사해야 함
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

EXPOSE 4000

CMD ["node", "src/server.js"]
