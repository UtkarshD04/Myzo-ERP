# Build context is the repo root (both Backend/ and Frontend/ are visible
# here), so every COPY source below is prefixed with Frontend/ — plain
# `COPY . .` would pull in Backend/ too and break the "package.json not
# found" lookup since it'd land one directory too shallow.

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci

COPY Frontend/ ./

# Baked into the static bundle at build time — point this at the backend
# service's public URL (e.g. https://erp-api.yourdomain.com/api). Falls back
# to same-origin '/api' (see src/api.js) when left unset.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
