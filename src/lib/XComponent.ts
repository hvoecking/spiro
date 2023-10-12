import { AlpineComponent } from "alpinejs";

/**
 * Shorthand for AlpineComponent for better readability
 */
export type XAlpineComponent = AlpineComponent<
  Record<string | symbol, unknown>
>;

type AttributeGetter = (attrName: string) => string | boolean | null;

interface DataAttributes {
  get: AttributeGetter;
  [x: string]: string | null | AttributeGetter;
}

const X_COMPONENT_ATTRIBUTE = "x-component";

/**
 * Appends the content of an HTML template to an element.
 */
function appendTemplateContent(element: HTMLElement, template: HTMLTemplateElement) {
  element.append(template.content.cloneNode(true));
}

/**
 * Registers an `x-component` as custom HTML element.
 */
export function registerXComponent(component: HTMLTemplateElement) {
  const componentName = `x-${component.getAttribute(X_COMPONENT_ATTRIBUTE)}`;
  class Component extends HTMLElement {
    connectedCallback() {
      appendTemplateContent(this, component);
    }

    /**
     * Copies the data attributes from the parent to the child component, used in the
     * HTML template to copy data attributes.
     *
     * @return An object containing data attributes.
     */
    data(): DataAttributes {
      const attributes = this.getAttributeNames();
      const data: DataAttributes = {
        get: (attrName: string) => {
          const value = this.dataset[attrName];
          if (value === undefined) {
            return false;
          }
          if (value === "") {
            // Allow definition of empty data attributes to enable them
            return true;
          }
          return value;
        },
      };

      attributes.forEach((attribute) => {
        data[attribute] = this.getAttribute(attribute);
      });

      return data;
    }
  }
  customElements.define(componentName, Component);
}

/**
 * Gets all elements with an `x-component` attribute from the HTML document to iterate
 * over all x-components in the DOM.
 */
export function getXComponents(): NodeListOf<HTMLTemplateElement> {
  return document.querySelectorAll(`[${X_COMPONENT_ATTRIBUTE}]`);
}

/**
 * Registers Alpine.js component with its HTML template.
 */
export class XComponent {
  /**
   * @param htmlTemplateString - HTML template string of the component.
   * @param componentName - Name of the custom component.
   * @param alpineComponent - Alpine.js component.
   * @return The created Alpine.js component instance.
   */
  constructor(
    htmlTemplateString: string,
    public readonly componentName: string,
    public readonly alpineComponent: (...args: unknown[]) => XAlpineComponent,
  ) {
    const templateElement = document.createElement("template");
    templateElement.innerHTML = htmlTemplateString.trim();

    class Template extends HTMLElement {
      connectedCallback() {
        appendTemplateContent(this, templateElement);
      }
    }

    customElements.define(`x-${componentName}-template`, Template);
    document.body.appendChild(new Template() as Node);
  }
}

export function addComponent(xc: XComponent) {
  Alpine.data(
    `${xc.componentName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Component`,
    xc.alpineComponent,
  );
}
