import { ClusterServer, ThermostatCluster, Thermostat } from 'matterbridge';
import { MatterAspect } from './matter-aspect.js';
import { Entity } from '../../home-assistant/entity/entity.js';

export class ThermostatAspect extends MatterAspect<Entity> {
  constructor(entity: Entity) {
    super(entity.entity_id);
  }

  getDefaultThermostatClusterServer(
    localTemperature: number = 23,
    occupiedHeatingSetpoint = 21,
    occupiedCoolingSetpoint = 25,
    minSetpointDeadBand = 1,
  ) {
    return ClusterServer(
      ThermostatCluster.with(Thermostat.Feature.Heating, Thermostat.Feature.Cooling, Thermostat.Feature.AutoMode),
      {
        localTemperature: localTemperature * 100,
        occupiedHeatingSetpoint: occupiedHeatingSetpoint * 100,
        occupiedCoolingSetpoint: occupiedCoolingSetpoint * 100,
        minHeatSetpointLimit: 0,
        maxHeatSetpointLimit: 5000,
        absMinHeatSetpointLimit: 0,
        absMaxHeatSetpointLimit: 5000,
        minCoolSetpointLimit: 0,
        maxCoolSetpointLimit: 5000,
        absMinCoolSetpointLimit: 0,
        absMaxCoolSetpointLimit: 5000,
        minSetpointDeadBand,
        systemMode: Thermostat.SystemMode.Off,
        controlSequenceOfOperation: Thermostat.ControlSequenceOfOperation.CoolingAndHeating,
        thermostatRunningMode: Thermostat.ThermostatRunningMode.Off,
      },
      {
        setpointRaiseLower: async ({ request, attributes }) => {
          this.log.debug('Matter command: setpointRaiseLower', request);
          await this.commandHandler.executeHandler('setpointRaiseLower', { request, attributes });
        },
      },
      {},
    );
  }
}
