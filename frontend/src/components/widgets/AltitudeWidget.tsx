import { useEffect, useState } from "react";

import { api } from "../../api/client";
import { GAUGE_RANGES, POLL_INTERVALS } from "../../config/env";
import { useAltitudeAlarm } from "../../hooks/useAltitudeAlarm";
import { usePolling } from "../../hooks/usePolling";
import { useSmoothedValue } from "../../hooks/useSmoothed";

const ALARM_STORAGE_KEY = "altitude.alarmEnabled";

/** Widget d'altitude (m) avec alarme de proximité sol, interrogé via `GET /api/v2/altitude`. */
export default function AltitudeWidget() {
    const { data, online } = usePolling((signal) => api.altitudeV2(signal), POLL_INTERVALS.altitude);
    const altitude = online ? data?.altitude_meters ?? 0 : 0;
    const gearDeployed = online ? data?.gear_deployed ?? true : true;
    const display = useSmoothedValue(altitude, 0.12);

    const [alarmEnabled, setAlarmEnabled] = useState<boolean>(() => {
        try {
            return localStorage.getItem(ALARM_STORAGE_KEY) !== "false";
        } catch {
            return true;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(ALARM_STORAGE_KEY, String(alarmEnabled));
        } catch {
            // ignore storage errors
        }
    }, [alarmEnabled]);

    useAltitudeAlarm({
        altitude,
        gearDeployed,
        enabled: alarmEnabled && online,
        intermittentStart: GAUGE_RANGES.altitudeAlarmIntermittentStart,
        continuousStart: GAUGE_RANGES.altitudeAlarmContinuousStart
    });

    return (
        <div className="widget-card">
            <div className="altitude-gauge">
                <svg viewBox="0 0 220 220" role="img" aria-label={`Altitude: ${Math.round(display)} mètres`}>
                    <circle cx="110" cy="110" r="92" className="altitude-gauge__track" />
                    <circle
                        cx="110"
                        cy="110"
                        r="92"
                        className="altitude-gauge__progress"
                        style={{
                            strokeDasharray: `${2 * Math.PI * 92}`,
                            strokeDashoffset: `${
                                2 * Math.PI * 92 * (1 - Math.max(0, Math.min(1, display / GAUGE_RANGES.altitudeMax)))
                            }`
                        }}
                    />
                    <text x="110" y="100" textAnchor="middle" className="gauge-arc__value">
                        {Math.round(display).toLocaleString()}
                    </text>
                    <text x="110" y="126" textAnchor="middle" className="gauge-arc__unit">
                        mètres
                    </text>
                    <text x="110" y="150" textAnchor="middle" className="gauge-arc__label">
                        Altitude
                    </text>
                </svg>
                <div className={`gear-indicator ${gearDeployed ? "gear-indicator--down" : "gear-indicator--up"}`}>
                    {gearDeployed ? "Train sorti" : "Train rentré"}
                </div>
            </div>
            <button
                type="button"
                className={`alarm-toggle ${alarmEnabled ? "on" : "off"}`}
                aria-pressed={alarmEnabled}
                onClick={() => setAlarmEnabled((v) => !v)}
            >
                {alarmEnabled ? "Alarme sol : activée" : "Alarme sol : désactivée"}
            </button>
            {!online && <p className="widget-card__offline">Signal perdu</p>}
        </div>
    );
}
