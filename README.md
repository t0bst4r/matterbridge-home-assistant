# Matterbridge Home Assistant

---

This **Matterbridge Home Assistant** package provides bindings to
connect [HomeAssistant](https://www.npmjs.com/package/home-assistant-js-websocket)
to [Matterbridge](https://github.com/Luligu/matterbridge/).

## Installation

### Manual Setup

- Follow [those instructions](https://github.com/Luligu/matterbridge/?tab=readme-ov-file#installation) to
  setup `matterbridge`.
- Install the plugin `npm install -g matterbridge-home-assistant`
- Make sure the plugin is configured properly using environment variables (see [Configuration](#configuration)).
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
  --env HOME_ASSISTANT_URL="http://192.168.178.23:8123" \
  --env HOME_ASSISTANT_ACCESS_TOKEN="ey....yQ" \
  --env HOME_ASSISTANT_CLIENT_CONFIG='{ "includeDomains": ["light", "media_player"], "excludePatterns": ["media_player.*echo*"] }' \
  --name matterbridge
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
      HOME_ASSISTANT_URL: "http://192.168.178.23:8123"
      HOME_ASSISTANT_ACCESS_TOKEN: "ey....yQ"
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

- `HOME_ASSISTANT_URL` - the home assistant url (e.g. `http://192.168.178.23:8123`)
- `HOME_ASSISTANT_ACCESS_TOKEN` - a long living access token created in Home Assistant
- `HOME_ASSISTANT_CLIENT_CONFIG` - a json string containing the client config (see below)

### Client Config

The client config has to be a json string and can have the following properties:

```typescript
interface HomeAssistantClientConfig {
  /**
   * The domains to include.
   * If set, ALL entities must match one of those domains - even those configured in `includePatterns`
   * @example [ "light", "media_player" ]
   */
  includeDomains?: Array<string>;
  /**
   * Glob-Patterns to include entities.
   * If set, ALL entities must match at least one pattern - even those configured in `includeDomains`
   * @example [ "light.*", "media_player.*_tv_*" ]
   */
  includePatterns?: Array<string>;
  /**
   * The domains to exclude.
   * If set, entities must not match any of those domains.
   * Exclusions are always winning against inclusions.
   * @example [ "media_player" ]
   */
  excludeDomains?: Array<string>;
  /**
   * Glob-Patterns to exclude entities.
   * If set, entities must not match at any of those patterns.
   * Exclusions are always winning against inclusions.
   * @example [ "media_player.*echo*" ]
   */
  excludePatterns?: Array<string>;
}
```

### Example Configuration

```
HOME_ASSISTANT_URL=http://192.168.178.23:8123
HOME_ASSISTANT_ACCESS_TOKEN=ey....yQ
HOME_ASSISTANT_CLIENT_CONFIG={ "includeDomains": ["light", "media_player"], "excludePatterns": ["media_player.*echo*"] }
```

## Supported Entities

- Light entities (`light.`) including on-off, brightness and hue & saturation control
- Switch entities (`switch.`) including on-off control
- Media Players (`media_player.`) are mapped to Switches and currently only support on-off control

---

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/t0bst4r)
