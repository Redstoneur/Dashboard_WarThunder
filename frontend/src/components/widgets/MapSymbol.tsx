import type { MapCategory } from "./mapView";

interface MapSymbolProps {
    category: MapCategory;
    className?: string;
    x?: number;
    y?: number;
    size?: number;
    color?: string;
    heading?: number;
}

/** Symbole vectoriel commun aux unités de la carte et à la légende des types. */
export default function MapSymbol({ category, className, x, y, size = 24, color, heading }: MapSymbolProps) {
    let shape;
    if (category === "player" || category === "fighter" || category === "aircraft") {
        shape = <>
            <path d="M12 2 10.5 10 3 14v2l7.5-1.5V20L8 22v1l4-1 4 1v-1l-2.5-2v-5.5L21 16v-2l-7.5-4L12 2Z" />
            {category === "player" && <circle cx="12" cy="13" r="2" fill="#0d1526" />}
            {category === "aircraft" && <path d="M5 20h14" stroke="currentColor" strokeWidth="2" />}
        </>;
    } else if (category === "spaa") {
        shape = <path d="M4 13h16v6H4zM7 19v2m10-2v2M9 13l-2-9m8 9 2-9" fill="none" stroke="currentColor" strokeWidth="2" />;
    } else if (category === "lightTank" || category === "mediumTank" || category === "ground") {
        shape = <>
            <path d="M3 12h18v8H3zM9 8h7v4H9zM14 6h8v2h-8z" />
            {category === "mediumTank" && <path d="M6 16h12" stroke="#0d1526" strokeWidth="2" />}
            {category === "ground" && <circle cx="12" cy="16" r="2" fill="#0d1526" />}
        </>;
    } else if (category === "ship" || category === "boat" || category === "torpedoBoat") {
        shape = <>
            <path d="M2 14h20l-4 7H6l-4-7Zm8-9h4v9h-4zM6 10h12v4H6z" />
            {category === "torpedoBoat" && <path d="M5 7h4m6 0h4" stroke="currentColor" strokeWidth="2" />}
            {category === "ship" && <path d="M8 2h8v3H8z" />}
        </>;
    } else if (category === "airfield") {
        shape = <><rect x="8" y="2" width="8" height="20" rx="1" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 5v3m0 3v3m0 3v2" stroke="currentColor" strokeWidth="2" /></>;
    } else if (category === "objective") {
        shape = <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" /></>;
    } else if (category === "area") {
        shape = <><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="2" /></>;
    } else {
        shape = <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="2" /></>;
    }

    return (
        <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" fill="currentColor"
            className={className} style={{ color }} aria-hidden="true">
            {heading == null ? shape : <g transform={`rotate(${heading} 12 12)`}>{shape}</g>}
        </svg>
    );
}
