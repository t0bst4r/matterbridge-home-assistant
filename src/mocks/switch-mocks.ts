import { Entity } from '../home-assistant/entity/entity.js';

export const switchMocks = {
  onOff: (id: number): Entity => ({
    entity_id: `switch.matterbridge_mock_switch_${id}`,
    state: 'off',
    attributes: {
      friendly_name: `Mocked Switch ${id}`,
    },
    context: { id: 'mock', user_id: null, parent_id: null },
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
  }),
};
