import Alpine from "alpinejs";

const INACTIVITY_TIMEOUT = 2000;

export const sideMenuStore = {
  isOpen: false,
  
  toggle() {
    this.isOpen = !this.isOpen;
  },

  close() {
    this.isOpen = false;
  },
};
Alpine.store("sideMenu", sideMenuStore);

export const activityStore = {
  lastActivityTime: Date.now(),
  isActive: true,

  checkActivity() {
    const wasActive = Date.now() - this.lastActivityTime < INACTIVITY_TIMEOUT;
    const isOpen = Alpine.store("sideMenu").isOpen;
    this.isActive = wasActive || isOpen;
  },
  
  reportActivity() {
    this.lastActivityTime = Date.now();
    this.checkActivity();
  },
};
Alpine.store("activity", activityStore);

export function chevronComponent() {
  return {
    chevronSymbol: "›",
    opacity: 1,

    toggleSideMenu() {
      Alpine.store("sideMenu").toggle();
    },

    checkActivity() {
      setTimeout(() => {
        activityStore.checkActivity();
        this.opacity = activityStore.isActive ? 1 : 0;
        this.checkActivity();
      }, INACTIVITY_TIMEOUT);
    },

    reportActivity() {
      activityStore.reportActivity();
      this.opacity = activityStore.isActive ? 1 : 0;
    },
    
    init() {
      // The init animation starts at 500ms and takes another 700ms to complete. The
      // chevron animation takes 300ms. We want a delay that makes both to end at the
      // same time.
      const delay = 500 + 700 - 300;
      setTimeout(() => {
        this.$refs.chevron.classList.remove("-left-full");
        this.$refs.chevron.classList.add("left-0");
      }, delay); 

      // Consider these events as activity
      document.addEventListener("mousemove", () => { this.reportActivity(); });
      document.addEventListener("keydown", () => { this.reportActivity(); });
      document.addEventListener("click", () => { this.reportActivity(); });

      // Kick off the activity check
      this.checkActivity();
    },
  };
}

export function sideMenuComponent() {
  return {};
}
