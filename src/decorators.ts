const gettableProperties = new WeakMap<object, Set<string>>();
const settableProperties = new WeakMap<object, Set<string>>();

function registerProperty<T extends object>(map: WeakMap<object, Set<string>>, target: T, propertyKey: string) {
  let set = map.get(target);
  if (!set) {
    set = new Set();
    map.set(target, set);
  }
  set.add(propertyKey);
}

export function Gettable<T extends object>(target: T, propertyKey: string): void {
  registerProperty(gettableProperties, target, propertyKey);
}

export function Settable<T extends object>(target: T, propertyKey: string): void {
  registerProperty(settableProperties, target, propertyKey);
}

export function createTypeSafeProxy<T extends object>(instance: T): T {
  const proto = Object.getPrototypeOf(instance);
  const gettable = gettableProperties.get(proto) || new Set();
  const settable = settableProperties.get(proto) || new Set();

  const handler: ProxyHandler<T> = {
    get(target, propKey) {
      if (gettable.has(String(propKey))) {
        return target[propKey as keyof T];
      }
      return undefined;
    },
    set(target, propKey, value) {
      if (settable.has(String(propKey))) {
        target[propKey as keyof T] = value;
        return true;
      }
      return false;
    }
  };

  return new Proxy(instance, handler);
}
