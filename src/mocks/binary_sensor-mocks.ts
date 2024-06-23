import { Entity } from '../home-assistant/entity/entity.js';

export const binarySesnorsMocks = {
  withDoorClass: (id: number): Entity => ({
    entity_id: `binary_sensor.matterbridge_mock_door_${id}`,
    state: 'off',
    attributes: {
      device_class: 'door',
      friendly_name: `Mocked Door Sensor ${id}`,
    },
    context: { id: 'mock', user_id: null, parent_id: null },
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
    hidden: false,
  }),
  withWindowClass: (id: number): Entity => ({
    entity_id: `binary_sensor.matterbridge_mock_window_${id}`,
    state: 'off',
    attributes: {
      device_class: 'window',
      friendly_name: `Mocked Window Sensor ${id}`,
    },
    context: { id: 'mock', user_id: null, parent_id: null },
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
    hidden: false,
  }),
};
