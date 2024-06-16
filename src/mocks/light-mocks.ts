import { Entity } from '../home-assistant/entity/entity.js';
import { LightEntityColorMode } from '../devices/light-entity-color-mode.js';

export const lightMocks = {
  withBrightness: (id: number): Entity => ({
    entity_id: `light.matterbridge_mock_light_brightness_${id}`,
    state: 'off',
    attributes: {
      brightness: 0.5,
      friendly_name: `Mocked Light (Brightness) ${id}`,
      supported_color_modes: [LightEntityColorMode.BRIGHTNESS],
    },
    context: { id: 'mock', user_id: null, parent_id: null },
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
    hidden: false,
  }),
  withHsl: (id: number): Entity => ({
    entity_id: `light.matterbridge_mock_light_hsl_${id}`,
    state: 'off',
    attributes: {
      brightness: 0.25,
      hs_color: [60, 100],
      friendly_name: `Mocked Light (HSL) ${id}`,
      supported_color_modes: [LightEntityColorMode.HS],
    },
    context: { id: 'mock', user_id: null, parent_id: null },
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
    hidden: false,
  }),
  withRgb: (id: number): Entity => ({
    entity_id: `light.matterbridge_mock_light_rgb_${id}`,
    state: 'off',
    attributes: {
      brightness: 0.5,
      rgb_color: [128, 128, 0],
      friendly_name: `Mocked Light (RGB) ${id}`,
      supported_color_modes: [LightEntityColorMode.RGB],
    },
    context: { id: 'mock', user_id: null, parent_id: null },
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
    hidden: false,
  }),
  withXY: (id: number): Entity => ({
    entity_id: `light.matterbridge_mock_light_xy_${id}`,
    state: 'off',
    attributes: {
      brightness: 0.5,
      xy_color: [128, 128, 0],
      friendly_name: `Mocked Light (XY) ${id}`,
      supported_color_modes: [LightEntityColorMode.XY],
    },
    context: { id: 'mock', user_id: null, parent_id: null },
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
    hidden: false,
  }),
  withTemperature: (id: number): Entity => ({
    entity_id: `light.matterbridge_mock_light_temp_${id}`,
    state: 'off',
    attributes: {
      brightness: 0.25,
      hs_color: [30, 42],
      friendly_name: `Mocked Light (Temp) ${id}`,
      supported_color_modes: [LightEntityColorMode.HS, LightEntityColorMode.COLOR_TEMP],
    },
    context: { id: 'mock', user_id: null, parent_id: null },
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
    hidden: false,
  }),
};
