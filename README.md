# SPIRO

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Table of Contents

1. [Project Description](#project-description)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Screenshots & Demo](#screenshots--demo)
6. [License](#license)
7. [Author](#author)

---

## Project Description

Inspired by the spirograph, Spiro is a digital visualization tool. The core concept involves tracing a graph of a single particle orbiting a black hole without any friction. This results in a chaotic system where slightly different starting positions yield entirely different patterns. It allows to save and load the exact starting conditions via a 128-bit seed, represented as a BIP39 mnemonic seed.

**Note**: The seeds generated by Spiro should not be used as Bitcoin seeds, and users should never enter their Bitcoin seed into this tool.

### Purpose

I wanted to build a visualization while I play music on my TV to avoid burn-in

---

## Features

- [x] **Save & Load**: BIP39 mnemonic seeds for saving and loading specific patterns.
- [x] **Themes**: Dark and light modes for better visibility.
  - [x] Automatically start in mode of OS.
- [ ] **Audio Capture**: Beat detection based on microphone or audio input, allowing pattern changes to be music-driven.
- [x] **Time-Based Changes**: Alternative to audio-based pattern changes.
  - [x] Track FPS to adjust to machine speed
- [x] **Entropy Options**: Switch between circles (96 bits) and shapes (128 bits).
- [x] **Rendering Options**: Switch between JS, WebAssembly and select 32 or 64 bits of floating point precision

### Todo
- x Play/Pause UI element
- x Prev and next seed
- x Menu Buttons in upper left
- x Stats display
- x Hide seed config behind eject button
- x Load & Save for Mnemonic via share button and URL
- x Zoom using wheel
- Add like/dislike buttons

### Bugs
- Keyboard input in binary seed not working properly

---

## Installation

1. Clone the repository
    ```bash
    git clone https://github.com/hvoecking/spiro.git
    ```

2. Install npm dependencies
    ```bash
    npm install
    ```

3. Install global npm dependencies
    ```bash
    npm i -g asc
    ```

3. Install external dependencies
  * In order to convert small icons to base64 strings and embed them as style sheets the [`convert`](https://imagemagick.org/script/convert.php) command from [ImageMagic](https://imagemagick.org/script/download.php) must be available as a shell command.

---

## Usage

1. Build the project
    ```bash
    npm run build
    ```

2. Start the development server
    ```bash
    npm run dev
    ```

---

## Screenshots & Demo

For a live demo visit [hvo.io](http://hvo.io).

---

## License

This project is licensed under the MIT License.

---

## Author

For any questions or feedback, please contact [heye@hvo.io](mailto:heye@hvo.io).

# Contribution Notes
## HTML/Tailwind CSS
### Recommended Order for Tailwind CSS Classes

1. **Layout and Box Model**
    - `container`, `box`, `block`, `hidden`
    - Reasoning: These classes lay the foundation for the element's structure.

2. **Positioning**
    - `relative`, `absolute`, `fixed`
    - Reasoning: They set the element's position in relation to its parent or the viewport.

3. **Display**
    - `flex`, `grid`, `inline`, `inline-block`
    - Reasoning: These classes determine how the element should be displayed, often impacting its children.

4. **Flexbox and Grid Layout**
    - `justify-`, `items-`, `gap-`, `grid-cols-`
    - Reasoning: These are specific to flexbox and grid layouts, dictating how children should be organized.

5. **Spacing**
    - `p-`, `px-`, `py-`, `m-`, `mx-`, `my-`
    - Reasoning: These classes influence the spacing around the element, a key aspect of layout.

6. **Dimensions**
    - `w-`, `h-`, `min-h-`, `max-w-`
    - Reasoning: Directly responsible for the size of the element.

7. **Typography**
    - `font-`, `text-`, `leading-`, `tracking-`
    - Reasoning: These classes set the text properties, which are often specific to content within the element.

8. **Visuals**
    - `bg-`, `rounded-`, `shadow-`
    - Reasoning: These classes are mainly cosmetic but can affect the element's visibility and focus.

9. **Interactivity**
    - `cursor-`, `hover:`, `focus:`, `active:`
    - Reasoning: These classes affect how the element interacts with user input.

10. **SVG and Media**
    - `fill-`, `stroke-`
    - Reasoning: These are specific to SVG and media elements, often not applicable to standard HTML elements.

11. **Accessibility**
    - `sr-only`, `not-sr-only`
    - Reasoning: These classes are important for accessibility but don't impact the visual layout.
