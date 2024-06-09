# Matterbridge Home Assistant

---

This **Matterbridge Home Assistant** package provides bindings to connect [HomeAssistant](https://www.npmjs.com/package/home-assistant-js-websocket) to [Matterbridge](https://github.com/Luligu/matterbridge/).

## Installation

- Follow [those instructions](https://github.com/Luligu/matterbridge/?tab=readme-ov-file#installation) to setup `matterbridge`.
- Install the plugin `npm install -g matterbridge-home-assistant`
- Make sure the plugin is configured properly using environment variables (see [Configuration](#configuration)).
- Activate the plugin `matterbridge -add matterbridge-home-assistant`
- Start matterbridge using `matterbridge -bridge`

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
