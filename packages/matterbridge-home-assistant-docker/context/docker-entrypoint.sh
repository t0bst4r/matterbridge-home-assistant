#!/usr/bin/env bash

cd /app || exit 1

matterbridge -add matterbridge-home-assistant

MATTERBRIDGE_OPTIONS=("-bridge" "-docker" "-logger $LOG_LEVEL" "-frontend $FRONTEND_PORT" "-port $MATTER_PORT")

if [ "$SSL" = "true" ]; then
  MATTERBRIDGE_OPTIONS+=("-ssl")
fi

matterbridge "${MATTERBRIDGE_OPTIONS[@]}"
