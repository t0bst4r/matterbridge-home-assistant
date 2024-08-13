export class UnsupportedDeviceClassError extends Error {
  public domain: string;
  public deviceClass: string;
  constructor(domain: string, deviceClass: string) {
    super(`Device class "${deviceClass}" for domain "${domain}" is not supported!`);
    this.domain = domain;
    this.deviceClass = deviceClass;
  }
}
