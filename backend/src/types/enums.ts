/** Armées disponibles dans War Thunder. */
export enum ArmyEnum {
    AIR = "air",
    GROUND = "ground",
    NAVY = "navy"
}

/** Points cardinaux/intercardinaux utilisés par la boussole. */
export enum CompassDirection {
    NORTH = "N",
    EAST = "E",
    SOUTH = "S",
    WEST = "W",
    NORTHEAST = "NE",
    SOUTHEAST = "SE",
    SOUTHWEST = "SW",
    NORTHWEST = "NW"
}

/**
 * Détermine le point cardinal/intercardinal correspondant à un cap en degrés (0-360).
 */
export function getCompassDirection(heading: number): CompassDirection {
    if (heading >= 337.5 || heading < 22.5) return CompassDirection.NORTH;
    if (heading >= 22.5 && heading < 67.5) return CompassDirection.NORTHEAST;
    if (heading >= 67.5 && heading < 112.5) return CompassDirection.EAST;
    if (heading >= 112.5 && heading < 157.5) return CompassDirection.SOUTHEAST;
    if (heading >= 157.5 && heading < 202.5) return CompassDirection.SOUTH;
    if (heading >= 202.5 && heading < 247.5) return CompassDirection.SOUTHWEST;
    if (heading >= 247.5 && heading < 292.5) return CompassDirection.WEST;
    if (heading >= 292.5 && heading < 337.5) return CompassDirection.NORTHWEST;
    throw new Error("Heading must be between 0 and 360 degrees");
}
