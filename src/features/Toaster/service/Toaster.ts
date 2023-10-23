import { toasterStore } from "../state/ToasterStore";

export type ToastType = "info" | "success" | "warning" | "error";

export class Toast {
  private visibilityTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public readonly id: number,
    public message: string,
    public readonly type: ToastType,
  ) {
  }

  showToast(currentlyVisible: number) {
    if (this.isVisible()) {
      this.hideToast();
    }
    this.visibilityTimeoutId = setTimeout(() => {
      this.visibilityTimeoutId = null;
    }, 2000 * (currentlyVisible + 1));
  }

  hideToast() {
    if (!this.isVisible()) {
      return;
    }
    clearTimeout(this.visibilityTimeoutId!);
    this.visibilityTimeoutId = null;
  }

  isVisible() {
    return this.visibilityTimeoutId !== null;
  }

  updateMessage(message: string) {
    if (!this.isVisible()) {
      throw new Error("Cannot update message of a toast that is not visible");
    }
    this.message = message;
  }
}

export class Toaster {
  public createToast(message: string, type: ToastType = "info") {
    const index = toasterStore.toasts.length;
    toasterStore.toasts.push(new Toast(
      index,
      message,
      type,
    ));
    // For the toast to transition in, it must be invisible at first.
    Alpine.nextTick(() => {
      toasterStore.toasts[index].showToast(this.getNumberOfVisibleToasts());
    });
    return index;
  }

  public hideToast(index: number, timeout: number = 0) {
    setTimeout(() => {
      toasterStore.toasts[index].hideToast();
    }, timeout);
  }

  public updateToast(index: number, message: string) {
    if (!toasterStore.toasts[index].isVisible())  {
      return this.createToast(message);
    }
    toasterStore.toasts[index].updateMessage(message);
    return index;
  }

  isToastVisible(index: number): boolean {
    return toasterStore.toasts[index].isVisible();
  }

  getNumberOfVisibleToasts() {
    return toasterStore.toasts.filter(toast => toast.isVisible()).length;
  }
}
