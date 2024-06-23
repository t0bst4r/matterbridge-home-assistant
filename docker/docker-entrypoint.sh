#!/usr/bin/env sh

cd /app || exit 1

if [ -n "$CONFIG_FILE" ]; then
  HOME_ASSISTANT_URL=$(jq -r --arg defValue "$HOME_ASSISTANT_URL" '.homeAssistantUrl // $defValue' "$CONFIG_FILE")
  HOME_ASSISTANT_ACCESS_TOKEN=$(jq -r --arg defValue "$HOME_ASSISTANT_ACCESS_TOKEN" '.homeAssistantAccessToken // $defValue' "$CONFIG_FILE")
  HOME_ASSISTANT_CLIENT_CONFIG=${HOME_ASSISTANT_CLIENT_CONFIG:-"{}"}
  HOME_ASSISTANT_CLIENT_CONFIG=$(jq -r --argjson defValue "$HOME_ASSISTANT_CLIENT_CONFIG" '.homeAssistantClientConfig // $defValue' "$CONFIG_FILE")
  export HOME_ASSISTANT_URL HOME_ASSISTANT_ACCESS_TOKEN HOME_ASSISTANT_CLIENT_CONFIG
fi

# Workaround to fix https://github.com/t0bst4r/matterbridge-home-assistant/issues/115
if grep -q /app/node_modules/matterbridge-home-assistant ~/.matterbridge/storage/.matterbridge/*; then
  sed -i 's/\/app\/node_modules\/matterbridge-home-assistant/\/usr\/local\/lib\/node_modules\/matterbridge-home-assistant/g' ~/.matterbridge/storage/.matterbridge/*
fi

matterbridge -add matterbridge-home-assistant
matterbridge -bridge -docker
