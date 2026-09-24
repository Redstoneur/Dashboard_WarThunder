import { api } from "../../api/client";
import { GAUGE_RANGES, POLL_INTERVALS } from "../../config/env";
import { usePolling } from "../../hooks/usePolling";
import { useSmoothedValue } from "../../hooks/useSmoothed";
import GaugeArc from "./GaugeArc";

/** Widget de vitesse (km/h), interrogé via `GET /api/v1/speed`. */
export default function SpeedWidget() {
    const { data, online } = usePolling((signal) => api.speed(signal), POLL_INTERVALS.speed);
    const display = useSmoothedValue(online ? data ?? 0 : 0, 0.12);

    return (
        <div className="widget-card">
            <GaugeArc
                value={display}
                min={GAUGE_RANGES.speedMin}
                max={GAUGE_RANGES.speedMax}
                label="Vitesse"
                unit="km/h"
            />
            {!online && <p className="widget-card__offline">Signal perdu</p>}
        </div>
    );
}
