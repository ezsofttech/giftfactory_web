# Multi-stage build for giftfactory (Next.js)
# Linux platform for ECS/EC2 compatibility
FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

# Build-time env vars for NEXT_PUBLIC_* (baked into JS bundle by Next.js)
ARG NEXT_PUBLIC_BASE_URL_LOCAL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG NODE_ENV=production
ENV NEXT_PUBLIC_BASE_URL_LOCAL=$NEXT_PUBLIC_BASE_URL_LOCAL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NODE_ENV=$NODE_ENV

# Copy application files
COPY . .

# Build the application with verbose logging
RUN echo "Building with NEXT_PUBLIC_BASE_URL_LOCAL=$NEXT_PUBLIC_BASE_URL_LOCAL" && \
    echo "Building with NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL" && \
    echo "Building with NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID" && \
    npm run build

# Production stage
FROM --platform=linux/amd64 node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy standalone output and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# ECS/container health check (ALB target group)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:3000/', (r) => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
