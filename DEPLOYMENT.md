# giftfactory-web — deployment

Next.js 15 standalone app. Same deployment model as **giftfactory-franchise** and **giftfactory-superadmin**.

## Health (ALB / ECS)

| Path | Use |
|------|-----|
| `/api/health/live` | Liveness (Docker + ALB) |
| `/api/health/ready` | Checks upstream API `GET /api/v1/health/live` |
| `/api/health` | Basic status |

## Network

- `HOSTNAME=0.0.0.0` in Dockerfile (Next.js standalone)
- Port **3000**

## Build-time vs runtime env

| Type | Variables | Set in |
|------|-----------|--------|
| **Build** (baked into JS) | `NEXT_PUBLIC_*` | Docker `ARG` / GitHub `build-args` |
| **Runtime** (server) | `APP_ENV`, `PORT`, `HOSTNAME` | Docker runner `ENV` / ECS task |

### Build-time (`NEXT_PUBLIC_*`)

| Variable | Development | Production |
|----------|-------------|------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://dev-api.ezzme.com/api/v1` | `https://api.ezzme.com/api/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://dev-giftfactory.ezzme.com` | `https://giftfactory.ezzme.com` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | GitHub secret (optional) | GitHub secret |

`NEXT_PUBLIC_API_URL` is set to the same value as `NEXT_PUBLIC_API_BASE_URL` for compatibility.

### ECR image tags

| Tag | Environment |
|-----|-------------|
| `dev-latest` | Development |
| `prod-latest` | Production |

ECS task definitions must use the matching tag (`dev-latest` / `prod-latest`), not a single `latest`.

## GitHub Actions

`.github/workflows/deploy.yml` in **this repo**:

- Push to **`dev`** → build `dev-latest`, deploy `giftfactory-web-development`
- Push to **`main`** → build `prod-latest`, deploy `giftfactory-web-production`

Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

Post-deploy: workflow curls `/api/health/live` and `/api/health/ready`.

Expected ECS services (Terraform): `giftfactory-web-development`, `giftfactory-web-production`

## Prometheus / Grafana

Not applicable to this frontend. Metrics come from **giftfactory-api**.
