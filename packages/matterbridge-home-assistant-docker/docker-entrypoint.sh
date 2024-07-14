#!/usr/bin/env bash

cd /app || exit 1

if [ ! -f "$MHA_CONFIG_FILE" ]; then
  echo "Matterbridge-Home-Assistant has to be configured by a config file."
  echo "You can configure the config-file location by setting the MHA_CONFIG_FILE environment variable."
  echo "Please see the documentation for further details about the structure of the config file: "
  echo "https://github.com/t0bst4r/matterbridge-home-assistant/tree/-/packages/matterbridge-home-assistant#configuration"
  exit 2
fi

matterbridge -add matterbridge-home-assistant

MATTERBRIDGE_OPTIONS=("-bridge" "-docker")
if [ "$LOG_LEVEL" = "debug" ]; then
  MATTERBRIDGE_OPTIONS+=("-debug")
fi

matterbridge "${MATTERBRIDGE_OPTIONS[@]}"
