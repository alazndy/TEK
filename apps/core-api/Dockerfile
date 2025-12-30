FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Pruner stage
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@t-ecosystem/core-api --docker

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN pnpm turbo run build --filter=@t-ecosystem/core-api

# Runner stage
FROM base AS runner
WORKDIR /app

COPY --from=builder /app .

CMD ["node", "apps/core-api/dist/main"]
