#!/bin/bash
# Build giftfactory-web Docker image and push to AWS ECR (giftfactory-cluster stack).
# Uses the same interoperable pattern as franchise/superadmin deploy workflows.

set -e

AWS_REGION="${AWS_REGION:-ap-south-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-giftfactory-web}"
DEPLOY_ENV="${DEPLOY_ENV:-development}"
IMAGE_TAG="${IMAGE_TAG:-$([ "$DEPLOY_ENV" = production ] && echo prod-latest || echo dev-latest)}"
AWS_PROFILE="${AWS_PROFILE:-}"

if [ -n "$AWS_PROFILE" ]; then
  export AWS_PROFILE
fi

if [ -f .env ]; then
  echo "Loading NEXT_PUBLIC_* vars from .env..."
  while IFS='=' read -r key value; do
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    if [[ $key == NEXT_PUBLIC_* ]]; then
      value=$(echo "$value" | sed -e 's/^["'\'']//' -e 's/["'\'']$//')
      export "$key=$value"
      echo "Loaded: $key"
    fi
  done < .env
fi

NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:?'Set NEXT_PUBLIC_API_BASE_URL in .env or shell'}"
NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://dev-giftfactory.ezzme.com}"
NEXT_PUBLIC_RAZORPAY_KEY_ID="${NEXT_PUBLIC_RAZORPAY_KEY_ID:-}"

ACCOUNT_ID="${ECR_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

echo "Region: $AWS_REGION"
echo "Image: $IMAGE_URI"
echo "NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"
echo "NEXT_PUBLIC_SITE_URL: $NEXT_PUBLIC_SITE_URL"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
  --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_SITE_URL" \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID="$NEXT_PUBLIC_RAZORPAY_KEY_ID" \
  --build-arg APP_ENV="$DEPLOY_ENV" \
  -t "$IMAGE_URI" .

docker push "$IMAGE_URI"

# ECS task definitions use dev-latest / prod-latest (not :latest). Publish both for development.
if [ "$IMAGE_TAG" = "dev-latest" ]; then
  docker tag "$IMAGE_URI" "${REGISTRY}/${ECR_REPOSITORY}:latest"
  docker push "${REGISTRY}/${ECR_REPOSITORY}:latest"
  echo "Also pushed :latest (alias for development)"
fi

echo "Done. Image pushed to $IMAGE_URI"
echo ""
echo "ECS: container port 3000; ALB health check path: /api/health/live"
echo "Runtime secrets (ECS task): AUTH_SECRET, NEXTAUTH_URL, AWS_PREFIX_URL"
