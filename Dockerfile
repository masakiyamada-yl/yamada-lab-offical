# yamada-lab-offical コーポレートサイト Docker image
# - Stage 1: Vite + tsx で静的サイトをビルド (dist/)
# - Stage 2: Nginx で静的配信、Cloud Run の PORT env を受ける
# 設計: governance/docs/operations/offical-cloud-run-migration-v0.3.md §2.3

# ---- Stage 1: build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# prebuild (tsx scripts/build-notice.ts → public/notice/*) → vite build → dist/
RUN npm run build

# ---- Stage 2: runtime ----
FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Cloud Run は PORT=8080 を期待 (default)
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
