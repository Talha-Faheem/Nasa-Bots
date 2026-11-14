/**
 * LUNAR FRONTIER: THE LAST 30 DAYS
 * src/store/bus.ts
 * Small typed event bus for decoupling React and 3D scenes.
 */

import { BuildingId, CrewId } from '../sim/types.ts';

export type GameEventMap = {
  'sound:play': { name: 'click' | 'alarm' | 'pump' | 'harvest' | 'repair' | 'alert' };
  'camera:focus': { buildingId?: BuildingId; crewId?: CrewId };
  'camera:reset': void;
  'ui:notification': { message: string; type: 'info' | 'warning' | 'alert' | 'success' };
};

type Handler<T> = (data: T) => void;

class TypedEventBus {
  private handlers = new Map<keyof GameEventMap, Set<Handler<any>>>();

  on<K extends keyof GameEventMap>(event: K, handler: Handler<GameEventMap[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  emit<K extends keyof GameEventMap>(event: K, data: GameEventMap[K]): void {
    const set = this.handlers.get(event);
    if (set) {
      for (const handler of set) {
        handler(data);
      }
    }
  }
}

export const eventBus = new TypedEventBus();

