import template from "./InactivityTracker.html?raw";
import { XComponent } from "../../../lib/XComponent";
import { inactivityTrackerStore } from "../state/InactivityStore";
import { config } from "../../../config/config";
import { playerStore } from "../../Player/state/PlayerStore";
import { sideMenuStore } from "../../SideMenu/state/PlayerStore";

const INACTIVITY_TIMEOUT = 2000;

let wakeLock: WakeLockSentinel | null = null;
const requestWakeLock = async () => {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
    });
  } catch (e: unknown) {
    const err = e as Error;
    console.error(`Could not obtain wake lock: ${err.name}, ${err.message}`);
  }
};

// Function to release the wake lock
const releaseWakeLock = () => {
  if (wakeLock !== null) {
    wakeLock.release();
    wakeLock = null;
  }
};

export function inactivityTrackerFactory() {
  function inactivityTrackerComponent() {
    return {
      lastActivityTime: Date.now(),
      checkActivity() {
        if (!config.checkActivity) return;
        const wasActive = Date.now() - this.lastActivityTime < INACTIVITY_TIMEOUT;
        const isOpen = sideMenuStore.isOpen;
        inactivityTrackerStore.isActive = wasActive || isOpen || playerStore.isPaused;
        if (inactivityTrackerStore.isActive) {
          releaseWakeLock();
        } else {
          requestWakeLock();
        }
      },

      reportActivity() {
        this.lastActivityTime = Date.now();
        this.checkActivity();
      },

      init() {
        // Consider these events as activity
        document.addEventListener("mousemove", () => {
          this.reportActivity();
        });
        // document.addEventListener("keydown", () => {
        //  this.reportActivity();
        // });
        document.addEventListener("click", () => {
          this.reportActivity();
        });

        // Kick off the activity check
        const checkActivity = () => this.checkActivity();
        function activityLoop() {
          setTimeout(() => {
            checkActivity();
            activityLoop();
          }, INACTIVITY_TIMEOUT);
        }
        activityLoop();
      },
    };
  }
  return new XComponent(template, "inactivity-tracker", inactivityTrackerComponent);
}
