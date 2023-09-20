// Import Alpine.js if needed
import Alpine from "alpinejs";
import { registerXComponents } from "../../../src/components/XComponent";

// Define the mount function
export const mount = (component, options = {}) => {
  // Create a div element to host the Alpine.js component
  const div = document.createElement("div");

  // Apply Alpine.js-specific attributes or data
  div.innerHTML = component;

  // Append the div to the document body
  document.body.appendChild(div);

  // Initialize Alpine.js on the new element
  Alpine.start();

  registerXComponents();

  // Return the mounted component for further testing
  return cy.wrap(div);
};
