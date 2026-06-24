#!/bin/bash
# Copy an existing :latest image to :dev-latest (no rebuild).
# Use when ECS fails with "giftfactory-web:dev-latest: not found" after pushing :latest only.
#
# Usage:
#   AWS_PROFILE=giftfactory ./scripts/retag-ecr-dev-latest.sh
#   SOURCE_TAG=latest TARGET_TAG=dev-latest ./scripts/retag-ecr-dev-latest.sh

set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-giftfactory-web}"
SOURCE_TAG="${SOURCE_TAG:-latest}"
TARGET_TAG="${TARGET_TAG:-dev-latest}"

ACCOUNT_ID="${ECR_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Copying ${REGISTRY}/${ECR_REPOSITORY}:${SOURCE_TAG} -> :${TARGET_TAG}"

MANIFEST=$(aws ecr batch-get-image \
  --region "$AWS_REGION" \
  --repository-name "$ECR_REPOSITORY" \
  --image-ids "imageTag=${SOURCE_TAG}" \
  --query 'images[0].imageManifest' \
  --output text)

if [ -z "$MANIFEST" ] || [ "$MANIFEST" = "None" ]; then
  echo "ERROR: No image found with tag ${SOURCE_TAG} in ${ECR_REPOSITORY}"
  exit 1
fi

aws ecr put-image \
  --region "$AWS_REGION" \
  --repository-name "$ECR_REPOSITORY" \
  --image-tag "$TARGET_TAG" \
  --image-manifest "$MANIFEST"

echo "Done. ECS can now pull ${REGISTRY}/${ECR_REPOSITORY}:${TARGET_TAG}"
echo "Force a new deployment:"
echo "  aws ecs update-service --cluster giftfactory-cluster --service giftfactory-web-development --force-new-deployment --region ${AWS_REGION}"
