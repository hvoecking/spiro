import Alpine from "alpinejs";

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
  return window.location.search.includes("test=true");
}

type EventName =
  "auto-advance-mode-changed" |
  "escape" |
  "fps-mode-changed" |
  "fps-update" |
  "pause-changed" |
  "shutdown" |
  "zoom-changed";

export function listen(eventName: EventName, fn: EventListenerOrEventListenerObject) {
  document.body.addEventListener(eventName, fn);
}

export function dispatch(eventName: EventName, detail: unknown = null, bubbles = true, composed = true): void {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles, // Whether the event bubbles up through the DOM or not
    composed, // Whether the event will trigger listeners outside of the shadow root
  });
  document.body.dispatchEvent(event);
}

export function addAlpineToWindow() {
  type AlpineWindow = Window & typeof globalThis & { Alpine: typeof Alpine };

  (window as AlpineWindow).Alpine = Alpine;
}
