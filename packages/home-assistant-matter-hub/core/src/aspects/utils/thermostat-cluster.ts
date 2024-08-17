import {
  ClusterServer,
  ClusterServerHandlers,
  ClusterServerObj,
  Thermostat,
  ThermostatCluster,
} from '@project-chip/matter.js/cluster';

import { MatterDevice } from '@/devices/index.js';

import type { ThermostatState } from '../thermostat-aspect.js';

export type ThermostatHandlers = Required<ClusterServerHandlers<typeof Thermostat.Complete>>;
type ThermostatBase = typeof Thermostat.Base;
type ThermostatClusterServerObj = ClusterServerObj<ThermostatBase['attributes'], {}>;

export function thermostatWithCooling(device: MatterDevice, state: ThermostatState): ThermostatClusterServerObj {
  const clusterServer = ClusterServer(
    ThermostatCluster.with(Thermostat.Feature.Cooling),
    {
      minCoolSetpointLimit: state.minTemperature,
      maxCoolSetpointLimit: state.maxTemperature,
      localTemperature: state.currentTemperature,
      occupiedCoolingSetpoint: state.targetTemperature,
      controlSequenceOfOperation: Thermostat.ControlSequenceOfOperation.CoolingOnly,
      systemMode: state.systemMode,
    },
    {
      setpointRaiseLower: (...attrs) => device.executeCommandHandler('setpointRaiseLower', ...attrs),
    },
  );
  clusterServer.attributes.systemMode.addValueSetListener((...args) =>
    device.executeCommandHandler('systemMode', ...args),
  );
  clusterServer.attributes.occupiedCoolingSetpoint.addValueSetListener((...args) =>
    device.executeCommandHandler('occupiedCoolingSetpoint', ...args),
  );
  return clusterServer;
}

export function thermostatWithHeating(device: MatterDevice, state: ThermostatState): ThermostatClusterServerObj {
  const clusterServer = ClusterServer(
    ThermostatCluster.with(Thermostat.Feature.Heating),
    {
      minHeatSetpointLimit: state.minTemperature,
      maxHeatSetpointLimit: state.maxTemperature,
      localTemperature: state.currentTemperature,
      occupiedHeatingSetpoint: state.targetTemperature,
      controlSequenceOfOperation: Thermostat.ControlSequenceOfOperation.HeatingOnly,
      systemMode: state.systemMode,
    },
    {
      setpointRaiseLower: (...attrs) => device.executeCommandHandler('setpointRaiseLower', ...attrs),
    },
  );
  clusterServer.attributes.systemMode.addValueSetListener((...args) =>
    device.executeCommandHandler('systemMode', ...args),
  );
  clusterServer.attributes.occupiedHeatingSetpoint.addValueSetListener((...args) =>
    device.executeCommandHandler('occupiedHeatingSetpoint', ...args),
  );
  return clusterServer;
}

export function thermostatWithHeatingAndCooling(
  device: MatterDevice,
  state: ThermostatState,
): ThermostatClusterServerObj {
  const clusterServer = ClusterServer(
    ThermostatCluster.with(Thermostat.Feature.Cooling, Thermostat.Feature.Heating),
    {
      minHeatSetpointLimit: state.minTemperature,
      maxHeatSetpointLimit: state.maxTemperature,
      minCoolSetpointLimit: state.minTemperature,
      maxCoolSetpointLimit: state.maxTemperature,
      localTemperature: state.currentTemperature,
      occupiedHeatingSetpoint: state.targetTemperature,
      occupiedCoolingSetpoint: state.targetTemperature,
      controlSequenceOfOperation: Thermostat.ControlSequenceOfOperation.CoolingAndHeating,
      systemMode: state.systemMode,
    },
    {
      setpointRaiseLower: (...attrs) => device.executeCommandHandler('setpointRaiseLower', ...attrs),
    },
    {},
  );
  clusterServer.attributes.systemMode.addValueSetListener((...args) =>
    device.executeCommandHandler('systemMode', ...args),
  );
  clusterServer.attributes.occupiedCoolingSetpoint.addValueSetListener((...args) =>
    device.executeCommandHandler('occupiedCoolingSetpoint', ...args),
  );
  clusterServer.attributes.occupiedHeatingSetpoint.addValueSetListener((...args) =>
    device.executeCommandHandler('occupiedHeatingSetpoint', ...args),
  );
  return clusterServer;
}
