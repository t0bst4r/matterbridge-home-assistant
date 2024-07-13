// COPIED FROM Luligu/matterbridge/utils/colorUtils, because exported utils do not work

export function xyColorToRgbColor(x: number, y: number, brightness = 254): [number, number, number] {
  const z = 1.0 - x - y;
  const Y = (brightness / 254).toFixed(2);
  const X = (Number(Y) / y) * x;
  const Z = (Number(Y) / y) * z;

  // Convert to RGB using Wide RGB D65 conversion
  let red = X * 1.656492 - Number(Y) * 0.354851 - Z * 0.255038;
  let green = -X * 0.707196 + Number(Y) * 1.655397 + Z * 0.036152;
  let blue = X * 0.051713 - Number(Y) * 0.121364 + Z * 1.01153;

  // If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
  if (red > blue && red > green && red > 1.0) {
    green = green / red;
    blue = blue / red;
    red = 1.0;
  } else if (green > blue && green > red && green > 1.0) {
    red = red / green;
    blue = blue / green;
    green = 1.0;
  } else if (blue > red && blue > green && blue > 1.0) {
    red = red / blue;
    green = green / blue;
    blue = 1.0;
  }

  // Reverse gamma correction
  red = red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, 1.0 / 2.4) - 0.055;
  green = green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, 1.0 / 2.4) - 0.055;
  blue = blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, 1.0 / 2.4) - 0.055;

  // Convert normalized decimal to decimal
  red = Math.round(red * 255);
  green = Math.round(green * 255);
  blue = Math.round(blue * 255);

  // Normalize
  if (isNaN(red) || red < 0) {
    red = 0;
  }
  if (isNaN(green) || green < 0) {
    green = 0;
  }
  if (isNaN(blue) || blue < 0) {
    blue = 0;
  }

  return [red, green, blue];
}
