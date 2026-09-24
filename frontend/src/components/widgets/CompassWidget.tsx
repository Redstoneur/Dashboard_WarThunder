import { api } from "../../api/client";
import { POLL_INTERVALS } from "../../config/env";
import { usePolling } from "../../hooks/usePolling";
import { useSmoothedAngle } from "../../hooks/useSmoothed";
import type { CompassData } from "../../api/types";

const DIRECTION_LABELS: Record<string, string> = {
    N: "Nord",
    NE: "Nord-Est",
    E: "Est",
    SE: "Sud-Est",
    S: "Sud",
    SW: "Sud-Ouest",
    W: "Ouest",
    NW: "Nord-Ouest"
};

const TICKS = [
    { angle: 0, label: "N" },
    { angle: 45, label: "NE" },
    { angle: 90, label: "E" },
    { angle: 135, label: "SE" },
    { angle: 180, label: "S" },
    { angle: 225, label: "SW" },
    { angle: 270, label: "W" },
    { angle: 315, label: "NW" }
];

/** Widget de boussole (cap), interrogé via `GET /api/v1/compass`. */
export default function CompassWidget() {
    const { data, online } = usePolling<CompassData>((signal) => api.compass(signal), POLL_INTERVALS.compass);
    const heading = useSmoothedAngle(online ? data?.heading ?? 0 : 0, 0.08);
    const direction = online ? data?.direction ?? "--" : "--";

    return (
        <div className="widget-card">
            <svg viewBox="0 0 220 220" className="compass-gauge" role="img" aria-label={`Cap ${heading.toFixed(0)}° ${direction}`}>
                <circle cx="110" cy="110" r="95" className="compass-rose__ring" />
                <g transform={`rotate(${-heading} 110 110)`}>
                    {TICKS.map(({ angle, label }) => {
                        const rad = ((angle - 90) * Math.PI) / 180;
                        const outer = 88;
                        const inner = label.length > 1 ? 74 : 68;
                        const x1 = 110 + outer * Math.cos(rad);
                        const y1 = 110 + outer * Math.sin(rad);
                        const x2 = 110 + inner * Math.cos(rad);
                        const y2 = 110 + inner * Math.sin(rad);
                        const lx = 110 + (outer - 16) * Math.cos(rad);
                        const ly = 110 + (outer - 16) * Math.sin(rad);
                        return (
                            <g key={label}>
                                <line x1={x1} y1={y1} x2={x2} y2={y2} className={angle % 90 === 0 ? "compass-rose__tick-major" : "compass-rose__tick"} />
                                <text
                                    x={lx}
                                    y={ly}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className={angle % 90 === 0 ? "compass-rose__label-major" : "compass-rose__label"}
                                    transform={`rotate(${heading} ${lx} ${ly})`}
                                >
                                    {label}
                                </text>
                            </g>
                        );
                    })}
                </g>

                {/* Repère fixe pointant le cap actuel (triangle en haut) */}
                <polygon points="110,20 100,42 120,42" className="compass-rose__needle" />

                <text x="110" y="118" textAnchor="middle" className="gauge-arc__value">
                    {heading.toFixed(0)}°
                </text>
                <text x="110" y="142" textAnchor="middle" className="gauge-arc__unit">
                    {DIRECTION_LABELS[direction] ?? direction}
                </text>
            </svg>
            {!online && <p className="widget-card__offline">Signal perdu</p>}
        </div>
    );
}
