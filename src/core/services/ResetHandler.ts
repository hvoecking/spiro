import { Point } from "../../lib/Point";

class ResetValues {
  readonly center: Point;
  readonly scale: number;
  constructor(providers: ResetValueProviders, readonly immediateFeedback: boolean) {
    this.center = providers.center() as Point;
    this.scale = providers.scale() as number;
  }
}

type ResetValueProviders = Record<keyof ResetValues, () => ResetValues[keyof ResetValues]>;

export class ResetHandler {
  private listeners: ((store: ResetValues) => void)[] = [];
  private providers: Partial<ResetValueProviders> = {};
  private resetValues: ResetValues | null = null;
  initialResetPerformed = false;

  registerListener(listener: (store: ResetValues) => void) {
    this.listeners.push(listener);
  }

  registerProvider(property: keyof ResetValues, provider: () => ResetValues[keyof ResetValues]) {
    this.providers[property] = provider;
  }

  requestReset(immediateFeedback: boolean) {
    this.resetValues = new ResetValues(this.providers as ResetValueProviders, immediateFeedback);
  }

  resetRequested() {
    return this.resetValues !== null;
  }

  performReset() {
    if (!this.resetRequested()) {
      throw new Error("No reset requested.");
    }
    this.listeners.forEach((listener) => listener(this.resetValues!));
    this.resetValues = null;
    this.initialResetPerformed = true;
  }
}

export const resetHandler = new ResetHandler();
