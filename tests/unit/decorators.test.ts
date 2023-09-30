import { Gettable, Settable, createTypeSafeProxy } from "../../src/decorators";

describe("Decorators", () => {
  class TestClass {
    @Gettable
    readonlyProperty: number = 1;

    @Settable
    writeonlyProperty: number = 2;

    @Gettable
    @Settable
    readwriteProperty: number = 3;
  }

  let proxyInstance: TestClass;

  beforeEach(() => {
    const instance = new TestClass();
    proxyInstance = createTypeSafeProxy(instance);
  });

  test("should allow read access to @Gettable property", () => {
    expect(proxyInstance.readonlyProperty).toBe(1);
  });

  test("should fail on attempt to write to @Gettable property", () => {
    expect(() => {
      proxyInstance.readonlyProperty = 100; // should fail
    }).toThrow(TypeError);
  });

  test("should not allow read access to @Settable property", () => {
    expect(proxyInstance.writeonlyProperty).toBeUndefined();
  });

  test("should allow write access to @Settable property", () => {
    proxyInstance.writeonlyProperty = 100;
    expect(proxyInstance.writeonlyProperty).toBeUndefined(); // still undefined because it's not gettable
  });

  test("should allow both read and write access to @Gettable @Settable property", () => {
    expect(proxyInstance.readwriteProperty).toBe(3);
    proxyInstance.readwriteProperty = 100;
    expect(proxyInstance.readwriteProperty).toBe(100);
  });
});
