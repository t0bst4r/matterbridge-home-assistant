import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';
import { HomeAssistantClient } from '../../home-assistant/home-assistant-client.js';
import { LevelControlCluster, MatterbridgeDevice } from 'matterbridge';
import { MatterbridgeDeviceCommands } from '../../util/matterbrigde-device-commands.js';
import { LightEntityColorMode } from '../light-entity-color-mode.js';

const brightnessModes = Object.values(LightEntityColorMode)
  .filter((mode) => mode !== LightEntityColorMode.UNKNOWN)
  .filter((mode) => mode !== LightEntityColorMode.ONOFF);

export class LevelControlAspect extends MatterAspect<Entity> {
  private readonly supportsLevelControl: boolean;

  private get levelControlCluster() {
    return this.device.getClusterServer(LevelControlCluster);
  }

  constructor(
    private readonly homeAssistantClient: HomeAssistantClient,
    private readonly device: MatterbridgeDevice,
    entity: Entity,
  ) {
    super(entity.entity_id);
    this.log.setLogName('LevelControlAspect');
    const supportedColorModes: LightEntityColorMode[] = entity.attributes.supported_color_modes ?? [];

    this.supportsLevelControl = supportedColorModes.some((mode) => brightnessModes.includes(mode));
    if (this.supportsLevelControl) {
      this.log.debug(`Light-Entity ${entity.entity_id} supports level control`);
      device.createDefaultLevelControlClusterServer();
      device.addCommandHandler('moveToLevel', this.moveToLevel.bind(this));
      device.addCommandHandler('moveToLevelWithOnOff', this.moveToLevel.bind(this));
    }
  }

  private moveToLevel: MatterbridgeDeviceCommands['moveToLevel'] = async ({ request: { level } }) => {
    this.log.debug(`FROM MATTER: ${this.entityId} changed brightness to ${level}`);
    this.levelControlCluster!.setCurrentLevelAttribute(level);
    await this.homeAssistantClient.callService(
      'light',
      'turn_on',
      {
        brightness: level,
      },
      { entity_id: this.entityId },
    );
  };

  async update(state: Entity): Promise<void> {
    if (this.supportsLevelControl) {
      const brightness: number | undefined = state.attributes.brightness;
      const levelControlClusterServer = this.levelControlCluster!;
      if (brightness != null && levelControlClusterServer.getCurrentLevelAttribute() !== brightness) {
        this.log.debug(`FROM HA: ${this.entityId} changed brightness to ${brightness}`);
        levelControlClusterServer.setCurrentLevelAttribute(brightness ?? 0);
      }
    }
  }
}
