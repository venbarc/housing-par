import { describe, expect, it } from "vitest";
import { bedSchema } from "./validation";

describe("bedSchema", () => {
  it("accepts valid bed payload", () => {
    const parsed = bedSchema.parse({
      bedNumber: "A1",
      wardId: "A",
      room: "101",
      status: "available",
      posX: 0,
      posY: 0,
    });
    expect(parsed.status).toBe("available");
  });

  it("rejects invalid status", () => {
    expect(() =>
      bedSchema.parse({
        bedNumber: "A1",
        wardId: "A",
        room: "101",
        status: "bad",
        posX: 0,
        posY: 0,
      })
    ).toThrow();
  });
});
