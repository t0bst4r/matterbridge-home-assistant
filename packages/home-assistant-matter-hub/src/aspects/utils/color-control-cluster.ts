import { ClusterServer, ColorControlCluster, MatterbridgeDevice } from 'matterbridge';

import { MatterbridgeDeviceCommands } from '@/aspects/utils/matterbrigde-device-commands.js';
import { ColorControl } from '@project-chip/matter.js/cluster';

const noop = async () => {};

export function clusterWithColor(moveToHueAndSaturation: MatterbridgeDeviceCommands['moveToHueAndSaturation']) {
  return ClusterServer(
    ColorControlCluster.with(ColorControl.Feature.HueSaturation),
    {
      colorMode: ColorControl.ColorMode.CurrentHueAndCurrentSaturation,
      options: {
        executeIfOff: false,
      },
      numberOfPrimaries: null,
      enhancedColorMode: ColorControl.EnhancedColorMode.CurrentHueAndCurrentSaturation,
      colorCapabilities: {
        xy: false,
        hueSaturation: true,
        colorLoop: false,
        enhancedHue: false,
        colorTemperature: false,
      },
      currentHue: 0,
      currentSaturation: 0,
    },
    {
      moveToHue: noop,
      moveHue: noop,
      stepHue: noop,
      moveToSaturation: noop,
      moveSaturation: noop,
      stepSaturation: noop,
      stopMoveStep: noop,
      moveToHueAndSaturation: moveToHueAndSaturation,
    },
    {},
  );
}

export function clusterWithTemperature(moveToColorTemperature: MatterbridgeDeviceCommands['moveToColorTemperature']) {
  return ClusterServer(
    ColorControlCluster.with(ColorControl.Feature.ColorTemperature),
    {
      colorMode: ColorControl.ColorMode.CurrentHueAndCurrentSaturation,
      options: {
        executeIfOff: false,
      },
      numberOfPrimaries: null,
      enhancedColorMode: ColorControl.EnhancedColorMode.CurrentHueAndCurrentSaturation,
      colorCapabilities: {
        xy: false,
        hueSaturation: false,
        colorLoop: false,
        enhancedHue: false,
        colorTemperature: true,
      },
      colorTemperatureMireds: 500,
      colorTempPhysicalMinMireds: 147,
      colorTempPhysicalMaxMireds: 500,
    },
    {
      moveToColorTemperature,
      moveColorTemperature: noop,
      stepColorTemperature: noop,
      stopMoveStep: noop,
    },
    {},
  );
}

export function clusterWithColorAndTemperature(
  device: MatterbridgeDevice,
  moveToHueAndSaturation: MatterbridgeDeviceCommands['moveToHueAndSaturation'],
  moveToColorTemperature: MatterbridgeDeviceCommands['moveToColorTemperature'],
) {
  const cluster = device.getDefaultColorControlClusterServer();
  device.addCommandHandler('moveToHueAndSaturation', moveToHueAndSaturation);
  device.addCommandHandler('moveToColorTemperature', moveToColorTemperature);
  return cluster;
}
