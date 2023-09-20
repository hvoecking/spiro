import { AlpineComponent } from "alpinejs";

export interface XAlpineComponent<T>
  extends AlpineComponent<Record<string | symbol, unknown>> {
  component: (this: T) => XAlpineComponent<T>;
}

// Factory function to create and register the custom element
export function createAndRegisterXComponent<T extends XAlpineComponent<T>>(
  component: (this: T) => XAlpineComponent<T>,
  html: string,
  componentName: string
) {
  class XComponent extends HTMLElement {
    constructor(readonly component: (this: T) => XAlpineComponent<T>) {
      super();
    }

    connectedCallback() {
      this.innerHTML = html;
    }
  }
  customElements.define(
    `x-${componentName}-template`,
    XComponent as unknown as CustomElementConstructor
  );
  const xComponent = new XComponent(component);
  document.body.appendChild(xComponent);
  return xComponent;
}

export function registerXComponents() {
  document.querySelectorAll("[x-component]").forEach((component) => {
    const componentName = `x-${component.getAttribute("x-component")}`;
    class Component extends HTMLElement {
      connectedCallback() {
        this.append(component.content.cloneNode(true));
      }

      data() {
        const attributes = this.getAttributeNames();
        const data: { [key: string]: unknown } = {
          get: (attribute: string) => {
            return data[attribute];
          },
        };
        attributes.forEach((attribute) => {
          data[attribute] = this.getAttribute(attribute);
        });
        return data;
      }
    }
    customElements.define(componentName, Component);
  });
}
