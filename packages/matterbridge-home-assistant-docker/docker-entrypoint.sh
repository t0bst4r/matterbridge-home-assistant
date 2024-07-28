#!/usr/bin/env bash

cd /app || exit 1

matterbridge -add matterbridge-home-assistant

MATTERBRIDGE_OPTIONS=("-bridge" "-docker" "-logger $LOG_LEVEL")

matterbridge "${MATTERBRIDGE_OPTIONS[@]}"
