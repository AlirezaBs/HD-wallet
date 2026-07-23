import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";

describe("getErrorMessage", () => {
  it("returns Error message", () => {
    expect(getErrorMessage(new Error("boom"), "fallback")).toBe("boom");
  });

  it("returns fallback for non-errors", () => {
    expect(getErrorMessage("nope", "fallback")).toBe("fallback");
  });
});
