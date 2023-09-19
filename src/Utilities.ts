export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function isDevMode(): boolean {
  // Should be a local URL and not have test=true searchParams
  return (
    window.location.href.startsWith("http://localhost") ||
    window.location.href.startsWith("http://192.168.")
  ) && !isTestMode();
}
export function isTestMode(): boolean {
  // Should be a local URL and not have test=true searchParams
  return window.location.search.includes("test=true");
}
