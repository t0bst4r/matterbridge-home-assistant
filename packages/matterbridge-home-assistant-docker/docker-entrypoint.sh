#!/usr/bin/env bash

cd /app || exit 1

matterbridge -add matterbridge-home-assistant

MATTERBRIDGE_OPTIONS=("-bridge" "-docker")
if [ "$LOG_LEVEL" = "debug" ]; then
  MATTERBRIDGE_OPTIONS+=("-debug")
fi

matterbridge "${MATTERBRIDGE_OPTIONS[@]}"
