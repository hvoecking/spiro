export function setTypedHashParam<T>(name: string, value: T) {
  // Use JSON.stringify to encode the value in JSON type format
  setBareHashParam(name, JSON.stringify({value}).slice("{\"value\":".length, -1));
}

export function setBareHashParam(name: string, value: string) {
  if (name === "") {
    throw new Error("Name must not be empty");
  }
  // Expect the hash to use search params format
  const searchParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  searchParams.set(name, value);

  // Encode and replace spaces with + because it looks nicer
  const encoded = searchParams.toString().replace(/%20/g, "+");

  // Update the hash
  window.location.hash = encoded;
}

// export function getTypedHashParam<T>(name: string): T | null {
//   // Get hash param as string and use JSON.parse to parse it to the correct type
//   return JSON.parse(`{"value": ${getBareHashParam(name)}}`)["value"] as T;
// }

export function getBareHashParam(name: string): string | null {
  // Expect the hash to use search params format
  const searchParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  // Check for an existing config fragment
  const fragment = searchParams.get(name);
  if (fragment === null) return null;
  if (fragment === "") return null;

  return decodeURIComponent(fragment);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function getTypedHashParam<T>(name: string, typeGuard: null | ((value: unknown) => value is T) = null): T | null {
  const stringValue = getBareHashParam(name);
  if (stringValue === null) return null;

  const parsedValue: unknown = JSON.parse(`{"value": ${stringValue}}`)["value"];

  if (!typeGuard) {
    return parsedValue as T;
  } else {
    if (typeGuard(parsedValue)) {
      return parsedValue;
    } else {
      throw new Error(`Value ${parsedValue} of ${name} failed typeguard check`);
    }
  }
}
