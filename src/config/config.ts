import { Toaster } from "../features/Toaster/service/Toaster";
import { getTypedHashParam } from "../lib/UrlHashParams";

type AppMode = "development" | "test" | "production";

function parseBoolean(str: string): boolean {
  return str.toLowerCase() === "true";
}

export const config = {
  appMode: import.meta.env.VITE_APP_MODE as AppMode,

  appVersion: import.meta.env.VITE_APP_VERSION,

  autoAdvanceDelaySeconds: parseFloat(
    import.meta.env.VITE_AUTO_ADVANCE_DELAY_SECONDS,
  ),

  checkActivity: parseBoolean(import.meta.env.VITE_CHECK_ACTIVITY),

  defaultIsAdvancedMenuOpen: parseBoolean(
    import.meta.env.VITE_DEFAULT_IS_ADVANCED_MENU_OPEN,
  ),

  defaultIsAutoAdvanceMode: parseBoolean(
    import.meta.env.VITE_DEFAULT_IS_AUTO_ADVANCE_MODE,
  ),

  defaultIsExperimentalMenuOpen: parseBoolean(
    import.meta.env.VITE_DEFAULT_IS_EXPERIMENTAL_MENU_OPEN,
  ),

  defaultIsPerformanceDisplayOpen: parseBoolean(
    import.meta.env.VITE_DEFAULT_IS_PERFORMANCE_DISPLAY_OPEN,
  ),

  resetOnWindowResize: parseBoolean(
    import.meta.env.VITE_RESET_ON_WINDOW_RESIZE,
  ),

  enableSeedComponent: parseBoolean(import.meta.env.VITE_ENABLE_SEED_COMPONENT),

  toastOnError: parseBoolean(import.meta.env.VITE_TOAST_ON_ERROR),
};

Object.entries(config).forEach(([key, originalValue]) => {
  const value = getTypedHashParam(key);
  if (value === null) return;
  if (value === originalValue) return;
  console.warn(`Overriding config.${key} with ${value} (was ${originalValue})`);
  config[key as never] = value as never;
});

const toaster = new Toaster();
let errorToastIndex: number | null = null;

window.addEventListener("error", event => {
  // Create a toast for the error
  if (!config.toastOnError) return;
  if (errorToastIndex !== null && toaster.isToastVisible(errorToastIndex)) return;
  errorToastIndex = toaster.createToast(event.message, "error");
});
