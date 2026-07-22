import type { ModelType } from '#core/abstract-model.js';
import type { ValidationFunction } from '#core/validator.js';

const inMutation = <T extends object>(mutations: T, key: string | number | symbol): key is keyof T => {
  return Object.hasOwn(mutations, key);
};

export type MutationTrackedObject<T extends Partial<ModelType>> = T & {
  getMutations(): Partial<T>;
  toRaw(): T;
};
export const trackObjectMutations = <T extends ModelType>(
  data: Partial<T>,
  validator: ValidationFunction<T>,
): MutationTrackedObject<T> => {
  const mutations: Partial<T> = {};
  const handler: ProxyHandler<T> = {
    deleteProperty(target, key: string | symbol) {
      if (inMutation(mutations, key)) {
        mutations[key] = undefined;
      }
      return Reflect.deleteProperty(target, key);
    },
    get(target, key, receiver) {
      if (key === 'getMutations') {
        return () => ({ ...mutations });
      }
      if (key === 'toRaw') {
        return () => target;
      }
      return Reflect.get(target, key, receiver);
    },
    set(target, key: string | symbol, value, receiver) {
      if (typeof key === 'symbol') {
        return Reflect.set(target, key, value, receiver);
      }
      const oldValue = Reflect.get(target, key, receiver);
      if (oldValue === undefined || oldValue !== value) {
        // validator throw error on fail
        validator(key as keyof T, value);
        mutations[key as keyof T] = value;
      }
      return Reflect.set(target, key, value, receiver);
    },
  };

  // We redefine getMutations & toRaw in handler get. Proxy has getMutations & toRaw
  return new Proxy(data, handler) as MutationTrackedObject<T>;
};
