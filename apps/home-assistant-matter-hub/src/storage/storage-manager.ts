import { Environment, StorageService } from '@project-chip/matter.js/environment';
import { StorageContext } from '@project-chip/matter.js/storage';
import _ from 'lodash';

import { StorageV1 } from './storage-v1.js';

export class StorageManager {
  public static async create(environment: Environment): Promise<StorageManager> {
    const storageService = environment.get(StorageService);
    const storageContext = (await storageService.open('home-assistant-matter-hub')).createContext('data');
    const storageManager = new StorageManager(storageService, storageContext);
    await storageManager.load();
    return storageManager;
  }

  private storage!: StorageV1;

  constructor(
    private readonly storageService: StorageService,
    private readonly storageContext: StorageContext,
  ) {}

  private async load(): Promise<void> {
    const content = await this.storageContext.get<string>('content', '{}');
    this.storage = JSON.parse(content) as StorageV1;
  }

  public get location(): string {
    return this.storageService.location!;
  }

  get(): StorageV1 {
    return this.storage;
  }

  async set(data: Partial<StorageV1>): Promise<StorageV1> {
    const storage = _.merge({}, this.storage, data);
    await this.storageContext.set('content', JSON.stringify(storage));
    this.storage = storage;
    return this.storage;
  }
}
