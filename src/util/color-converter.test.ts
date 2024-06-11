import { ColorConverter } from './color-converter.js';

const precision = (num: number) => Math.round(num * 100) / 100;

describe('ColorConverter', () => {
  it.each([
    { title: 'red', rgb: [255, 0, 0], hs: [0, 100] },
    { title: 'blue', rgb: [0, 0, 255], hs: [240, 100] },
    { title: 'green', rgb: [0, 255, 0], hs: [120, 100] },
    { title: 'other', rgb: [255, 158, 242], hs: [308.04, 38.04] },
  ])('should convert rgb to Home Assistant HS - $title', ({ rgb: [r, g, b], hs }) => {
    const color = ColorConverter.fromRGB(r, g, b);
    const actual = ColorConverter.toHomeAssistantHS(color);
    expect(actual.map(precision)).toEqual(hs.map(precision));
  });

  it.each([
    { title: 'red', rgb: [255, 0, 0], hs: [0, 254] },
    { title: 'blue', rgb: [0, 0, 255], hs: [170, 254] },
    { title: 'green', rgb: [0, 255, 0], hs: [85, 254] },
    { title: 'other', rgb: [255, 158, 242], hs: [218.195, 96.6216] },
  ])('should convert rgb to Matter HS - $title', ({ rgb: [r, g, b], hs }) => {
    const color = ColorConverter.fromRGB(r, g, b);
    const actual = ColorConverter.toMatterHS(color);
    expect(actual.map(precision)).toEqual(hs.map(precision));
  });

  it.each([
    { title: 'red', rgb: [255, 0, 0], hs: [0, 100] },
    { title: 'blue', rgb: [0, 0, 255], hs: [240, 100] },
    { title: 'green', rgb: [0, 255, 0], hs: [120, 100] },
    { title: 'other', rgb: [255, 158, 242], hs: [308.04, 38.04] },
  ])('should convert Home Assistant HS to RGB - $title', ({ rgb, hs: [h, s] }) => {
    const color = ColorConverter.fromHomeAssistantHS(h, s);
    const actual = ColorConverter.toRGB(color);
    expect(actual.map(precision)).toEqual(rgb.map(precision));
  });

  it.each([
    { title: 'red', rgb: [255, 0, 0], hs: [0, 254] },
    { title: 'blue', rgb: [0, 0, 255], hs: [170, 254] },
    { title: 'green', rgb: [0, 255, 0], hs: [85, 254] },
    { title: 'other', rgb: [255, 158, 242], hs: [218.195, 96.6216] },
  ])('should convert Matter HS to RGB - $title', ({ rgb, hs: [h, s] }) => {
    const color = ColorConverter.fromMatterHS(h, s);
    const actual = ColorConverter.toRGB(color);
    expect(actual.map(precision)).toEqual(rgb.map(precision));
  });

  it('should convert mireds to Kelvin', () => {
    expect(ColorConverter.temperatureMiredsToKelvin(250)).toEqual(4000);
  });

  it('should convert Kelvin to mireds', () => {
    expect(ColorConverter.temperatureKelvinToMireds(4000)).toEqual(250);
  });
});
