import { Entity } from './entity.js';
import { Connection, HassEntities, HassEntity, subscribeEntities, UnsubscribeFunc } from 'home-assistant-js-websocket';
import { HassRegistryEntities, HassRegistryEntity, subscribeEntityRegistry } from './entity-registry-collection.js';

export interface EntityConsumer {
  onCreate(entity: Entity): Promise<void>;

  onUpdate(entity: Entity): Promise<void>;

  onDelete(entityId: string): Promise<void>;
}

export class EntityManager {
  private readonly registryDetails = new Map<string, HassRegistryEntity>();
  private readonly stateDetails = new Map<string, HassEntity>();
  private readonly entities = new Map<string, Entity>();

  public readonly close: UnsubscribeFunc;

  constructor(
    connection: Connection,
    private readonly consumer: EntityConsumer,
  ) {
    const unsubEntities = subscribeEntities(connection, this.updateByState.bind(this));
    const unsubRegistry = subscribeEntityRegistry(connection, this.updateByRegistry.bind(this));
    this.close = () => {
      unsubEntities();
      unsubRegistry();
    };
  }

  private async updateByRegistry(registry: HassRegistryEntities) {
    const keys = Object.keys(registry);
    keys.forEach((key) => {
      this.registryDetails.set(key, registry[key]);
    });
    await this.update(keys);
  }

  private async updateByState(states: HassEntities) {
    const keys = Object.keys(states);
    keys.forEach((key) => {
      this.stateDetails.set(key, states[key]);
    });
    await this.update(keys);
  }

  private async update(entities: string[]) {
    const groups = this.classifyEntityIds(entities);
    for (const entityId of groups.created) {
      const entity = this.buildEntity(this.stateDetails.get(entityId), this.registryDetails.get(entityId));
      if (entity) {
        this.entities.set(entityId, entity);
        await this.consumer.onCreate(entity);
      }
    }
    for (const entityId of groups.updated) {
      const entity = this.buildEntity(this.stateDetails.get(entityId), this.registryDetails.get(entityId))!;
      this.entities.set(entityId, entity);
      await this.consumer.onUpdate(entity);
    }
    for (const entityId of groups.updated) {
      this.entities.delete(entityId);
      await this.consumer.onDelete(entityId);
    }
  }

  private classifyEntityIds(entityIds: string[]): { created: string[]; updated: string[]; deleted: string[] } {
    const existingKeys = Array.from(this.entities.keys());
    return {
      created: entityIds.filter((e) => !existingKeys.includes(e)),
      updated: entityIds.filter((e) => existingKeys.includes(e)),
      deleted: existingKeys.filter((e) => !entityIds.includes(e)),
    };
  }

  private buildEntity(state: HassEntity | undefined, registry: HassRegistryEntity | undefined): Entity | undefined {
    if (!state) return;
    return {
      ...state,
      hidden: !!registry?.hidden_by,
    };
  }
}
