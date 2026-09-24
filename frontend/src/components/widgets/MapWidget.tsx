import { useEffect, useRef, useState } from "react";

import { api } from "../../api/client";
import { POLL_INTERVALS } from "../../config/env";
import { usePolling } from "../../hooks/usePolling";
import type { MapInfo, MapObject } from "../../api/types";

/** Rectangle (en pixels, relatif au conteneur) réellement occupé par l'image affichée. */
interface ImageRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * Calcule le rectangle effectivement dessiné par une image en `object-fit: contain` à
 * l'intérieur de son conteneur (l'image garde son ratio réel, donc elle peut laisser des
 * bandes vides ("letterboxing") si son ratio diffère de celui du conteneur).
 */
function computeContainRect(containerW: number, containerH: number, naturalW: number, naturalH: number): ImageRect {
    if (containerW <= 0 || containerH <= 0 || naturalW <= 0 || naturalH <= 0) {
        return { left: 0, top: 0, width: containerW, height: containerH };
    }
    const containerRatio = containerW / containerH;
    const naturalRatio = naturalW / naturalH;
    if (naturalRatio > containerRatio) {
        // Image plus "large" que le conteneur : bandes vides en haut/bas.
        const width = containerW;
        const height = width / naturalRatio;
        return { left: 0, top: (containerH - height) / 2, width, height };
    }
    // Image plus "haute" que le conteneur : bandes vides à gauche/droite.
    const height = containerH;
    const width = height * naturalRatio;
    return { left: (containerW - width) / 2, top: 0, width, height };
}

/** Widget de carte tactique: image + objets (avions, véhicules...) en overlay. */
export default function MapWidget() {
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const { data: info } = usePolling<MapInfo>((signal) => api.mapInfo(signal), POLL_INTERVALS.status);
    const { data: objects, online } = usePolling<MapObject[]>((signal) => api.mapObjects(signal), POLL_INTERVALS.map);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [imageRect, setImageRect] = useState<ImageRect | null>(null);

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

    // Recalcule le rectangle réellement occupé par l'image (letterboxing "contain") à chaque
    // chargement d'image et à chaque redimensionnement du conteneur, afin que les repères des
    // entités (overlay SVG) restent alignés sur la carte au lieu d'être étirés sur toute la
    // zone du widget.
    useEffect(() => {
        const recompute = () => {
            const container = containerRef.current;
            const img = imgRef.current;
            if (!container || !img || !img.naturalWidth || !img.naturalHeight) return;
            const rect = computeContainRect(
                container.clientWidth,
                container.clientHeight,
                img.naturalWidth,
                img.naturalHeight
            );
            setImageRect(rect);
        };

        recompute();

        const container = containerRef.current;
        if (!container || typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(recompute);
        observer.observe(container);
        return () => observer.disconnect();
    }, [imgUrl]);

    return (
        <div className="widget-card widget-card--map">
            <div className="map-header">
                <span>Carte tactique</span>
                {info && <span className="map-header__status">{info.valid ? "en vol" : "hors ligne"}</span>}
            </div>
            <div className="map-container" ref={containerRef}>
                {imgUrl ? (
                    <img
                        ref={imgRef}
                        src={imgUrl}
                        alt="Carte tactique"
                        className="map-image"
                        onLoad={(e) => {
                            const img = e.currentTarget;
                            const container = containerRef.current;
                            if (!container) return;
                            setImageRect(
                                computeContainRect(container.clientWidth, container.clientHeight, img.naturalWidth, img.naturalHeight)
                            );
                        }}
                    />
                ) : (
                    <div className="map-placeholder">Aucune image de carte</div>
                )}
                {imageRect && (
                    <svg
                        className="map-overlay"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{
                            left: imageRect.left,
                            top: imageRect.top,
                            width: imageRect.width,
                            height: imageRect.height
                        }}
                    >
                        {(objects ?? []).map((o, i) => {
                            // Les coordonnées x/y (et sx/sy/ex/ey) renvoyées par le serveur War Thunder
                            // sont déjà normalisées entre 0 et 1 avec l'origine en haut à gauche de la
                            // carte (comme une image) : aucune inversion de l'axe Y n'est nécessaire.
                            if (o.x != null && o.y != null) {
                                return (
                                    <circle
                                        key={i}
                                        cx={o.x * 100}
                                        cy={o.y * 100}
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
                                const top = Math.min(o.sy, o.ey) * 100;
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
                )}
            </div>
            <div className="map-legend">
                <span className="legend-item"><span className="legend-dot legend-dot--friend" /> Allié</span>
                <span className="legend-item"><span className="legend-dot legend-dot--enemy" /> Ennemi</span>
                <span className="legend-item"><span className="legend-dot legend-dot--player" /> Vous (joueur)</span>
                <span className="legend-item"><span className="legend-dot legend-dot--teammate" /> Coéquipier</span>
                <span className="legend-item"><span className="legend-square" /> Zone à capturer</span>
                {!online && <span className="widget-card__offline">Signal perdu</span>}
            </div>
        </div>
    );
}
