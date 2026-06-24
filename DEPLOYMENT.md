# giftfactory-web — deployment

Customer storefront (Next.js 15 standalone). Same deployment model as **giftfactory-franchise** and **giftfactory-superadmin**.

## Health (ALB / ECS / observability)

| Path | Use |
|------|-----|
| `/api/health/live` | Liveness (Docker + ALB + ECS task health) |
| `/api/health/ready` | Checks upstream API `GET /api/v1/health/live` |
| `/api/health` | Basic status + `APP_ENV` |

Port **3000** · `HOSTNAME=0.0.0.0`

## Build-time vs runtime env

| Type | Variables | Set in |
|------|-----------|--------|
| **Build** (baked into JS) | `NEXT_PUBLIC_*` | Docker `ARG` / GitHub `build-args` |
| **Runtime** (server) | `APP_ENV`, `PORT`, `HOSTNAME`, `AUTH_SECRET`, `NEXTAUTH_URL` | ECS task definition |

### Build-time (`NEXT_PUBLIC_*`)

| Variable | Development | Production |
|----------|-------------|------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://dev-api.ezzme.com/api/v1` | `https://api.ezzme.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | `https://dev-giftfactory.ezzme.com` | `https://giftfactory.ezzme.com` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | GitHub secret | GitHub secret |

### Runtime secrets (ECS task — not in Docker image)

| Variable | Example |
|----------|---------|
| `AUTH_SECRET` | NextAuth secret (min 32 chars) |
| `NEXTAUTH_URL` | `https://giftfactory.ezzme.com` |
| `AWS_PREFIX_URL` | CloudFront CDN prefix |

## ECR image tags

| Tag | Environment |
|-----|-------------|
| `dev-latest` | Development (**required** — ECS pulls this tag) |
| `prod-latest` | Production |

> **Important:** The AWS console default push uses `:latest`, but ECS task definitions use **`dev-latest`** (development) or **`prod-latest`** (production). Pushing only `:latest` causes `CannotPullContainerError: ... dev-latest: not found`.

### Manual ECR push (correct tags)

```bash
export AWS_REGION=ap-south-1
export ECR_ACCOUNT_ID=354130615738   # your AWS account
REGISTRY="${ECR_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

cd giftfactory_web
./build-and-push-ecr.sh
# Pushes :dev-latest (and :latest as alias for development)
```

### Already pushed `:latest` only? (quick fix, no rebuild)

```bash
chmod +x scripts/retag-ecr-dev-latest.sh
AWS_PROFILE=giftfactory ECR_ACCOUNT_ID=354130615738 ./scripts/retag-ecr-dev-latest.sh

aws ecs update-service \
  --cluster giftfactory-cluster \
  --service giftfactory-web-development \
  --force-new-deployment \
  --region ap-south-1
```

## GitHub Actions

`.github/workflows/deploy.yml` in **this repo**:

- Push to **`dev`** → build `dev-latest`, deploy `giftfactory-web-development`
- Push to **`main`** → build `prod-latest`, deploy `giftfactory-web-production`
- Post-deploy: curls `/api/health/live` and `/api/health/ready`
- Rollback on ECS `services-stable` timeout

Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`

ECS cluster: `giftfactory-cluster` (Terraform-managed)

## Prometheus / Grafana

Frontend HTTP metrics are not exported. Use:

- **ALB** target health (`/api/health/live`, matcher `200`)
- **CloudWatch** ECS CPU panels in Grafana (`giftfactory-overview` dashboard)
- **GitHub Actions** post-deploy health verification

API business metrics come from **giftfactory-api** Prometheus scrape.
