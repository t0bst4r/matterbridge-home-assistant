import Color from 'color';
// @ts-expect-error color-temperature does not have any typings
import { colorTemperature2rgb } from 'color-temperature';
import { xyColorToRgbColor } from './xy-to-rgb.js';

/*
 * Matter:
 *    Brightness: 0-255
 *    Hue: 0-255
 *    Saturation: 0-255
 *    colorTemperatureMireds: Samples 147 - 454
 *
 * Home Assistant:
 *    Brightness: 0-255
 *    Hue: 0-360
 *    Saturation: 0-100
 *    rgb: 255, 255, 255
 *
 * Color (js):
 *    Hue: 0-360
 *    Saturation: 0-100
 *    rgb: 0-255
 */

export abstract class ColorConverter {
  /**
   * Create a color object from `hs_color` value
   * @param hue Hue, Values between 0 and 360
   * @param saturation Saturation, Values between 0 and 100
   * @return Color
   */
  public static fromHomeAssistantHS(hue: number, saturation: number): Color {
    return Color.hsv(hue, saturation, 100);
  }

  /**
   * Create a color object from `hue` and `saturation` values set via Matter
   * @param hue Hue, Values between 0 and 255
   * @param saturation Saturation, Values between 0 and 255
   * @return Color
   */
  public static fromMatterHS(hue: number, saturation: number): Color {
    return Color.hsv((hue / 255) * 360, (saturation / 254) * 100, 100);
  }

  /**
   * Create a color object from `x` and `y` values set via Matter
   * @param x X, Values between 0 and 1
   * @param y Y, Values between 0 and 1
   * @return Color
   */
  static fromXY(x: number, y: number): Color {
    const rgb = xyColorToRgbColor(x, y);
    return Color.rgb(...rgb);
  }

  /**
   * Create a color object from `rgb_color` value
   * @param r Red, 0-255
   * @param g Green, 0-255
   * @param b Blue, 0-255
   * @return Color
   */
  public static fromRGB(r: number, g: number, b: number): Color {
    return Color.rgb(r, g, b);
  }

  public static fromTemperatureKelvin(temperatureKelvin: number): Color {
    const rgb = colorTemperature2rgb(temperatureKelvin);
    return this.fromRGB(rgb.red, rgb.green, rgb.blue);
  }

  /**
   * Extract Hue and Saturation compatible with Home Assistant
   * @param color The Color
   * @return [hue, saturation]
   */
  public static toHomeAssistantHS(color: Color): [hue: number, saturation: number] {
    const [h, s] = color.hsv().array();
    return [h, s];
  }

  /**
   * Extract R, G, B values from a color
   * @param color The color
   * @return [r, g, b]
   */
  public static toRGB(color: Color): [r: number, g: number, b: number] {
    const [r, g, b] = color.rgb().array();
    return [r, g, b];
  }

  /**
   * Extract Hue and Saturation compatible with Matter
   * @param color The Color
   * @return [hue, saturation]
   */
  public static toMatterHS(color: Color): [hue: number, saturation: number] {
    const [h, s] = color.hsv().array();
    return [(h / 360) * 255, (s / 100) * 254];
  }

  /**
   * Convert Color Tempareture from Mireds to Kelvin
   * @param temperatureMireds Temperature in Mireds
   * @return Temperature in Kelvin
   */
  public static temperatureMiredsToKelvin(temperatureMireds: number): number {
    return 1_000_000 / temperatureMireds;
  }

  /**
   * Convert Color Tempareture from Kelvin to Mireds
   * @param temperatureKelvin Temperature in Kelvin
   * @return Temperature in Mireds
   */
  public static temperatureKelvinToMireds(temperatureKelvin: number): number {
    return 1_000_000 / temperatureKelvin;
  }
}
