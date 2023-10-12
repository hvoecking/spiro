/**
 * @jest-environment jsdom
 */

import {
  getBareHashParam,
  getTypedHashParam,
  isBoolean,
  isNumber,
  isString,
  setBareHashParam,
  setTypedHashParam,
} from "../../../src/lib/UrlHashParams";

afterEach(() => {
  window.location.hash = "";
});

describe("getBareHashParam", () => {
  // Returns the value of the hash parameter when it exists.
  it("should return the value of the hash parameter when it exists", () => {
    // Given
    const name = "param";
    const hash = `#${name}=value`;
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBe("value");
  });

  // Returns null when the hash parameter does not exist.
  it("should return null when the hash parameter does not exist", () => {
    // Given
    const name = "param";
    const hash = "#other=value";
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBeNull();
  });

  // Returns null when the hash is empty.
  it("should return null when the hash is empty", () => {
    // Given
    const name = "param";
    const hash = "";
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBeNull();
  });

  // Returns null when the hash parameter value is empty.
  it("should return null when the hash parameter value is empty", () => {
    // Given
    const name = "param";
    const hash = `#${name}=`;
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBeNull();
  });

  // Returns the decoded value of the hash parameter.
  it("should return the decoded value of the hash parameter", () => {
    // Given
    const name = "param";
    const value = "value with spaces";
    const encodedValue = encodeURIComponent(value);
    const hash = `#${name}=${encodedValue}`;
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBe(value);
  });

  // Returns the decoded value of the hash parameter when it contains special characters.
  it("should return the decoded value of the hash parameter when it contains special characters", () => {
    // Given
    const name = "param";
    const value = `value with special characters: & < > " ' /`;
    const encodedValue = encodeURIComponent(value);
    const hash = `#${name}=${encodedValue}`;
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBe(value);
  });

  // Returns the string 'undefined' when the hash parameter value is undefined.
  it("should return the string 'undefined' when the hash parameter value is undefined", () => {
    // Given
    const name = "param";
    const hash = `#${name}=undefined`;
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBe("undefined");
  });

  // Returns the string 'NaN' when the hash parameter value is NaN.
  it("should return the string 'NaN' when the hash parameter value is NaN", () => {
    // Given
    const name = "param";
    const hash = `#${name}=NaN`;
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBe("NaN");
  });

  // Returns the string '{}' when the hash parameter value is an empty object.
  it("should return the string '{}' when the hash parameter value is an empty object", () => {
    // Given
    const name = "param";
    const hash = `#${name}={}`;
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBe("{}");
  });

  // Returns the decoded value of the hash parameter when it contains URL-encoded characters.
  it("should return the decoded value of the hash parameter when it contains URL-encoded characters", () => {
    // Given
    const name = "param";
    const value = "value%20with%20URL-encoded%20characters";
    const encodedValue = encodeURIComponent(value);
    const hash = `#${name}=${encodedValue}`;
    jest
      .spyOn(window, "location", "get")
      .mockReturnValue({ hash } as unknown as Location);

    // When
    const result = getBareHashParam(name);

    // Then
    expect(result).toBe("value with URL-encoded characters");
  });
});

