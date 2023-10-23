import { Point } from "../../../../src/lib/Point";
import { ResetHandler } from "../../../../src/core/services/ResetHandler";


describe("ResetHandler", () => {
  it("should throw if provider is missing", () => {
    const resetHandler = new ResetHandler();
    const listener = jest.fn();
    resetHandler.registerListener(listener);

    expect(() => resetHandler.requestReset(false)).toThrow("providers.center is not a function");
    resetHandler.registerProvider("center", () => Point.zero());
    expect(() => resetHandler.requestReset(false)).toThrow("providers.scale is not a function");
    resetHandler.registerProvider("scale", () => 1);
    expect(() => resetHandler.requestReset(false)).not.toThrow();
  });

  // Call performReset without registering a listener
  it("should throw if reset is performed without being requested", () => {
    const resetHandler = new ResetHandler();
    const provider = jest.fn().mockReturnValue(Point.zero());
    resetHandler.registerProvider("center", provider);

    expect(() => {
      resetHandler.performReset();
    }).toThrow("No reset requested.");
  });

  // Register a provider and call requestReset and performReset to update the state and notify the listener
  it("should update the state and notify the listener when requestReset and performReset are called", () => {
    const resetHandler = new ResetHandler();
    const listener = jest.fn();
    resetHandler.registerProvider("center", () => Point.zero());
    resetHandler.registerProvider("scale", () => 1);
    resetHandler.registerListener(listener);

    resetHandler.requestReset(false);
    resetHandler.performReset();

    expect(listener).toHaveBeenCalledWith({ center: Point.zero(), scale: 1, immediateFeedback: false });
    expect(resetHandler.resetRequested()).toBe(false);
  });

  // Call performReset without registering a listener
  it("should not throw an error when performReset is called without registering a listener", () => {
    const resetHandler = new ResetHandler();
    const listener = jest.fn();
    resetHandler.registerProvider("center", () => Point.zero());
    resetHandler.registerProvider("scale", () => 1);
    resetHandler.registerListener(listener);

    resetHandler.requestReset(false);
    expect(() => {
      resetHandler.performReset();
    }).not.toThrow();
  });

  // Call requestReset multiple times before calling performReset
  it("should update the state and notify the listener only once when requestReset is called multiple times before performReset", () => {
    const resetHandler = new ResetHandler();
    const provider = jest.fn().mockReturnValue({ center: Point.zero() });
    const listener = jest.fn();
    resetHandler.registerProvider("center", provider);
    resetHandler.registerProvider("scale", () => 1);
    resetHandler.registerListener(listener);

    resetHandler.requestReset(false);
    resetHandler.requestReset(false);
    resetHandler.performReset();

    expect(provider).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  // Call getResetPromise before requestReset to get null
  it("should always use the most recent values on performing reset", async () => {
    const resetHandler = new ResetHandler();
    const provider0 = jest.fn().mockReturnValue(Point.zero());
    const listener = jest.fn();
    resetHandler.registerProvider("center", provider0);
    resetHandler.registerProvider("scale", () => 1);
    resetHandler.registerListener(listener);

    resetHandler.requestReset(false);

    const provider1 = jest.fn().mockReturnValue(Point.one());
    resetHandler.registerProvider("center", provider1);
    resetHandler.requestReset(false);

    resetHandler.performReset();

    expect(provider0).toHaveBeenCalledTimes(1);
    expect(provider1).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ center: Point.one(), scale: 1, immediateFeedback: false });
  });
});
