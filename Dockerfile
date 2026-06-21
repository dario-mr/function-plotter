# build stage
FROM node:24-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# runtime stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Minimal nginx conf for a static SPA
RUN printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '' \
  '  location = /health { add_header Cache-Control "no-store" always; try_files /health.json =404; }' \
  '  location = /info   { add_header Cache-Control "no-store" always; try_files /info.json =404; }' \
  '' \
  '  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; try_files $uri =404; }' \
  '  location = /favicon.svg { add_header Cache-Control "public, max-age=86400"; try_files $uri =404; }' \
  '' \
  '  location / { try_files $uri $uri/ /index.html; }' \
  '}' \
  > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
