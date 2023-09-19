import Alpine from "alpinejs";

import { Seed, SeedStore, mnemonicFromSeed, seedFromMnemonic } from "./Seed";
import { clamp } from "../Utilities";

export interface MnemonicsStore {
  mnemonics: string[];
  currentIdx: number;
  newMnemonic(): void;
  pushSeed(seed: Seed): void;
  pushMnecomic(mnemonic: string): void;
  previousMnemonic(): void;
  nextMnemonic(): void;
  setCurrentIdx(idx: number): void;
  storeToLocationHash(): string;
  loadFromLocationHash(): boolean;
}

export const mnemonicsStore: MnemonicsStore = {
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
    (Alpine.store("seed") as SeedStore).setSeed(seedFromMnemonic(this.mnemonics[this.currentIdx]) as Seed, false);
  },

  storeToLocationHash(): string {
    const encoded = encodeURIComponent(this.mnemonics[this.currentIdx]);
    const hash = `mnemonic=${encoded.replace(/%20/g, "+")}`;
    window.location.hash = hash;
    return hash;
  },

  loadFromLocationHash(): boolean {
    const hash = decodeURIComponent(window.location.hash.substring(1)); // Remove the '#' at the beginning
    const params = new URLSearchParams(hash);
    const loadedMnemonic = params.get("mnemonic");
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
Alpine.store("mnemonics", mnemonicsStore);

export function mnemonicsComponent() {
  return {};
}
