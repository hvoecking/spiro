import Alpine, { AlpineComponent } from "alpinejs";

import { CanvasStore } from "./Canvas";
import { MnemonicsStore, mnemonicsStore } from "./Mnemonics";

import { Buffer } from "buffer";
(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;  // For bip39
import * as bip39 from "bip39";

export type Seed = string[];

interface SeedBaseModel extends AlpineComponent<Record<string | symbol, unknown>> {
  seed: Seed;
  numericSeed: number;
  mnemonic: string;
  isMnemonicValid: boolean;
  init(): void;
  checkMnemonic(): void;
  updateFromBin(): void;
  updateFromDec(): void;
  updateFromMnemonic(): void;
  updateFromNumericSeed(): void;
  updateFromStore(): void;
  saveAndClose(): void;
  close(): void;
  updateFromBinFunctions: ((seedModel: SeedModel, seed: Seed) => Seed)[];
  updateFromDecFunctions: ((seedModel: SeedModel, seed: Seed) => Seed)[];
  fromSeedFunctions: ((seedModel: SeedModel, seed: Seed) => void)[];
  $dispatch(event: string): void;
}

type SeedModel = { [x: string]: string | number | boolean } & SeedBaseModel;
let seedModel: SeedModel;

export interface SeedStore {
  isOpen: boolean;
  seed: Seed;
  setSeed(seed: Seed, immediateFeedback: boolean): void;
}

const afterInit = Alpine.nextTick;
export const seedStore: SeedStore = {
  isOpen: false,
  seed: [] as Seed,
  setSeed(seed: Seed, immediateFeedback: boolean) {
    this.seed = seed;
    afterInit(() => seedModel.$dispatch("update-seed"));
    (Alpine.store("canvas") as CanvasStore).requestReset(immediateFeedback);
  },
};
Alpine.store("seed", seedStore);

function signedSeedPart(
  name: string,
  pos: number,
  bits: number,
  sign: string | null,
  dec: string,
  bin: string,
  initialValue: number = 0
) {
  const numberBits = bits - (sign ? 1 : 0);
  const width = `${numberBits * 0.7 + 0.7}em`;
  const model: { [x: string]: string | number | boolean } = {
    [bin]: initialValue.toString(2).padStart(numberBits, "0"),
    [dec]: initialValue,
  };
  if (sign) {
    model[sign] = initialValue < 0;
  }
  return {
    model,
    functions: {
      updateFromDec(seedModel: SeedModel, seed: Seed) {
        let bitStr = sign ? (seedModel[sign] ? "1" : "0") : "";
        bitStr += parseInt(seedModel[dec] as string)
          .toString(2)
          .padStart(numberBits, "0");
        const newSeed = seed.slice();
        newSeed.splice(pos, bits, ...bitStr.split(""));
        return newSeed;
      },
      updateFromBin(seedModel: SeedModel, seed: Seed) {
        const newSeed = seed.slice();
        newSeed.splice(pos, bits, ...(seedModel[bin] as string).split(""));
        return newSeed;
      },
      fromSeed(seedModel: SeedModel, seed: Seed) {
        const seedPart = seed.slice(pos, pos + bits);
        if (sign) {
          seedModel[sign] = seedPart[0] === "1";
          seedModel[bin] = seedPart.slice(1, bits).join("");
          seedModel[dec] = parseInt(seedModel[bin] as string, 2);
        } else {
          seedModel[bin] = seedPart.join("");
          seedModel[dec] = parseInt(seedModel[bin] as string, 2);
        }
      },
    },
    html: `
<table class="min-w-max text-white">
  <thead>
    <tr>
      ${sign ? "<th></th>" : ""}
      <th style="width: ${width};">${name}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      ${
        sign
          ? `<td><input type="checkbox" id="${sign}-checkbox" x-model="${sign}" @input="Alpine.nextTick(() => updateFromDec())" /></td>`
          : ""
      }
      <td>
        <input
          @input="updateFromDec()"
          id="${dec}-slider"
          max="${
            2 ** numberBits - 1
          }"
          min="0"
          style="width: ${width};"
          type="range"
          x-model="${dec}"
        />
      </td>
    </tr>
    <tr>
      ${
        sign
          ? `<td x-text="${sign} ? '-' : '+'" style="text-align: right;"></td>`
          : ""
      }
      <td><input
        @input="updateFromDec()"
        class="bg-transparent"
        id="${dec}-text"
        max="${
          2 ** numberBits - 1
        }"
        min="0"
        type="number"
        x-model="${dec}" /></td>
    </tr>
    <tr>
      ${
        sign
          ? `<td x-text="${sign} ? 1 : 0" style="text-align: center;"></td>`
          : ""
      }
      <td>
        <input
          @input="updateFromBin()"
          class="bg-transparent"
          id="${bin}-text"
          pattern="^[01]{${numberBits}}$"
          style="width: ${width};"
          type="text"
          x-model="${bin}"
        />
      </td>
    </tr>
  </tbody>
</table>
`,
  };
}

const firstColHtml = "";

export function mnemonicFromSeed(seed: Seed, pad: boolean = false): string {
  let hex = "";
  const s = seed.join("");
  for (let i = 0; i < s.length; i += 4) {
    const fourBits = s.substring(i, i + 4);
    const hexDigit = parseInt(fourBits, 2).toString(16);
    hex += hexDigit;
  }
  const mnemonic = bip39.entropyToMnemonic(hex);
  return mnemonic.split(" ").map(s => s.padStart(pad ? 8 : 0, " ")).join(" ");
}

export function seedFromMnemonic(mnemonic: string) {
  let seedBinary = "";
  for (const byte of Buffer.from(bip39.mnemonicToEntropy(mnemonic), "hex")) {
    seedBinary += byte.toString(2).padStart(8, "0");  // Convert each byte to its 8-bit binary representation
  }
  return seedBinary.split("");
}

export function seedComponent(this: SeedModel): SeedModel {
  seedModel = {
    numericSeed: 0,
    mnemonic: "",

    saveAndClose() {
      mnemonicsStore.pushSeed(seedStore.seed);
      this.close();
    },

    close() {
      seedStore.isOpen = false;
    },

    updateFromBinFunctions: [] as ((seedModel: SeedModel, seed: Seed) => Seed)[],
    updateFromBin() {
      let seed = seedStore.seed;
      for (const f of this.updateFromBinFunctions) {
        seed = f(this as SeedModel, seed);
      }
      seedStore.setSeed(seed, true);
    },

    updateFromDecFunctions: [] as ((seedModel: SeedModel, seed: Seed) => Seed)[],
    updateFromDec() {
      let seed = seedStore.seed;
      for (const f of this.updateFromDecFunctions) {
        seed = f(this as SeedModel, seed);
      }
      seedStore.setSeed(seed, true);
    },

    updateFromNumericSeed(value: number) {
      if (value >= Number.MAX_SAFE_INTEGER - 1) {
        // Set seed to max value
        seedStore.setSeed("1".repeat(128).split(""), true);
      } else {
        // Fake a 128-bit precision by spreading the 53 bits of Number.MAX_SAFE_INTEGER
        seedStore.setSeed((
          (BigInt(value) << BigInt(75)) +
          (BigInt(value) << BigInt(22)) +
          (BigInt(value) >> BigInt(31))
        ).toString(2).padStart(128, "0").split(""), true);
      }
    },

    fromSeedFunctions: [] as ((seedModel: SeedModel, seed: Seed) => void)[],
    updateFromStore() {
      const seed = (Alpine.store("seed") as SeedStore).seed;
      for (const f of this.fromSeedFunctions) {
        f(this as SeedModel, seed);
      }
      this.mnemonic = mnemonicFromSeed(seed, true);

      // Only use the most significant 53 bits of the seed as that is the maximum
      // precision of an integer number for a slider
      this.numericSeed = Number(BigInt(`0b${seed.join("")}`) >> BigInt(75));
    },

    isMnemonicValid: true,
    updateFromMnemonic() {
      const seed = seedFromMnemonic(this.mnemonic);
      if (!seed) {
        return;
      }
      seedStore.setSeed(seed, false);
    },
    checkMnemonic() {
      this.isMnemonicValid = !!seedFromMnemonic(this.mnemonic);
    },

    init() {
      let seedConfigHtml = firstColHtml;
      let pos = 0;
      [
        { name: "PositionX", bits: 16, signed: true },
        { name: "PositionY", bits: 16, signed: true },
        { name: "VelocityX", bits: 16, signed: true },
        { name: "VelocityY", bits: 16, signed: true },
        { name: "Gravity", bits: 16, signed: false },
        { name: "Hue", bits: 9, signed: false },
        { name: "Sat", bits: 7, signed: false },
        { name: "AddX", bits: 8, signed: true },
        { name: "AddY", bits: 8, signed: true },
        { name: "MulX", bits: 8, signed: false },
        { name: "MulY", bits: 8, signed: false },
      ].forEach(({ name, bits, signed }) => {
        const generated = signedSeedPart(
          name,
          pos,
          bits,
          signed ? `sign${name}` : null,
          `dec${name}`,
          `bin${name}`,
          3
        );
        pos += bits;
        Object.assign(this, generated.model);
        this.updateFromBinFunctions.push(generated.functions.updateFromBin);
        this.updateFromDecFunctions.push(generated.functions.updateFromDec);
        this.fromSeedFunctions.push(generated.functions.fromSeed);
        seedConfigHtml += generated.html;
      });

      document.querySelector<HTMLDivElement>("#seedConfig")!.innerHTML = seedConfigHtml;

      if (!(Alpine.store("mnemonics") as MnemonicsStore).loadFromLocationHash()) {
        (Alpine.store("mnemonics") as MnemonicsStore).newMnemonic();
      }
    },
  } as SeedModel;
  return seedModel;
}
