#!/usr/bin/env bash

ARTIFACT_VERSION=$(jq -r '.version' ./package.json)
ARTIFACT_IMAGE_TAG=$(jq -r '.description' ./package.json)

# Docker Build
docker buildx build \
  --build-arg ARTIFACT_VERSION="${ARTIFACT_VERSION}" \
  --cache-from "${ARTIFACT_IMAGE_TAG}":latest \
  --tag "$ARTIFACT_IMAGE_TAG":"${ARTIFACT_VERSION}" \
  ./context

RESULT=$?
exit $RESULT
