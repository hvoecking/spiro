import Alpine from "alpinejs";

export function addAlpineToWindow() {
  type AlpineWindow = Window & typeof globalThis & { Alpine: typeof Alpine };

  (window as AlpineWindow).Alpine = Alpine;
}
