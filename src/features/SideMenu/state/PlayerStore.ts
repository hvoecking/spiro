import Alpine from "alpinejs";
import { config } from "../../../config/config";

const _store = {
  isOpen: false,
  isAdvancedMenuOpen: config.defaultIsAdvancedMenuOpen,
  isExperimentalMenuOpen: config.defaultIsExperimentalMenuOpen,
};

Alpine.store("sideMenu", _store);

export const sideMenuStore: typeof _store = Alpine.store("sideMenu") as typeof _store;
