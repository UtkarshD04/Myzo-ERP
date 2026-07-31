# Build context is the repo root (both Backend/ and Frontend/ are visible
# here), so every COPY source below is prefixed with Backend/.

FROM node:20-alpine

WORKDIR /app

COPY Backend/package.json Backend/package-lock.json ./
RUN npm ci --omit=dev

COPY Backend/ ./

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
