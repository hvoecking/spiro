import Alpine from "alpinejs";

import { clamp } from "../lib/Math";
import { Seed, seedStore } from "./Seed/state/SeedStore";
import { mnemonicFromSeed, seedFromMnemonic } from "./Seed/component/SeedMenu";
import { getBareHashParam, setBareHashParam } from "../lib/UrlHashParams";

const _mnemonicsStore = {
  mnemonics: [] as string[],
  currentIdx: -1,

  newMnemonic() {
    const seed = [];
    for (let i = 0; i < 128; i++) {
      seed.push(Math.random() < 0.5 ? "0" : "1");
    }
    this.pushSeed(seed);
  },

  pushSeed(seed: Seed) {
      this.pushMnecomic(mnemonicFromSeed(seed));
  },

  pushMnecomic(mnemonic: string) {
      this.mnemonics.push(mnemonic);
      this.setCurrentIdx(this.mnemonics.length - 1);
  },

  previousMnemonic() {
    this.setCurrentIdx(this.currentIdx - 1);
  },

  nextMnemonic() {
    const newIdx = this.currentIdx + 1;
    if (newIdx < this.mnemonics.length) {
      this.setCurrentIdx(newIdx);
    } else {
      this.newMnemonic();
    }
  },

  setCurrentIdx(idx: number) {
    this.currentIdx = clamp(idx, 0, this.mnemonics.length - 1);
    this.storeToLocationHash();
    seedStore.setSeed(seedFromMnemonic(this.mnemonics[this.currentIdx]) as Seed, false);
  },

  storeToLocationHash() {
    setBareHashParam("mnemonic", this.mnemonics[this.currentIdx]);
  },

  loadFromLocationHash(): boolean {
    const loadedMnemonic = getBareHashParam("mnemonic");
    if (!loadedMnemonic) {
      return false;
    }
    const isMnemonicValid = !!seedFromMnemonic(loadedMnemonic);
    if (isMnemonicValid) {
      this.pushMnecomic(loadedMnemonic);
    }
    return isMnemonicValid;
  },
};
Alpine.store("mnemonics", _mnemonicsStore);

export const mnemonicsStore = Alpine.store("mnemonics") as typeof _mnemonicsStore;

export function mnemonicsComponent() {
  return {};
}
