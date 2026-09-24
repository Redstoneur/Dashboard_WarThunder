import { describeArc, valueToColor, valueToRatio } from "./gaugeMath";

const START_ANGLE = -130;
const END_ANGLE = 130;

interface GaugeArcProps {
    value: number;
    min: number;
    max: number;
    label: string;
    unit: string;
    accentColor?: string;
    ticks?: number;
}

/** Jauge circulaire SVG générique (utilisée pour la vitesse et l'altitude). */
export default function GaugeArc({ value, min, max, label, unit, accentColor, ticks = 8 }: GaugeArcProps) {
    const size = 220;
    const center = size / 2;
    const radius = 92;
    const ratio = valueToRatio(value, min, max);
    const valueAngle = START_ANGLE + ratio * (END_ANGLE - START_ANGLE);
    const color = accentColor ?? valueToColor(value, min, max);

    const tickMarks = Array.from({ length: ticks + 1 }, (_, i) => {
        const t = i / ticks;
        const angle = START_ANGLE + t * (END_ANGLE - START_ANGLE);
        const tickValue = Math.round(min + t * (max - min));
        return { angle, tickValue };
    });

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="gauge-arc" role="img" aria-label={`${label}: ${Math.round(value)} ${unit}`}>
            <path
                d={describeArc(center, center, radius, START_ANGLE, END_ANGLE)}
                className="gauge-arc__track"
                fill="none"
            />
            <path
                d={describeArc(center, center, radius, START_ANGLE, valueAngle)}
                fill="none"
                stroke={color}
                className="gauge-arc__progress"
            />

            {tickMarks.map(({ angle, tickValue }) => {
                const rad = ((angle - 90) * Math.PI) / 180;
                const x1 = center + (radius + 10) * Math.cos(rad);
                const y1 = center + (radius + 10) * Math.sin(rad);
                const x2 = center + (radius + 2) * Math.cos(rad);
                const y2 = center + (radius + 2) * Math.sin(rad);
                const lx = center + (radius + 22) * Math.cos(rad);
                const ly = center + (radius + 22) * Math.sin(rad);
                return (
                    <g key={angle}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} className="gauge-arc__tick" />
                        <text x={lx} y={ly} className="gauge-arc__tick-label" textAnchor="middle" dominantBaseline="middle">
                            {tickValue}
                        </text>
                    </g>
                );
            })}

            <text x={center} y={center - 6} textAnchor="middle" className="gauge-arc__value" fill={color}>
                {Math.round(value).toLocaleString()}
            </text>
            <text x={center} y={center + 20} textAnchor="middle" className="gauge-arc__unit">
                {unit}
            </text>
            <text x={center} y={center + 46} textAnchor="middle" className="gauge-arc__label">
                {label}
            </text>
        </svg>
    );
}
