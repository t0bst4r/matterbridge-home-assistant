export interface HomeAssistantEntityRegistryEntry {
  entity_id: string;
  device_id?: string;
  disabled_by?: string;
  hidden_by?: string;
  options?: {
    conversation?: {
      should_expose?: boolean;
    };
  };
}

export type HomeAssistantEntityRegistry = Record<string, HomeAssistantEntityRegistryEntry>;
