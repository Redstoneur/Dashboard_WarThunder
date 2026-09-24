import { describe, expect, it } from "vitest";

import { CompassDirection, getCompassDirection } from "../src/types/enums.js";

describe("getCompassDirection", () => {
    it("returns NORTH around 0/360", () => {
        expect(getCompassDirection(0)).toBe(CompassDirection.NORTH);
        expect(getCompassDirection(350)).toBe(CompassDirection.NORTH);
        expect(getCompassDirection(10)).toBe(CompassDirection.NORTH);
    });

    it("returns intercardinal directions", () => {
        expect(getCompassDirection(45)).toBe(CompassDirection.NORTHEAST);
        expect(getCompassDirection(135)).toBe(CompassDirection.SOUTHEAST);
        expect(getCompassDirection(225)).toBe(CompassDirection.SOUTHWEST);
        expect(getCompassDirection(315)).toBe(CompassDirection.NORTHWEST);
    });

    it("returns cardinal directions", () => {
        expect(getCompassDirection(90)).toBe(CompassDirection.EAST);
        expect(getCompassDirection(180)).toBe(CompassDirection.SOUTH);
        expect(getCompassDirection(270)).toBe(CompassDirection.WEST);
    });
});
