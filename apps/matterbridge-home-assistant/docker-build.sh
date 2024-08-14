#!/usr/bin/env bash
set -e

ARTIFACT_VERSION=$(jq -r '.version' ./package.json)
ARTIFACT_IMAGE_TAG=$(jq -r '.docker.tagName' ./package.json)

npm pack --pack-destination ./docker
mv docker/matterbridge-home-assistant-*.tgz docker/artifact.tgz

# Docker Build
docker buildx build \
  --cache-from "${ARTIFACT_IMAGE_TAG}":latest \
  --tag "$ARTIFACT_IMAGE_TAG":"${ARTIFACT_VERSION}" \
  ./docker
