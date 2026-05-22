# ── Etapa 1: Build ──────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_GATEWAY_URL=http://localhost:8080
ARG VITE_NOTIFICATION_WS_URL=http://localhost:8085/ws

ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL
ENV VITE_NOTIFICATION_WS_URL=$VITE_NOTIFICATION_WS_URL

RUN npm run build

# ── Etapa 2: Runtime ─────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Copiem configurarea Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiem fișierele statice build-uite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
