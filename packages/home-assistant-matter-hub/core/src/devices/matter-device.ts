import { Device } from '@project-chip/matter.js/device';

export type MatterDevice = Device & {
  addCommandHandler<T extends CallableFunction>(command: string, handler: T): void;
  executeCommandHandler(action: string, ...args: unknown[]): Promise<void>;
};
