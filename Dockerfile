FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Stage 1: Prune
FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Stage 2: Server Production
FROM base AS server-prod
WORKDIR /app
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

EXPOSE 4000
CMD ["node", "packages/server/dist/index.js"]

# Stage 3: Client Production (Nginx)
FROM nginx:alpine AS client-prod
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
