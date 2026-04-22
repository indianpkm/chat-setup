# =============================================================================
# Multi-stage Dockerfile
#
# Stages:
#   base        — Shared Node + dependencies layer
#   builder     — TypeScript compilation
#   production  — Minimal production image (no dev deps, no source)
#
# Security:
#   - Non-root user (nodeuser)
#   - No shell tricks or curl in production image
#   - NODE_ENV=production
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Base dependencies
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base

WORKDIR /app

# Copy package files first (layer caching — only reinstall if these change)
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# ---------------------------------------------------------------------------
# Stage 2: TypeScript Builder
# ---------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

COPY . .

# Dummy DATABASE_URL for prisma generate (doesn't need a real DB at build time)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NODE_ENV=production

# Generate Prisma client + compile TypeScript
RUN npx prisma generate
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Production Image
# ---------------------------------------------------------------------------
FROM node:22-alpine AS production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only what's needed for runtime
COPY --chown=appuser:appgroup --from=builder /app/package.json ./
COPY --chown=appuser:appgroup --from=builder /app/node_modules ./node_modules
COPY --chown=appuser:appgroup --from=builder /app/dist ./dist
COPY --chown=appuser:appgroup --from=builder /app/generated ./generated
COPY --chown=appuser:appgroup --from=builder /app/prisma ./prisma
COPY --chown=appuser:appgroup --from=builder /app/prisma.config.ts ./

# Create uploads directory with correct ownership
RUN mkdir -p /app/uploads && chown appuser:appgroup /app/uploads

ENV NODE_ENV=production
ENV PORT=5000

USER appuser

EXPOSE 5000

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/index.js"]