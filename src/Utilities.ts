export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function isDevMode(): boolean {
  return (
    window.location.href.startsWith("http://localhost") ||
    window.location.href.startsWith("http://192.168.")
  );
}
