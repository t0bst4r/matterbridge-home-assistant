#!/usr/bin/env bash

cd /app || exit 1

matterbridge -add matterbridge-home-assistant

MATTERBRIDGE_OPTIONS=("-bridge" "-docker" "-ssl" "-logger $LOG_LEVEL" "-frontend $FRONTEND_PORT" "-port $MATTER_PORT")

matterbridge "${MATTERBRIDGE_OPTIONS[@]}"
