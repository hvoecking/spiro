/* eslint-disable no-undef */
/// <reference types="cypress" />

// Import Alpine.js if needed
import Alpine from "alpinejs";
import { getXComponents, registerXComponent } from "../../../src/lib/XComponent";

type AlpineWindow = Window & typeof globalThis & { Alpine: typeof Alpine };

(window as AlpineWindow).Alpine = Alpine;

// Define the mount function, add options = {} as second argument if needed
export const mount = (component) => {
  // Create a div element to host the Alpine.js component
  const div = document.createElement("div");

  // Apply Alpine.js-specific attributes or data
  div.innerHTML = component;

  // Append the div to the document body
  document.body.appendChild(div);

  // Initialize Alpine.js on the new element
  Alpine.start();

  getXComponents().forEach(c => registerXComponent(c));

  // Return the mounted component for further testing
  return cy.wrap(div);
};
