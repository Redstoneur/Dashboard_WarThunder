import { useEffect, useState } from "react";

import { api } from "../../api/client";
import { POLL_INTERVALS } from "../../config/env";
import { usePolling } from "../../hooks/usePolling";
import type { MapInfo, MapObject } from "../../api/types";

/** Widget de carte tactique: image + objets (avions, véhicules...) en overlay. */
export default function MapWidget() {
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const { data: info } = usePolling<MapInfo>((signal) => api.mapInfo(signal), POLL_INTERVALS.status);
    const { data: objects, online } = usePolling<MapObject[]>((signal) => api.mapObjects(signal), POLL_INTERVALS.map);

    useEffect(() => {
        let mounted = true;
        let objectUrl: string | null = null;

        const fetchImg = async () => {
            try {
                const res = await fetch(api.mapImageUrl(), { cache: "no-store" });
                if (!res.ok) return;
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                if (mounted) setImgUrl(objectUrl);
            } catch (err) {
                console.debug("[MapWidget] image fetch error", err);
            }
        };

        fetchImg();
        const interval = setInterval(fetchImg, 5000);
        return () => {
            mounted = false;
            clearInterval(interval);
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, []);

    return (
        <div className="widget-card widget-card--map">
            <div className="map-header">
                <span>Carte tactique</span>
                {info && <span className="map-header__status">{info.valid ? "en vol" : "hors ligne"}</span>}
            </div>
            <div className="map-container">
                {imgUrl ? (
                    <img src={imgUrl} alt="Carte tactique" className="map-image" />
                ) : (
                    <div className="map-placeholder">Aucune image de carte</div>
                )}
                <svg className="map-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {(objects ?? []).map((o, i) => {
                        if (o.x != null && o.y != null) {
                            return (
                                <circle
                                    key={i}
                                    cx={o.x * 100}
                                    cy={(1 - o.y) * 100}
                                    r={1.4}
                                    fill={o.color_hex ?? "#ffdd33"}
                                    className={`map-marker type-${o.type}`}
                                >
                                    <title>{o.type}</title>
                                </circle>
                            );
                        }
                        if (o.sx != null && o.sy != null && o.ex != null && o.ey != null) {
                            const left = Math.min(o.sx, o.ex) * 100;
                            const top = (1 - Math.max(o.sy, o.ey)) * 100;
                            const width = Math.abs(o.ex - o.sx) * 100;
                            const height = Math.abs(o.ey - o.sy) * 100;
                            return (
                                <rect
                                    key={i}
                                    x={left}
                                    y={top}
                                    width={width}
                                    height={height}
                                    fill="none"
                                    stroke={o.color_hex ?? "#33dd66"}
                                    strokeWidth={0.4}
                                />
                            );
                        }
                        return null;
                    })}
                </svg>
            </div>
            <div className="map-legend">
                <span className="legend-item"><span className="legend-dot legend-dot--friend" /> Allié</span>
                <span className="legend-item"><span className="legend-dot legend-dot--enemy" /> Ennemi</span>
                {!online && <span className="widget-card__offline">Signal perdu</span>}
            </div>
        </div>
    );
}
