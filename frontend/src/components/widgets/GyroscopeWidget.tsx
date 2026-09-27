import { useEffect, useState } from "react";

import { api } from "../../api/client";
import { POLL_INTERVALS } from "../../config/env";
import { usePolling } from "../../hooks/usePolling";
import { useSmoothedAngle, useSmoothedValue } from "../../hooks/useSmoothed";
import type { GyroscopeData } from "../../api/types";

// Amplitude (px) du déplacement de la ligne d'horizon pour une inclinaison proche de 90°.
// Volontairement > au rayon du cadran (92) pour garantir un "plein ciel"/"pleine terre" dès
// qu'on approche la verticale, avant que ça ne revienne au centre (vol dos, cf. sinus ci-dessous).
const PITCH_AMPLITUDE_PX = 100;

// v2 : renommée pour repartir sur un état propre (activé par défaut), une ancienne valeur
// "false" stockée localement lors de précédents tests restait sinon collée indéfiniment.
const VISUAL_STORAGE_KEY = "gyroscope.visualEnabled.v2";

/** Widget d'horizon artificiel (pitch/roll/yaw/turn), interrogé via `GET /api/v1/gyroscope`. */
export default function GyroscopeWidget() {
    const { data, online } = usePolling<GyroscopeData>((signal) => api.gyroscope(signal), POLL_INTERVALS.gyroscope);

    const pitch = useSmoothedValue(online ? data?.pitch ?? 0 : 0, 0.08);
    const roll = useSmoothedValue(online ? data?.roll ?? 0 : 0, 0.08);
    const yaw = useSmoothedAngle(online ? data?.yaw ?? 0 : 0, 0.08);
    const turn = useSmoothedValue(online ? data?.turn ?? 0 : 0, 0.08);

    // Affichage du dessin (horizon artificiel) désactivable indépendamment du widget lui-même :
    // quand il est masqué, les valeurs numériques passent dans une mise en page agrandie pour
    // rester lisibles sans le repère visuel.
    const [showVisual, setShowVisual] = useState<boolean>(() => {
        try {
            return localStorage.getItem(VISUAL_STORAGE_KEY) !== "false";
        } catch {
            return true;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(VISUAL_STORAGE_KEY, String(showVisual));
        } catch {
            // ignore storage errors
        }
    }, [showVisual]);

    // Projection sinusoïdale (et non linéaire) de la ligne d'horizon : à 0° elle est au centre du
    // cadran (moitié ciel, moitié terre) ; elle descend/monte progressivement jusqu'à un maximum
    // vers ±90° (piqué/ressource à la verticale) puis revient au centre vers ±180° (vol dos), où
    // le ciel et la terre sont inversés puisqu'on est alors sur le dos (cos(tangage) < 0).
    const pitchRad = (pitch * Math.PI) / 180;
    const horizonOffsetPx = Math.sin(pitchRad) * PITCH_AMPLITUDE_PX;
    const inverted = Math.cos(pitchRad) < 0;

    return (
        <div className="widget-card">
            {showVisual && (
                <svg
                    viewBox="0 0 220 220"
                    className="horizon-gauge"
                    role="img"
                    aria-label={`Horizon artificiel: tangage ${pitch.toFixed(1)}°, roulis ${roll.toFixed(1)}°`}
                >
                    <defs>
                        <clipPath id="horizon-clip">
                            <circle cx="110" cy="110" r="92" />
                        </clipPath>
                    </defs>

                    <g clipPath="url(#horizon-clip)">
                        {/* Le repère local (0,0) est recentré sur le centre du cadran (110,110), décalé
                            verticalement selon le tangage, puis l'ensemble tourne autour de ce même
                            centre selon le roulis (positif = à droite, comme demandé). */}
                        <g transform={`rotate(${roll} 110 110) translate(110 ${110 + horizonOffsetPx})`}>
                            <rect x="-150" y="-300" width="300" height="300" className={inverted ? "horizon__ground" : "horizon__sky"} />
                            <rect x="-150" y="0" width="300" height="300" className={inverted ? "horizon__sky" : "horizon__ground"} />
                            <line x1="-120" y1="0" x2="120" y2="0" className="horizon__line" />
                            {[-30, -20, -10, 10, 20, 30].map((deg) => (
                                <line
                                    key={deg}
                                    x1={-20}
                                    x2={20}
                                    y1={-deg * 2}
                                    y2={-deg * 2}
                                    className="horizon__pitch-tick"
                                />
                            ))}
                        </g>
                    </g>

                    <circle cx="110" cy="110" r="92" className="horizon__bezel" />

                    {/* Indicateur orange de roulis : tourne avec l'horizon (droite = positif). */}
                    <g transform={`rotate(${roll} 110 110)`}>
                        <polygon points="110,22 100,40 120,40" className="horizon__roll-marker" />
                    </g>

                    <g className="horizon__fixed-aircraft">
                        <line x1="70" y1="110" x2="95" y2="110" />
                        <line x1="125" y1="110" x2="150" y2="110" />
                        <circle cx="110" cy="110" r="3" />
                    </g>
                </svg>
            )}

            <button
                type="button"
                className={`alarm-toggle ${showVisual ? "on" : "off"}`}
                aria-pressed={showVisual}
                onClick={() => setShowVisual((v) => !v)}
            >
                {showVisual ? "Visuel horizon : activé" : "Visuel horizon : désactivé"}
            </button>

            <div className={`gyro-readouts ${showVisual ? "" : "gyro-readouts--expanded"}`}>
                <div className="gyro-readouts__row"><span>Tangage</span><strong>{pitch.toFixed(1)}°</strong></div>
                <div className="gyro-readouts__row"><span>Roulis</span><strong>{roll.toFixed(1)}°</strong></div>
                <div className="gyro-readouts__row"><span>Lacet</span><strong>{yaw.toFixed(1)}°</strong></div>
                <div className="gyro-readouts__row"><span>Virage</span><strong>{turn.toFixed(2)}°/s</strong></div>
            </div>
            {!online && <p className="widget-card__offline">Signal perdu</p>}
        </div>
    );
}
