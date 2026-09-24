import { api } from "../../api/client";
import { POLL_INTERVALS } from "../../config/env";
import { usePolling } from "../../hooks/usePolling";
import { useSmoothedAngle, useSmoothedValue } from "../../hooks/useSmoothed";
import type { GyroscopeData } from "../../api/types";

const PITCH_TO_PX = 1.6;

/** Widget d'horizon artificiel (pitch/roll/yaw/turn), interrogé via `GET /api/v1/gyroscope`. */
export default function GyroscopeWidget() {
    const { data, online } = usePolling<GyroscopeData>((signal) => api.gyroscope(signal), POLL_INTERVALS.gyroscope);

    const pitch = useSmoothedValue(online ? data?.pitch ?? 0 : 0, 0.08);
    const roll = useSmoothedValue(online ? data?.roll ?? 0 : 0, 0.08);
    const yaw = useSmoothedAngle(online ? data?.yaw ?? 0 : 0, 0.08);
    const turn = useSmoothedValue(online ? data?.turn ?? 0 : 0, 0.08);

    const pitchPx = Math.max(-60, Math.min(60, pitch * PITCH_TO_PX));

    return (
        <div className="widget-card">
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
                    <g transform={`rotate(${roll} 110 110) translate(0 ${pitchPx})`}>
                        <rect x="-40" y="-260" width="300" height="260" className="horizon__sky" />
                        <rect x="-40" y="0" width="300" height="260" className="horizon__ground" />
                        <line x1="-40" y1="0" x2="260" y2="0" className="horizon__line" />
                        {[-30, -20, -10, 10, 20, 30].map((deg) => (
                            <line
                                key={deg}
                                x1={90}
                                x2={130}
                                y1={-deg * 2}
                                y2={-deg * 2}
                                className="horizon__pitch-tick"
                            />
                        ))}
                    </g>
                </g>

                <circle cx="110" cy="110" r="92" className="horizon__bezel" />
                <polygon points="110,22 100,40 120,40" className="horizon__roll-marker" />
                <g className="horizon__fixed-aircraft">
                    <line x1="70" y1="110" x2="95" y2="110" />
                    <line x1="125" y1="110" x2="150" y2="110" />
                    <circle cx="110" cy="110" r="3" />
                </g>
            </svg>

            <div className="gyro-readouts">
                <div className="gyro-readouts__row"><span>Tangage</span><strong>{pitch.toFixed(1)}°</strong></div>
                <div className="gyro-readouts__row"><span>Roulis</span><strong>{roll.toFixed(1)}°</strong></div>
                <div className="gyro-readouts__row"><span>Lacet</span><strong>{yaw.toFixed(1)}°</strong></div>
                <div className="gyro-readouts__row"><span>Virage</span><strong>{turn.toFixed(2)}°/s</strong></div>
            </div>
            {!online && <p className="widget-card__offline">Signal perdu</p>}
        </div>
    );
}
