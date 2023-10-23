import Alpine from "alpinejs";
import { Toast } from "../service/Toaster";



const _store = {
  toasts: [] as Toast[],
};

Alpine.store("toaster", _store);

export const toasterStore = Alpine.store("toaster") as typeof _store;
