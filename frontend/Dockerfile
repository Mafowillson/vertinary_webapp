# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# npm ci is strict about lockfile completeness, and this tree's nested esbuild
# (pulled in by vitest's own vite dependency, range "^0.27.0 || ^0.28.0") gets
# resolved to a slightly different version on each `npm install` run depending
# on host platform, leaving cross-platform optional entries incomplete for a
# strict `npm ci` check on Linux. `npm install` still uses the lockfile as a
# strong hint but re-resolves what's missing instead of hard-failing.
RUN npm install --no-audit --no-fund
COPY . .
# Relative path: nginx same-origin-proxies /api, so this never needs to change
# between IP-only access today and a real domain later.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- serve stage ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q -O- http://localhost/ >/dev/null || exit 1

EXPOSE 80
