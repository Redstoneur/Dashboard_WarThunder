import type { MapObject } from "../../api/types";

export type MapCategory =
    | "player" | "fighter" | "aircraft" | "lightTank" | "mediumTank" | "spaa"
    | "ground" | "torpedoBoat" | "boat" | "ship" | "airfield" | "objective" | "area" | "other";
export type MapVisibility = Record<MapCategory, boolean>;

export const MAP_CATEGORIES: { id: MapCategory; label: string }[] = [
    { id: "player", label: "Joueur" },
    { id: "fighter", label: "Chasseurs" },
    { id: "aircraft", label: "Autres avions" },
    { id: "lightTank", label: "Chars légers" },
    { id: "mediumTank", label: "Chars moyens" },
    { id: "spaa", label: "DCA" },
    { id: "ground", label: "Autres véhicules" },
    { id: "torpedoBoat", label: "Vedettes lance-torpilles" },
    { id: "boat", label: "Bateaux" },
    { id: "ship", label: "Navires" },
    { id: "airfield", label: "Aérodromes / pistes" },
    { id: "objective", label: "Objectifs" },
    { id: "area", label: "Zones" },
    { id: "other", label: "Autres" }
];

export const DEFAULT_VISIBILITY: MapVisibility = {
    player: true, fighter: true, aircraft: true, lightTank: true, mediumTank: true,
    spaa: true, ground: true, torpedoBoat: true, boat: true, ship: true,
    airfield: true, objective: true, area: true, other: true
};

export interface MapView {
    zoom: number;
    x: number;
    y: number;
}

export type MapMode = "battlefield" | "player" | "manual";

export const FULL_VIEW: MapView = { zoom: 1, x: 0.5, y: 0.5 };
export const MAX_ZOOM = 5;
const FOLLOW_ZOOM = 2.5;

export function categoryOf(o: MapObject): MapCategory {
    const icon = o.icon?.toLowerCase();
    const type = o.type.toLowerCase();
    if (o.type === "airfield") return "airfield";
    if (o.type === "bombing_point" || o.icon === "bombing_point") return "objective";
    if (icon === "player") return "player";
    if (icon === "fighter") return "fighter";
    if (icon === "lighttank") return "lightTank";
    if (icon === "mediumtank") return "mediumTank";
    if (icon === "spaa") return "spaa";
    if (icon === "torpedoboat" || icon === "torpedo_boat") return "torpedoBoat";
    if (icon === "boat" || icon === "patrolboat" || icon === "gunboat") return "boat";
    if (icon === "ship" || icon === "destroyer" || icon === "cruiser" ||
        icon === "battleship" || icon === "frigate") return "ship";
    // En bataille navale, certaines unités ont un type naval mais pas d'icône dédiée.
    if (type === "sea_model" || type === "naval_model" || type === "ship") return "ship";
    if (type === "torpedo_boat") return "torpedoBoat";
    if (type === "boat") return "boat";
    if (o.sx != null && o.sy != null && o.ex != null && o.ey != null &&
        (o.x == null || o.y == null)) return "area";
    if (o.type === "aircraft") return "aircraft";
    if (o.type === "ground_model") return "ground";
    if (o.sx != null && o.sy != null && o.ex != null && o.ey != null) return "area";
    return "other";
}

/** Angle horaire depuis le nord de la carte (y croît vers le bas dans l'image). */
export function directionHeading(o: MapObject): number | undefined {
    if (o.dx == null || o.dy == null || !Number.isFinite(o.dx) || !Number.isFinite(o.dy) ||
        (o.dx === 0 && o.dy === 0)) return undefined;
    const category = categoryOf(o);
    if (category === "objective" || category === "area") return undefined;
    return (Math.atan2(o.dy, o.dx) * 180 / Math.PI + 90 + 360) % 360;
}

export function clampView(view: MapView): MapView {
    const zoom = Math.max(1, Math.min(MAX_ZOOM, view.zoom));
    const margin = 0.5 / zoom;
    return {
        zoom,
        x: Math.max(margin, Math.min(1 - margin, view.x)),
        y: Math.max(margin, Math.min(1 - margin, view.y))
    };
}

/** Conserve sous le curseur le même point de la carte pendant un zoom manuel. */
export function zoomAtPoint(
    view: MapView, factor: number, offsetX: number, offsetY: number, imageWidth: number, imageHeight: number
): MapView {
    const zoom = Math.max(1, Math.min(MAX_ZOOM, view.zoom * factor));
    return clampView({
        zoom,
        x: view.x + offsetX / imageWidth * (1 / view.zoom - 1 / zoom),
        y: view.y + offsetY / imageHeight * (1 / view.zoom - 1 / zoom)
    });
}

/** Suit le joueur sans modifier le zoom au gré des déplacements des autres unités. */
export function playerView(objects: MapObject[]): MapView | null {
    const player = objects.find((o) =>
        categoryOf(o) === "player" &&
        o.x != null && o.y != null &&
        Number.isFinite(o.x) && Number.isFinite(o.y) &&
        o.x >= 0 && o.x <= 1 && o.y >= 0 && o.y <= 1
    );
    if (player?.x == null || player.y == null) return null;
    return clampView({ zoom: FOLLOW_ZOOM, x: player.x, y: player.y });
}

// Cadrage sur toutes les unités mobiles, indépendamment des filtres d'affichage. Les
// objectifs fixes ne doivent pas forcer un retour à la carte entière quand le combat bouge.
export function actionView(objects: MapObject[]): MapView {
    const units = objects.filter((o) => {
        const category = categoryOf(o);
        return (o.type === "aircraft" || o.type === "ground_model" ||
            category === "player" || category === "ship" || category === "boat" ||
            category === "torpedoBoat") &&
            o.x != null && o.y != null &&
            Number.isFinite(o.x) && Number.isFinite(o.y) &&
            o.x >= 0 && o.x <= 1 && o.y >= 0 && o.y <= 1;
    });
    if (units.length === 0) return FULL_VIEW;

    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const unit of units) {
        if (unit.x == null || unit.y == null) continue;
        const x = unit.x;
        const y = unit.y;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    // 15 % de marge sur chaque axe ; un combat groupé a un zoom modéré par défaut.
    const zoom = Math.min(FOLLOW_ZOOM, 0.7 / Math.max(maxX - minX, maxY - minY, 0.01));
    return clampView({ zoom, x: (minX + maxX) / 2, y: (minY + maxY) / 2 });
}
