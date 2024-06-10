#!/usr/bin/env sh

cd /app || exit 1
npx matterbridge -add ./node_modules/matterbridge-home-assistant
npx matterbridge -bridge
