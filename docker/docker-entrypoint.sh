#!/usr/bin/env sh

cd /app || exit 1

if [ -n "$CONFIG_FILE" ]; then
  HOME_ASSISTANT_URL=$(jq -r --arg defValue "$HOME_ASSISTANT_URL" '.homeAssistantUrl // $defValue' "$CONFIG_FILE")
  HOME_ASSISTANT_ACCESS_TOKEN=$(jq -r --arg defValue "$HOME_ASSISTANT_ACCESS_TOKEN" '.homeAssistantAccessToken // $defValue' "$CONFIG_FILE")
  HOME_ASSISTANT_CLIENT_CONFIG=${HOME_ASSISTANT_CLIENT_CONFIG:-"{}"}
  HOME_ASSISTANT_CLIENT_CONFIG=$(jq -r --argjson defValue "$HOME_ASSISTANT_CLIENT_CONFIG" '.homeAssistantClientConfig // $defValue' "$CONFIG_FILE")
  export HOME_ASSISTANT_URL HOME_ASSISTANT_ACCESS_TOKEN HOME_ASSISTANT_CLIENT_CONFIG
fi

npx matterbridge -add matterbridge-home-assistant
npx matterbridge -bridge -docker
