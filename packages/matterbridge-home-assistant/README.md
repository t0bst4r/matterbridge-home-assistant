# Matterbridge Home Assistant

---

This **Matterbridge Home Assistant** package provides bindings to
connect [HomeAssistant](https://www.home-assistant.io/) to [Matterbridge](https://github.com/Luligu/matterbridge/).

---

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/t0bst4r)

---

## Breaking Changes: Migrating from 1.x to 2.x

- In version 1.x `matterbridge` was not listed as a `dependencies` or `peerDependency`. This has been changed in version
  2.0.0. It is now listed as a peer dependency.
  When installed in a local `package.json` file, this is not a problem. But since `matterbridge` installs all its
  plugins globally, this will lead to an error running `matterbridge` with `matterbridge-home-assistant`, because of
  npm's "new" (>= 7) strategy for peer-dependencies.
  To solve this, you need to enable [legacy-peer-deps](https://docs.npmjs.com/cli/v10/using-npm/config#legacy-peer-deps)
  in your npm config (`npm config set legacy-peer-deps true`) or in an environment
  variable (`npm_config_legacy_peer_deps=true`). In the pre-built docker image and the native Home Assistant Addon, this
  is already configured.

- In version 1.x this plugin was meant to be configured using multiple environment variables. Due to the growing number 
  of configuration options, this has been changed. This plugin requires to be configured using a configuration JSON file 
  or one single environment variable containing the whole JSON configuration.
  **Please see the [configuration section](#configuration) below.**

## Installation

### Manual Setup

- Follow [those instructions](https://github.com/Luligu/matterbridge/?tab=readme-ov-file#installation) to set
  up `matterbridge`.
- Configure npm to use legacy-peer-deps mode for global packages: `npm config set legacy-peer-deps true`
  or `npm_config_legacy_peer_deps=true`
- Install the plugin `npm install -g matterbridge-home-assistant`
- Make sure the plugin is configured properly (see [Configuration](#configuration)).
- Activate the plugin `matterbridge -add matterbridge-home-assistant`
- Start matterbridge using `matterbridge -bridge`

### Home Assistant Add-On

Follow the [Home Assistant Add-On Repository](https://github.com/t0bst4r/matterbridge-home-assistant-addon) to install
Matterbridge with Home Assistant.

### Custom Docker Deployment

There is a [ready-to-use docker image](https://github.com/t0bst4r?tab=packages&repo_name=matterbridge-home-assistant)
built with this project.

Running it is as easy as starting any other Docker container. Just make sure to run the container with the host network,
since that is required for matter clients to connect.

The docker image is configured using environment variables (see [Configuration](#configuration)).

```bash
# Create a volume to persist the data written by matterbridge (optional)
docker volume create matterbridge-data

# Start the container
docker run -d \
  --network host \
  --volume matterbridge-data:/root/.matterbridge \
  --volume $PWD/config.json:/app/config.json \
  --env MHA_CONFIG_FILE="/app/config.json" \
  --name matterbridge \
  ghcr.io/t0bst4r/matterbridge-home-assistant:latest
```

Or using docker-compose.yaml

```yaml
services:
  matterbridge:
    image: ghcr.io/t0bst4r/matterbridge-home-assistant:latest
    restart: unless-stopped
    network_mode: host
    environment:
      MHA_CONFIG: |
        {
          "homeAssistant": {
            "url": "http://192.168.178.23:8123/",
            "accessToken": "ey....yQ",
            "matcher": {
              "includeDomains": ["light"]
            }
          }
        }
    volumes:
      - data:/root/.matterbridge
volumes:
  data:
```

## Configuration

This package can be configured using a config file or an environment variable. If both are present, the environment
variable will be used.

### Using a file

This package can be configured using a JSON config file. Use the environment variable `MHA_CONFIG_FILE` to point it
to the config file. See [config structure](#config-structure).

### Using an environment variable

This package can be configured using an environment variable. Use the environment variable `MHA_CONFIG` and put the JSON
configuration in it. See [config structure](#config-structure).

### Config structure

```json5
{
  // optional:
  "devices": {
    // optional: override the vendorId for all devices
    "vendorId": 0,
    // optional: override the vendorName for all devices
    "vendorName": "t0bst4r"
  },
  // required:
  "homeAssistant": {
    // required:
    "url": "http://192.168.178.23:8123",
    // required:
    "accessToken": "ey....yQ",
    // optional:
    "matcher": {
      // optional: include all entities of these domains:
      "includeDomains": [
        "light",
      ],
      // optional: include all entities matching these entity_id patterns:
      "includePatterns": [
        "media_player.samsung_tv_*"
      ],
      // optional: exclude all entities of these domains:
      "excludeDomains": [
        "lock",
      ],
      // optional: exclude all entities matching these entity_id patterns:
      "excludePatterns": [
        "media_player.*echo*"
      ]
    }
  }
}
```

**Entities must match any of `includePatterns` or `includeDomains` and must not match any of `excludeDomains`
and `excludePatterns`.**

## Commissioning / Pairing the device with your Matter controller

Start matterbridge and find the commissioning QR code in the logs.
This code can be used to connect your Matter controller (like Alexa, Apple Home or Google Home) to the bridge.

![Matterbridge commissioning code](./docs/matterbridge-commissioning.png)

## Supported Entities

- Light entities (`light.`) including on-off, brightness and hue & saturation control
- Switch entities (`switch.`) including on-off control
- Input-Boolean entities (`input_boolean.`) including on-off control
- Media Players (`media_player.`) are mapped to Switches and currently only support on-off control
- Climate Devices (`climate.`) currently work in progress, not released yet.
- Scenes (`scene.`) are mapped to Switches and currently only support on-off control
- Scripts (`script.`) are mapped to Switches and currently only support on-off control
- Automations (`automation.`) are mapped to Switches and currently only support on-off control

## Frequently Asked Questions

### Why doesn't Matterbridge find new entities which were just added to home assistant?

`matterbridge-home-assistant` scans all entities once during startup and checks their visibility state.
After that it only subscribes to state changes (on-off, color, etc.). Restart Matterbridge to find the new entities
to be added.

### How can I hide entities beside the include/exclude patterns?

`matterbridge-home-assistant` compares entity_ids to the include/exclude patterns and domains, but also considers the
hidden state of an entity (can be found in the entity details in Home Assistant).
Both are only checked once during startup, so changes will apply after restarting Matterbridge.

### Why doesn't Matterbridge remove entities, which I just marked as hidden?

`matterbridge-home-assistant` compares entity_ids to the include/exclude patterns and domains, but also considers the
hidden state of an entity (can be found in the entity details in Home Assistant).
Both are only checked once during startup, so changes will apply after restarting Matterbridge.

## Contribution, Bug Reports and Enhancements

Please head over to the [GitHub Repository](https://github.com/t0bst4r/matterbridge-home-assistant) and review the
README, and its contribution section.
