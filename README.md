# Matterbridge Home Assistant

---

This **Matterbridge Home Assistant** package provides bindings to connect [HomeAssistant](https://www.npmjs.com/package/home-assistant-js-websocket) to [Matterbridge](https://github.com/Luligu/matterbridge/).

## Breaking Changes

### Switching from Version 1.x to 2.0.0

In version 1.x `matterbridge` was not listed as a `dependencies` or `peerDependency`.
This has been changed in version 2.0.0. It is now listed as a peer dependency.

When installed in a local `package.json` file, this is not a problem.
But since `matterbridge` installs all its plugins globally, this will lead to an error running `matterbridge` with 
`matterbridge-home-assistant`, bacause of npm's `new` (>= 7) strategy for peer-dependencies.

To solve this, you need to enable [legacy-peer-deps](https://docs.npmjs.com/cli/v10/using-npm/config#legacy-peer-deps)
in your npm config (`npm config set legacy-peer-deps true`). In the pre-built docker image and the native Home Assistant
Addon, this is already configured. 

**This change is only "breaking" if you installed this project by hand using npm.**


## Installation

### Manual Setup (global installation)

When installed globally, npm has to be configured to use "legacy-peer-deps".
This is [not recommended by npm](https://docs.npmjs.com/cli/v10/using-npm/config#legacy-peer-deps).

Anyway this allows updating `matterbridge` and `matterbridge-home-assistant` using the Web UI.

1. Configure npm to use "legacy-peer-deps" (`npm config set legacy-peer-deps true`)
2. Install matterbridge `npm install -g matterbridge`
3. Install the plugin `npm install -g matterbridge-home-assistant`
4. Make sure the plugin is configured properly using environment variables (see [Configuration](#configuration)).
5. Activate the plugin `matterbridge -add matterbridge-home-assistant`
6. Start matterbridge using `matterbridge -bridge`

### Manual Setup (local installation)

When installed locally, you need to create a `package.json` file and install `matterbridge` and 
`matterbridge-home-assistant` into that folder. This does not require "legacy-peer-deps" to be activated. On the other
hand, it will not be possible to update `matterbridge` or `matterbridge-home-assistant` using the Web UI. It will also
not be possible to **install** additional matterbridge-plugins using the UI. Those can be added to the package.json 
afterward to be installed.

1. Create a new directory, where you want matterbridge to be installed.
2. Create a new `package.json` file in the directory (e.g. by running `npm init -y`)
3. Open a terminal (cmd, bash, powershell), navigate to the directory and install `matterbridge` and 
`matterbridge-home-assistant` using `npm install matterbridge matterbridge-home-assistant`
4. In the same terminal run `npx matterbridge -add ./node_modules/matterbridge-home-assistant`
5. Start matterbridge using `npx matterbridge -bridge`.

### Home Assistant Add-On

Follow the instructions from [Home Assistant Add-On Repository](https://github.com/t0bst4r/matterbridge-home-assistant-addon) to install Matterbridge with Home Assistant OS.

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
  --env HOME_ASSISTANT_URL="http://192.168.178.23:8123" \
  --env HOME_ASSISTANT_ACCESS_TOKEN="ey....yQ" \
  --env HOME_ASSISTANT_CLIENT_CONFIG='{ "includeDomains": ["light", "media_player"], "excludePatterns": ["media_player.*echo*"] }' \
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
      HOME_ASSISTANT_URL: 'http://192.168.178.23:8123'
      HOME_ASSISTANT_ACCESS_TOKEN: 'ey....yQ'
      HOME_ASSISTANT_CLIENT_CONFIG: |
        {
          "includeDomains": ["light", "media_player"],
          "excludePatterns": ["media_player.*echo*"]
        }
    volumes:
      - data:/root/.matterbridge
volumes:
  data:
```

## Configuration

This package can be configured using environment variables.

### Using Environment Variables

- `HOME_ASSISTANT_URL` - the home assistant url (e.g. `http://192.168.178.23:8123`)
- `HOME_ASSISTANT_ACCESS_TOKEN` - a long living access token created in Home Assistant
- `HOME_ASSISTANT_CLIENT_CONFIG` - a json string containing the client config (see below)

### Using a config file

_This works for the Custom Docker Deployment only!_

You can mount the following JSON file to your Docker container (wherever you like).

```json
{
  "homeAssistantUrl": "http://192.168.178.23:8123",
  "homeAssistantAccessToken": "ey....yQ",
  "homeAssistantClientConfig": {
    "includeDomains": ["light", "media_player"],
    "excludePatterns": ["media_player.*echo*"]
  }
}
```

To tell the application to load your JSON file, just point the `CONFIG_FILE` environment variable to the path of this file:

```bash
docker run -d \
  --network host \
  --volume matterbridge-data:/root/.matterbridge \
  --volume $PWD/matterbridge-config:/config:ro \
  --env CONFIG_FILE="/config/matterbridge-config.json" \
  --name matterbridge \
  ghcr.io/t0bst4r/matterbridge-home-assistant:latest
```

Whenever a property is missing in the provided JSON config, it will use the environment variables as fallback.
So your config could look like this:

```json
{
  "homeAssistantUrl": "http://192.168.178.23:8123",
  "homeAssistantClientConfig": {
    "includeDomains": ["light", "media_player"],
    "excludePatterns": ["media_player.*echo*"]
  }
}
```

```bash
docker run -d \
  --network host \
  --volume matterbridge-data:/root/.matterbridge \
  --volume $PWD/matterbridge-config:/config:ro \
  --env CONFIG_FILE="/config/matterbridge-config.json" \
  --env HOME_ASSISTANT_ACCESS_TOKEN="ey....yQ" \
  --name matterbridge \
  ghcr.io/t0bst4r/matterbridge-home-assistant:latest
```

### Client Config

The client config has to be a json string and can have the following properties:

```typescript
interface HomeAssistantClientConfig {
  /**
   * The domains to include.
   * @example [ "light", "media_player" ]
   */
  includeDomains?: Array<string>;
  /**
   * Glob-Patterns to include entities.
   * @example [ "light.*", "media_player.*_tv_*" ]
   */
  includePatterns?: Array<string>;
  /**
   * The domains to exclude.
   * Exclusions are always winning against inclusions.
   * @example [ "media_player" ]
   */
  excludeDomains?: Array<string>;
  /**
   * Glob-Patterns to exclude entities.
   * Exclusions are always winning against inclusions.
   * @example [ "media_player.*echo*" ]
   */
  excludePatterns?: Array<string>;
}
```

**Entities must match any of `includePatterns` or `includeDomains` and most not match any of `excludeDomains` and `excludePatterns`.**

### Example Configuration

```
HOME_ASSISTANT_URL=http://192.168.178.23:8123
HOME_ASSISTANT_ACCESS_TOKEN=ey....yQ
HOME_ASSISTANT_CLIENT_CONFIG={ "includeDomains": ["light", "media_player"], "excludePatterns": ["media_player.*echo*"] }
```

## Commissioning / Pairing the device with your Matter controller

Start matterbridge and find the commissioning QR code in the logs.
This code can be used to connect your Matter controller (like Alexa, Apple Home or Google Home) to the bridge.

![Matterbridge commissioning code](docs/matterbridge-commissioning.png)

## Supported Entities

- Light entities (`light.`) including on-off, brightness and hue & saturation control
- Switch entities (`switch.`) including on-off control
- Input-Boolean entities (`input_boolean.`) including on-off control
- Media Players (`media_player.`) are mapped to Switches and currently only support on-off control
- Climate Devices (`climate.`) currently work in progress, not released yet.
- Scenes (`scene.`) are mapped to Switches and currently only support on-off control
- Scripts (`script.`) are mapped to Switches and currently only support on-off control
- Automations (`automation.`) are mapped to Switches and currently only support on-off control

# Contributors

[![Contributors](https://contrib.rocks/image?repo=t0bst4r/matterbridge-home-assistant)](https://github.com/t0bst4r/matterbridge-home-assistant/graphs/contributors)

---

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/t0bst4r)
