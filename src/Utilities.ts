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

export function dispatch(eventName: string, detail: unknown = null, bubbles = true, composed = true): void {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles, // Whether the event bubbles up through the DOM or not
    composed, // Whether the event will trigger listeners outside of the shadow root
  });
  document.body.dispatchEvent(event);
}
