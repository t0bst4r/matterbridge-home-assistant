import { Thermostat, ThermostatCluster } from '@project-chip/matter.js/cluster';

import { AspectBase } from '@/aspects/aspect-base.js';
import {
  ThermostatHandlers,
  thermostatWithCooling,
  thermostatWithHeating,
  thermostatWithHeatingAndCooling,
} from '@/aspects/utils/thermostat-cluster.js';
import { MatterDevice } from '@/devices/index.js';
import { HomeAssistantClient } from '@/home-assistant-client/index.js';
import { HomeAssistantMatterEntity } from '@/models/index.js';

export interface ThermostatAspectConfig {
  supportsCooling: boolean;
  supportsHeating: boolean;
}

export interface ThermostatState {
  systemMode: Thermostat.SystemMode;
  minTemperature: number | undefined;
  maxTemperature: number | undefined;
  targetTemperature: number;
  currentTemperature: number | null;
}

export class ThermostatAspect extends AspectBase {
  private currentState: ThermostatState;

  constructor(
    private readonly homeAssistant: HomeAssistantClient,
    private readonly device: MatterDevice,
    entity: HomeAssistantMatterEntity,
    private readonly config: ThermostatAspectConfig,
  ) {
    super('ThermostatAspect', entity);
    this.currentState = this.getState(entity);

    if (config.supportsCooling && config.supportsHeating) {
      this.log.debug('Cooling and Heating supported');
      device.addClusterServer(thermostatWithHeatingAndCooling(device, this.currentState));
    } else if (config.supportsCooling) {
      this.log.debug('Cooling supported');
      device.addClusterServer(thermostatWithCooling(device, this.currentState));
    } else if (config.supportsHeating) {
      this.log.debug('Heating supported');
      device.addClusterServer(thermostatWithHeating(device, this.currentState));
    }
    device.addCommandHandler('setpointRaiseLower', this.setpointRaiseLower.bind(this));
    device.addCommandHandler('systemMode', this.systemModeChanged.bind(this));
    device.addCommandHandler('occupiedHeatingSetpoint', this.targetTemperatureChanged.bind(this));
    device.addCommandHandler('occupiedCoolingSetpoint', this.targetTemperatureChanged.bind(this));
  }

  async update(state: HomeAssistantMatterEntity): Promise<void> {
    const { systemMode, minTemperature, maxTemperature, currentTemperature, targetTemperature } = (this.currentState =
      this.getState(state));
    const cluster = this.device.getClusterServer(
      ThermostatCluster.with(Thermostat.Feature.Cooling, Thermostat.Feature.Heating),
    )!;
    if (currentTemperature != null && currentTemperature != cluster.getLocalTemperatureAttribute()) {
      cluster.setLocalTemperatureAttribute(currentTemperature);
    }

    if (this.config.supportsCooling) {
      if (targetTemperature != null && targetTemperature !== cluster.getOccupiedCoolingSetpointAttribute()) {
        cluster.setOccupiedCoolingSetpointAttribute(targetTemperature);
      }
      if (
        minTemperature != null &&
        cluster.getMinCoolSetpointLimitAttribute != null &&
        minTemperature !== cluster.getMinCoolSetpointLimitAttribute()
      ) {
        cluster.setMinCoolSetpointLimitAttribute(minTemperature);
      }
      if (
        maxTemperature != null &&
        cluster.getMaxCoolSetpointLimitAttribute != null &&
        maxTemperature !== cluster.getMaxCoolSetpointLimitAttribute()
      ) {
        cluster.setMaxCoolSetpointLimitAttribute(maxTemperature);
      }
    }
    if (this.config.supportsHeating) {
      if (targetTemperature != null && targetTemperature !== cluster.getOccupiedHeatingSetpointAttribute()) {
        cluster.setOccupiedHeatingSetpointAttribute(targetTemperature);
      }
      if (
        minTemperature != null &&
        cluster.getMinHeatSetpointLimitAttribute != null &&
        minTemperature !== cluster.getMinHeatSetpointLimitAttribute()
      ) {
        cluster.setMinHeatSetpointLimitAttribute(minTemperature);
      }
      if (
        maxTemperature != null &&
        cluster.getMaxHeatSetpointLimitAttribute != null &&
        maxTemperature !== cluster.getMaxHeatSetpointLimitAttribute()
      ) {
        cluster.setMaxHeatSetpointLimitAttribute(maxTemperature);
      }
    }

    if (systemMode != cluster.getSystemModeAttribute()) {
      cluster.setSystemModeAttribute(systemMode);
    }
  }

  private setpointRaiseLower: ThermostatHandlers['setpointRaiseLower'] = async ({ request }) => {
    this.log.debug('FROM MATTER: SetpointRaise Lower: Mode: %s, Amount: %s', request.mode, request.amount);
    const targetTemperature = this.currentState.targetTemperature / 100 + request.amount / 10;
    await this.homeAssistant.callService(
      'climate',
      'set_temperature',
      {
        temperature: targetTemperature,
      },
      {
        entity_id: [this.entityId],
      },
    );
  };

  private targetTemperatureChanged = async (newValue: number, oldValue: number) => {
    if (newValue === this.currentState.targetTemperature) {
      return;
    }
    this.log.debug('FROM MATTER: changed occupiedHeatingSetpoint from %s to %s', oldValue, newValue);
    await this.homeAssistant.callService(
      'climate',
      'set_temperature',
      { temperature: newValue / 100 },
      { entity_id: [this.entityId] },
    );
  };

  private systemModeChanged = async (newValue: Thermostat.SystemMode, oldValue: Thermostat.SystemMode) => {
    if (newValue === this.currentState.systemMode) {
      return;
    }
    this.log.debug('FROM MATTER: changed SystemMode from %s to %s', oldValue, newValue);
    await this.homeAssistant.callService(
      'climate',
      'set_hvac_mode',
      {
        hvac_mode: this.getHvacMode(newValue),
      },
      {
        entity_id: [this.entityId],
      },
    );
  };

  private getState(entity: HomeAssistantMatterEntity): ThermostatState {
    return {
      systemMode: this.getSystemMode(entity.state),
      minTemperature: this.getTemperature(entity.attributes.min_temp) ?? undefined,
      maxTemperature: this.getTemperature(entity.attributes.max_temp) ?? undefined,
      currentTemperature: this.getTemperature(entity.attributes.current_temperature),
      targetTemperature: this.getTemperature(entity.attributes.temperature) ?? 2100,
    };
  }

  private getSystemMode(state: string | undefined): Thermostat.SystemMode {
    switch (state ?? 'off') {
      case 'heat':
        return Thermostat.SystemMode.Heat;
      case 'cool':
        return Thermostat.SystemMode.Cool;
    }
    return Thermostat.SystemMode.Off;
  }

  private getHvacMode(systemMode: Thermostat.SystemMode): string {
    switch (systemMode) {
      case Thermostat.SystemMode.Cool:
        return 'cool';
      case Thermostat.SystemMode.Heat:
        return 'heat';
      default:
        return 'off';
    }
  }

  private getTemperature(value: number | string | null | undefined): number | null {
    const current = value != null ? +value : null;
    if (current == null || isNaN(current)) {
      return null;
    } else {
      return current * 100;
    }
  }
}
