import Alpine from "alpinejs";

class Toast {
  public visible;

  constructor(
    public id: number,
    public message: string,
    public type: string,
  ) {
    // For the toast to transition in, it must be invisible at first.
    this.visible = false;
  }
}

const _toasterStore = {
  toasts: [] as Toast[],
  createToast(message: string, type = "info") {
    const index = this.toasts.length;
    this.toasts.push(new Toast(
      index,
      message,
      type,
    ));
    Alpine.nextTick(() => {
      this.toasts[index].visible = true;
      const totalVisible = this.toasts.filter(toast => toast.visible).length;
      setTimeout(() => {
        this.destroyToast(index);
      }, 2000 * totalVisible);
    });
    return index;
  },
  destroyToast(index: number) {
    this.toasts[index].visible = false;
  },
  replaceText(index: number, message: string) {
    this.toasts[index].message = message;
  }
};

Alpine.store("toaster", _toasterStore);

export const toasterStore: typeof _toasterStore = Alpine.store(
  "toaster"
) as typeof _toasterStore;
