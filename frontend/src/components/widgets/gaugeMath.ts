/** Utilitaires de calcul de tracés SVG pour les jauges circulaires (cadran style "compteur"). */

export interface Point {
    x: number;
    y: number;
}

export function polarToCartesian(centerX: number, centerY: number, radius: number, angleDeg: number): Point {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: centerX + radius * Math.cos(angleRad),
        y: centerY + radius * Math.sin(angleRad)
    };
}

/**
 * Décrit un arc SVG entre deux angles (en degrés, 0 = haut, sens horaire).
 * Utilisé pour dessiner le fond du cadran et l'aiguille de progression des jauges.
 */
export function describeArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number): string {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

/** Convertit une valeur bornée [min, max] vers un ratio [0, 1]. */
export function valueToRatio(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/** Couleur HSL allant du rouge (min) au vert (max), utilisée pour les jauges de vitesse/altitude. */
export function valueToColor(value: number, min: number, max: number): string {
    const ratio = valueToRatio(value, min, max);
    const hue = Math.round(ratio * 120);
    return `hsl(${hue} 75% 45%)`;
}
