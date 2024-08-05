import {
  ClusterServer,
  ClusterServerHandlers,
  ClusterServerObjForCluster,
  ColorControl,
  ColorControlCluster,
} from '@project-chip/matter.js/cluster';
import { Logger } from 'winston';

import { noopFn } from '@/aspects/utils/noop-fn.js';

export type ColorControlHandlers = Required<ClusterServerHandlers<typeof ColorControl.Complete>>;

export function clusterWithColor(
  logger: Logger,
  moveToHueAndSaturation: ColorControlHandlers['moveToHueAndSaturation'],
): ClusterServerObjForCluster<ColorControlCluster> {
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
      moveToHue: noopFn(logger, 'moveToHue'),
      moveHue: noopFn(logger, 'moveHue'),
      stepHue: noopFn(logger, 'stepHue'),
      moveToSaturation: noopFn(logger, 'moveToSaturation'),
      moveSaturation: noopFn(logger, 'moveSaturation'),
      stepSaturation: noopFn(logger, 'stepSaturation'),
      stopMoveStep: noopFn(logger, 'stopMoveStep'),
      moveToHueAndSaturation,
    },
    {},
  );
}

export function clusterWithTemperature(
  logger: Logger,
  moveToColorTemperature: ColorControlHandlers['moveToColorTemperature'],
): ClusterServerObjForCluster<ColorControlCluster> {
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
      moveColorTemperature: noopFn(logger, 'moveColorTemperature'),
      stepColorTemperature: noopFn(logger, 'stepColorTemperature'),
      stopMoveStep: noopFn(logger, 'stopMoveStep'),
    },
  );
}

export function clusterWithColorAndTemperature(
  logger: Logger,
  moveToHueAndSaturation: ColorControlHandlers['moveToHueAndSaturation'],
  moveToColorTemperature: ColorControlHandlers['moveToColorTemperature'],
): ClusterServerObjForCluster<ColorControlCluster> {
  return ClusterServer(
    ColorControlCluster.with(ColorControl.Feature.HueSaturation, ColorControl.Feature.ColorTemperature),
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
        colorTemperature: true,
      },
      currentHue: 0,
      currentSaturation: 0,
      colorTemperatureMireds: 500,
      colorTempPhysicalMinMireds: 147,
      colorTempPhysicalMaxMireds: 500,
    },
    {
      moveToHue: noopFn(logger, 'moveToHue'),
      moveHue: noopFn(logger, 'moveHue'),
      stepHue: noopFn(logger, 'stepHue'),
      moveToSaturation: noopFn(logger, 'moveToSaturation'),
      moveSaturation: noopFn(logger, 'moveSaturation'),
      stepSaturation: noopFn(logger, 'stepSaturation'),
      stopMoveStep: noopFn(logger, 'stopMoveStep'),
      moveToHueAndSaturation,
      moveToColorTemperature,
      moveColorTemperature: noopFn(logger, 'moveColorTemperature'),
      stepColorTemperature: noopFn(logger, 'stepColorTemperature'),
    },
    {},
  );
}
