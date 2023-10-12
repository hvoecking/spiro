import Alpine from "alpinejs";
import { config } from "../../../config/config";

const _sideMenuStore = {
  isOpen: false,
  isAdvancedMenuOpen: config.defaultIsAdvancedMenuOpen,
  isExperimentalMenuOpen: config.defaultIsExperimentalMenuOpen,
};

Alpine.store("sideMenu", _sideMenuStore);

export const sideMenuStore: typeof _sideMenuStore = Alpine.store("sideMenu") as typeof _sideMenuStore;
