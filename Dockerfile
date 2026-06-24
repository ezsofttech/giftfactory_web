# syntax=docker/dockerfile:1

# --- Build: NEXT_PUBLIC_* must be set here (baked into the Next.js client bundle) ---
FROM --platform=linux/amd64 node:20-alpine AS build
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG NEXT_PUBLIC_BASE_URL_LOCAL
ARG APP_ENV=production

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-$NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-$NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_BASE_URL_LOCAL=${NEXT_PUBLIC_BASE_URL_LOCAL:-$NEXT_PUBLIC_API_BASE_URL}
ENV APP_ENV=$APP_ENV

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime: server-side env (health checks, SSR, NextAuth) ---
FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache wget

ARG APP_ENV=production
ENV APP_ENV=$APP_ENV
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health/live || exit 1

CMD ["node", "server.js"]
