#!/bin/bash
# Build giftfactory (frontend) Docker image and push to AWS ECR
# Uses AWS profile: giftfactory
# Registry: 354130615738.dkr.ecr.ap-south-1.amazonaws.com
#
# NEXT_PUBLIC_* vars are baked at build time by Next.js.
# This script reads them from .env (if present) and passes as --build-arg.

set -e

AWS_PROFILE="${AWS_PROFILE:-giftfactory}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
ECR_REGISTRY="354130615738.dkr.ecr.ap-south-1.amazonaws.com"
IMAGE_NAME="giftfactory-frontend"

# Load NEXT_PUBLIC_* vars from .env file if it exists.
# NOTE: Only NEXT_PUBLIC_* vars are loaded — other vars like AUTH_SECRET are
# intentionally excluded. Runtime secrets must be set in the ECS task definition.
if [ -f .env ]; then
  echo "Loading NEXT_PUBLIC_* vars from .env..."
  # Load and export each line properly to handle special characters
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    # Only export NEXT_PUBLIC_* variables
    if [[ $key == NEXT_PUBLIC_* ]]; then
      # Remove quotes if present and export
      value=$(echo "$value" | sed -e 's/^["'\'']//' -e 's/["'\'']$//')
      export "$key=$value"
      echo "Loaded: $key"
    fi
  done < .env
fi

# Require the critical public vars
NEXT_PUBLIC_BASE_URL_LOCAL="${NEXT_PUBLIC_BASE_URL_LOCAL:?'ERROR: NEXT_PUBLIC_BASE_URL_LOCAL is not set. Set it in .env or as a shell env var.'}"
NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-$NEXT_PUBLIC_BASE_URL_LOCAL}"
NEXT_PUBLIC_RAZORPAY_KEY_ID="${NEXT_PUBLIC_RAZORPAY_KEY_ID:?'ERROR: NEXT_PUBLIC_RAZORPAY_KEY_ID is not set. Set it in .env or as a shell env var.'}"

echo "Using AWS profile: $AWS_PROFILE"
echo "Region: $AWS_REGION"
echo "NEXT_PUBLIC_BASE_URL_LOCAL: $NEXT_PUBLIC_BASE_URL_LOCAL"
echo "NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"
echo "NEXT_PUBLIC_RAZORPAY_KEY_ID: $NEXT_PUBLIC_RAZORPAY_KEY_ID"

# 1. Authenticate Docker to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region "$AWS_REGION" --profile "$AWS_PROFILE" \
  | docker login --username AWS --password-stdin "$ECR_REGISTRY"

# 2. Build the image for Linux (ECS/EC2 compatible)
# NEXT_PUBLIC_* vars are passed as build args so Next.js bakes them into the bundle
echo "Building Docker image: $IMAGE_NAME (linux/amd64)..."
echo "Build args:"
echo "  NEXT_PUBLIC_BASE_URL_LOCAL=$NEXT_PUBLIC_BASE_URL_LOCAL"
echo "  NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL"
echo "  NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID"

docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_BASE_URL_LOCAL="$NEXT_PUBLIC_BASE_URL_LOCAL" \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID="$NEXT_PUBLIC_RAZORPAY_KEY_ID" \
  --build-arg NODE_ENV=production \
  --no-cache \
  -t "$IMAGE_NAME" .

# 3. Tag for ECR
echo "Tagging image..."
docker tag "$IMAGE_NAME:latest" "$ECR_REGISTRY/$IMAGE_NAME:latest"

# 4. Push to ECR
echo "Pushing to ECR..."
docker push "$ECR_REGISTRY/$IMAGE_NAME:latest"

echo "Done. Image pushed to $ECR_REGISTRY/$IMAGE_NAME:latest"
echo ""
echo "ECS: Use container port 3000; ALB health check path: / (Next.js root)."
echo ""
echo "IMPORTANT: Set these runtime environment variables in your ECS Task Definition:"
echo "  - AUTH_SECRET (NextAuth secret, min 32 chars)"
echo "  - NEXTAUTH_URL (e.g., https://giftfactory.com)"
echo "  - AWS_PREFIX_URL (CloudFront URL: https://d3ori68ve27vyu.cloudfront.net)"
echo ""
echo "These vars are NOT in the Docker image for security reasons."
