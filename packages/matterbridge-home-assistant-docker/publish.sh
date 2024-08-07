#!/usr/bin/env bash
# shellcheck disable=SC2269

# ${{ github.server_url }}/${{ github.repository }}
GITHUB_REPO_URL="${GITHUB_REPO_URL}"
# ${{ github.run_id }}
GITHUB_RUN_ID="${GITHUB_RUN_ID}"
# ${{ github.run_attempt }}
GITHUB_RUN_ATTEMPT="${GITHUB_RUN_ATTEMPT}"

# e.g. /tmp/.docker-cache
DOCKER_LOCAL_CACHE_FROM="${DOCKER_LOCAL_CACHE_FROM}"
DOCKER_LOCAL_CACHE_TO="${DOCKER_LOCAL_CACHE_TO}"
# e.g. linux/amd64,linux/arm/v7,linux/arm64/v8
DOCKER_PLATFORM="${DOCKER_PLATFORM}"

ARTIFACT_VERSION=$(jq -r '.version' ./package.json)
ARTIFACT_IMAGE_TAG=$(jq -r '.description' ./package.json)
BUILDER_ID="${GITHUB_REPO_URL}/actions/runs/${GITHUB_RUN_ID}/attempts/${GITHUB_RUN_ATTEMPT}"

# Docker Build
docker buildx build \
  --build-arg ARTIFACT_VERSION="${ARTIFACT_VERSION}" \
  --cache-from "${ARTIFACT_IMAGE_TAG}":latest \
  --cache-from type=local,src="${DOCKER_LOCAL_CACHE_FROM}" \
  --cache-to type=local,mode=max,dest="${DOCKER_LOCAL_CACHE_TO}" \
  --platform "${DOCKER_PLATFORM}" \
  --attest type=provenance,mode=max,builder-id="${BUILDER_ID}" \
  --tag "${ARTIFACT_IMAGE_TAG}":"${ARTIFACT_VERSION}" \
  --tag "${ARTIFACT_IMAGE_TAG}":latest \
  --push \
  ./context

RESULT=$?
exit $RESULT
