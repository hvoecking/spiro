
type EventName =
  "auto-advance-mode-changed" |
  "escape" |
  "fps-mode-changed" |
  "fps-update" |
  "pause-changed" |
  "shutdown" |
  "update-seed" |
  "zoom-changed";

export function listen(eventName: EventName, fn: EventListenerOrEventListenerObject) {
  document.body.addEventListener(eventName, fn);
}

export function dispatch(eventName: EventName, detail: unknown = null, bubbles = true, composed = true): void {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles,
    composed, // Whether the event will trigger listeners outside of the shadow root
  });
  document.body.dispatchEvent(event);
}