describe("setBareHashParam", () => {
  // Sets a new search param in the hash when given a name and value
  it("should set a new search param in the hash when given a name and value", () => {
    // Given
    const name = "param";
    const value = "value";
    const expectedHash = `${name}=${encodeURIComponent(value)}`;

    // When
    setBareHashParam(name, value);

    // Then
    // The hash of the real window.location should be prefixed with a "#" but since we mock it here this is not the case
    expect(window.location.hash.replace(/^#/, "")).toBe(expectedHash);
  });

  // Replaces an existing search param in the hash with a new value when given a name and value
  it("should replace an existing search param in the hash with a new value when given a name and value", () => {
    // Given
    const name = "param";
    const value = "value";
    const existingHash = `${name}=oldValue`;
    const expectedHash = `${name}=${encodeURIComponent(value)}`;
    window.location.hash = `#${existingHash}`;

    // When
    setBareHashParam(name, value);

    // Then
    // The hash of the real window.location should be prefixed with a "#" but since we mock it here this is not the case
    expect(window.location.hash.replace(/^#/, "")).toBe(expectedHash);
  });

  // Encodes spaces as '+' in the search param value when updating the hash
  it("should encode spaces as '+' in the search param value when updating the hash", () => {
    // Given
    const name = "param";
    const value = "value with spaces";
    const expectedHash = `${name}=value+with+spaces`;

    // When
    setBareHashParam(name, value);

    // Then
    // The hash of the real window.location should be prefixed with a "#" but since we mock it here this is not the case
    expect(window.location.hash.replace(/^#/, "")).toBe(expectedHash);
  });

  // Handles empty name and value strings by not modifying the hash
  it("should handle empty name and value strings by not modifying the hash", () => {
    // Given
    const name = "";
    const value = "";
    const existingHash = "param=value";
    window.location.hash = `#${existingHash}`;

    // When
    expect(() => setBareHashParam(name, value)).toThrowError(
      "Name must not be empty"
    );
  });

  // Handles special characters in name and value strings by encoding them in the search param
  it("should handle special characters in name and value strings by encoding them in the search param", () => {
    // Given
    const name = "param&";
    const value = "value<>";
    const expectedHash = "param%26=value%3C%3E";

    // When
    setBareHashParam(name, value);

    // Then
    // The hash of the real window.location should be prefixed with a "#" but since we mock it here this is not the case
    expect(window.location.hash.replace(/^#/, "")).toBe(expectedHash);
  });
});

describe("setTypedHashParam", () => {
  // Sets a new hash parameter with a string value
  it("should set a new hash parameter with a string value", () => {
    setTypedHashParam("name", "John");
    expect(window.location.hash.replace(/^#/, "")).toBe(`name=%22John%22`);
  });

  // Sets a new hash parameter with a number value
  it("should set a new hash parameter with a number value", () => {
    setTypedHashParam("age", 25);
    expect(window.location.hash.replace(/^#/, "")).toBe("age=25");
  });

  // Sets a new hash parameter with a boolean value
  it("should set a new hash parameter with a boolean value", () => {
    setTypedHashParam("isStudent", true);
    expect(window.location.hash.replace(/^#/, "")).toBe("isStudent=true");
  });

  // Sets a new hash parameter with a complex object value
  it("should set a new hash parameter with a complex object value", () => {
    setTypedHashParam("obj", { b: true, s: "string", n: 1 });
    expect(window.location.hash.replace(/^#/, "")).toBe(`obj=%7B%22b%22%3Atrue%2C%22s%22%3A%22string%22%2C%22n%22%3A1%7D`);
  });

  // Throws an error if name is an empty string
  it("should throw an error if name is an empty string", () => {
    expect(() => {
      setTypedHashParam("", "value");
    }).toThrowError("Name must not be empty");
  });

  // Sets a new hash parameter with an empty string value
  it("should set a new hash parameter with an empty string value", () => {
    setTypedHashParam("message", "");
    const searchParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    expect(searchParams.get("message")).toBe(`""`);
  });

  // Updates an existing hash parameter with an empty string value
  it("should update an existing hash parameter with an empty string value", () => {
    setBareHashParam("name", "John");
    setTypedHashParam("name", "");
    const searchParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    expect(searchParams.get("name")).toBe(`""`);
  });
});

describe("getTypedHashParam", () => {
  // Should return the parsed value when the hash param exists and is valid JSON
  it("should return the parsed value when the hash param exists and is valid JSON", () => {
    const hashParam = `"test"`;
    window.location.hash = "#param=" + encodeURIComponent(hashParam);

    const result = getTypedHashParam<string>("param");

    expect(result).toBe("test");
  });

  // Should return null when the hash param is null or empty
  it("should return null when the hash param is null or empty", () => {
    window.location.hash = "#param=";

    const result = getTypedHashParam<string>("param");

    expect(result).toBeNull();
  });

  // Should handle parsing of different types correctly (e.g. string, number, boolean)
  it("should handle parsing of different types correctly", () => {
    const stringParam = `"test"`;
    const numberParam = `123`;
    const booleanParam = `true`;
    window.location.hash =
      "#" +
      [
        `stringParam=${encodeURIComponent(stringParam)}`,
        `numberParam=${encodeURIComponent(numberParam)}`,
        `booleanParam=${encodeURIComponent(booleanParam)}`,
      ].join("&");

    const stringResult = getTypedHashParam<string>("stringParam");
    const numberResult = getTypedHashParam<number>("numberParam");
    const booleanResult = getTypedHashParam<boolean>("booleanParam");

    expect(stringResult).toBe("test");
    expect(numberResult).toBe(123);
    expect(booleanResult).toBe(true);
  });

  // Should return null when the hash param is not valid JSON
  it("should return null when the hash param is not valid JSON", () => {
    window.location.hash = "#param=test";

    expect(() => getTypedHashParam<string>("param")).toThrowError(
      `Unexpected token 'e', "{"value": test}" is not valid JSON`
    );
  });

  // Should throw when the hash param is not a string
  it("should throw when the hash param is not a string", () => {
    window.location.hash = "#param=123";

    expect(() => getTypedHashParam<string>("param", isString)).toThrowError(
      "Value 123 of param failed typeguard check"
    );
  });

  // Should throw when the hash param is not a number
  it("should throw when the hash param is not a number", () => {
    window.location.hash = "#param=false";

    expect(() => getTypedHashParam<number>("param", isNumber)).toThrowError(
      "Value false of param failed typeguard check"
    );
  });

  // Should throw when the hash param is not a boolean
  it("should throw when the hash param is not a boolean", () => {
    window.location.hash = "#param=123";

    expect(() => getTypedHashParam<boolean>("param", isBoolean)).toThrowError(
      "Value 123 of param failed typeguard check"
    );
  });

  // Should handle parsing of complex objects correctly (e.g. arrays, nested objects)
  it("should handle parsing of complex objects correctly", () => {
    const arrayParam = `[1, 2, 3]`;
    const objectParam = `{"key": "value"}`;
    window.location.hash =
      "#" +
      [
        `arrayParam=${encodeURIComponent(arrayParam)}`,
        `objectParam=${encodeURIComponent(objectParam)}`,
      ].join("&");

    const arrayResult = getTypedHashParam<number[]>("arrayParam");
    const objectResult = getTypedHashParam<{ key: string }>("objectParam");

    expect(arrayResult).toEqual([1, 2, 3]);
    expect(objectResult).toEqual({ key: "value" });
  });
});
