import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { api } from "../../api/client";
import { POLL_INTERVALS } from "../../config/env";
import { usePolling } from "../../hooks/usePolling";
import type { CompassData, MapInfo, MapObject } from "../../api/types";
import MapSymbol from "./MapSymbol";
import { actionView, categoryOf, clampView, DEFAULT_VISIBILITY, directionHeading, FULL_VIEW, hasMapPosition, MAP_CATEGORIES, playerView, zoomAtPoint } from "./mapView";
import type { MapMode, MapView, MapVisibility } from "./mapView";

const MAP_SYMBOL_SIZE = 4 / 3;
const FILTERS_PINNED_KEY = "map.filtersPinned";

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
    const [imageAspectRatio, setImageAspectRatio] = useState(1);
    const { data: info } = usePolling<MapInfo>((signal) => api.mapInfo(signal), POLL_INTERVALS.status);
    const { data: objects, online } = usePolling<MapObject[]>((signal) => api.mapObjects(signal), POLL_INTERVALS.map);
    const { data: compass, online: compassOnline } = usePolling<CompassData>(
        (signal) => api.compass(signal), POLL_INTERVALS.compass
    );
    const playerHeading = compassOnline && compass && Number.isFinite(compass.heading)
        ? compass.heading : undefined;
    const [mode, setMode] = useState<MapMode>("battlefield");
    const [manualView, setManualView] = useState<MapView>(FULL_VIEW);
    const [visibility, setVisibility] = useState<MapVisibility>(DEFAULT_VISIBILITY);
    const [filtersPinned, setFiltersPinned] = useState(() => {
        try {
            return localStorage.getItem(FILTERS_PINNED_KEY) === "true";
        } catch {
            return false;
        }
    });
    const filtersRef = useRef<HTMLDetailsElement>(null);
    const allTypesChecked = MAP_CATEGORIES.every(({ id }) => visibility[id]);
    const someTypesChecked = MAP_CATEGORIES.some(({ id }) => visibility[id]);
    const allTypesRef = useRef<HTMLInputElement>(null);
    const positionedObjects = (objects ?? []).filter(hasMapPosition);
    const categoryCounts = MAP_CATEGORIES.map(({ id, label }) => ({
        id, label, count: positionedObjects.filter((o) => categoryOf(o) === id).length
    }));
    const shownCount = categoryCounts.reduce((sum, { id, count }) => sum + (visibility[id] ? count : 0), 0);
    const battlefieldView = actionView(objects ?? []);
    const currentPlayerView = playerView(objects ?? []);
    const view = mode === "manual" ? manualView
        : mode === "player" ? currentPlayerView ?? FULL_VIEW
            : battlefieldView;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [imageRect, setImageRect] = useState<ImageRect | null>(null);
    const dragRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (allTypesRef.current) {
            allTypesRef.current.indeterminate = someTypesChecked && !allTypesChecked;
        }
    }, [allTypesChecked, someTypesChecked, filtersPinned]);

    useEffect(() => {
        if (filtersPinned && filtersRef.current) filtersRef.current.open = true;
        try {
            localStorage.setItem(FILTERS_PINNED_KEY, String(filtersPinned));
        } catch {
            // L'affichage fonctionne aussi quand le stockage local est indisponible.
        }
    }, [filtersPinned]);

    useEffect(() => {
        let mounted = true;
        let objectUrl: string | null = null;

        const fetchImg = async () => {
            try {
                const res = await fetch(api.mapImageUrl(), { cache: "no-store" });
                if (!res.ok) {
                    console.debug("[MapWidget] image fetch error", res.status);
                    return;
                }
                const blob = await res.blob();
                if (!mounted) return;
                const nextUrl = URL.createObjectURL(blob);
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                objectUrl = nextUrl;
                setImgUrl(nextUrl);
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

    // Le même repère est appliqué à l'image et aux symboles, même avec le letterboxing.
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

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !imgUrl || !imageRect?.width || !imageRect.height) return;

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            const bounds = container.getBoundingClientRect();
            const offsetX = event.clientX - (bounds.left + bounds.width / 2);
            const offsetY = event.clientY - (bounds.top + bounds.height / 2);
            const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? bounds.height : 1);
            const factor = Math.exp(-Math.max(-400, Math.min(400, pixels)) * 0.001);
            setManualView((current) => zoomAtPoint(
                mode === "manual" ? current : view, factor, offsetX, offsetY, imageRect.width, imageRect.height
            ));
            setMode("manual");
        };

        container.addEventListener("wheel", onWheel, { passive: false });
        return () => container.removeEventListener("wheel", onWheel);
    }, [imageRect, imgUrl, mode, view]);

    const changeZoom = (factor: number) => {
        setManualView(clampView({ ...view, zoom: view.zoom * factor }));
        setMode("manual");
    };

    const selectMode = (nextMode: MapMode) => {
        if (nextMode === "manual" && mode !== "manual") setManualView(view);
        setMode(nextMode);
    };

    return (
        <div className="widget-card widget-card--map">
            <div className="map-header">
                <span>Carte tactique</span>
                {info && <span className="map-header__status">{info.valid ? "en vol" : "hors ligne"}</span>}
            </div>
            <div className="map-toolbar">
                <div className="map-legend" aria-label="Légende des couleurs">
                    <span className="legend-item"><span className="legend-dot legend-dot--friend" /> Allié</span>
                    <span className="legend-item"><span className="legend-dot legend-dot--enemy" /> Ennemi</span>
                    <span className="legend-item"><span className="legend-dot legend-dot--player" /> Vous (joueur)</span>
                    <span className="legend-item"><span className="legend-dot legend-dot--teammate" /> Coéquipier</span>
                    <span className="legend-item"><span className="legend-dot legend-dot--capture" /> Zone à capturer</span>
                    {!online && <span className="widget-card__offline">Signal perdu</span>}
                </div>
                <div className="map-controls">
                    <div className="map-modes" role="group" aria-label="Mode de cadrage de la carte">
                        <button type="button" aria-pressed={mode === "battlefield"}
                            onClick={() => selectMode("battlefield")}>Suivi de champ de bataille</button>
                        <button type="button" aria-pressed={mode === "player"}
                            disabled={!currentPlayerView && mode !== "player"}
                            title={!currentPlayerView ? "Position du joueur indisponible" : undefined}
                            onClick={() => selectMode("player")}>Suivi du joueur</button>
                        <button type="button" aria-pressed={mode === "manual"}
                            onClick={() => selectMode("manual")}>Mode manuel</button>
                    </div>
                    <div className="map-zoom" role="group" aria-label="Zoom de la carte">
                        <button type="button" onClick={() => changeZoom(1 / 1.25)} aria-label="Dézoomer">−</button>
                        <span aria-live="polite">{Math.round(view.zoom * 100)} %</span>
                        <button type="button" onClick={() => changeZoom(1.25)} aria-label="Zoomer">+</button>
                        <button type="button" onClick={() => selectMode("battlefield")}>Réinitialiser</button>
                    </div>
                </div>
            </div>
            {mode === "player" && !currentPlayerView &&
                <p className="map-follow-warning" role="status">Position du joueur indisponible : carte entière affichée.</p>}
            <div className="map-viewport" style={{ "--map-aspect": imageAspectRatio } as CSSProperties}>
            <div className="map-container" ref={containerRef}
                onPointerDown={(event) => {
                    if (event.button !== 0 || !imageRect) return;
                    dragRef.current = { x: event.clientX, y: event.clientY };
                    event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                    const previous = dragRef.current;
                    if (!previous || !imageRect) return;
                    const dx = event.clientX - previous.x;
                    const dy = event.clientY - previous.y;
                    dragRef.current = { x: event.clientX, y: event.clientY };
                    setManualView((current) => {
                        const from = mode === "manual" ? current : view;
                        return clampView({
                            ...from,
                            x: from.x - dx / (imageRect.width * from.zoom),
                            y: from.y - dy / (imageRect.height * from.zoom)
                        });
                    });
                    setMode("manual");
                }}
                onPointerUp={() => { dragRef.current = null; }}
                onPointerCancel={() => { dragRef.current = null; }}
                onLostPointerCapture={() => { dragRef.current = null; }}
            >
                <div className="map-scene" style={imageRect ? {
                    transform: `translate(${(0.5 - view.x) * imageRect.width * view.zoom}px, ${(0.5 - view.y) * imageRect.height * view.zoom}px) scale(${view.zoom})`
                } : undefined}>
                {imgUrl ? (
                    <img
                        ref={imgRef}
                        src={imgUrl}
                        draggable={false}
                        alt="Carte tactique"
                        className="map-image"
                        onLoad={(e) => {
                            const img = e.currentTarget;
                            const container = containerRef.current;
                            if (!container) return;
                            setImageAspectRatio(img.naturalWidth / img.naturalHeight);
                            setImageRect(
                                computeContainRect(container.clientWidth, container.clientHeight, img.naturalWidth, img.naturalHeight)
                            );
                        }}
                    />
                ) : (
                    <div className="map-placeholder">Aucune image de carte</div>
                )}
                {imgUrl && imageRect && (
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
                        {positionedObjects.map((o, i) => {
                            const category = categoryOf(o);
                            if (!visibility[category]) return null;
                            const rgb = o.color_rgb;
                            const color = o.color_hex ?? (
                                rgb && rgb.length >= 3 && rgb.slice(0, 3).every((value) => Number.isFinite(value))
                                    ? `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
                                    : "#ffdd33"
                            );
                            if (category === "area" && o.sx != null && o.sy != null && o.ex != null && o.ey != null) {
                                return (
                                    <rect key={i} x={Math.min(o.sx, o.ex) * 100}
                                        y={Math.min(o.sy, o.ey) * 100}
                                        width={Math.abs(o.ex - o.sx) * 100}
                                        height={Math.abs(o.ey - o.sy) * 100}
                                        fill="none" stroke={color} strokeWidth={0.5} />
                                );
                            }
                            if (o.x != null && o.y != null) {
                                if (!Number.isFinite(o.x) || !Number.isFinite(o.y)) return null;
                                return (
                                    <g key={i}>
                                        <title>{o.icon ?? o.type}</title>
                                        <MapSymbol category={category}
                                            x={o.x * 100 - MAP_SYMBOL_SIZE / 2}
                                            y={o.y * 100 - MAP_SYMBOL_SIZE / 2}
                                            size={MAP_SYMBOL_SIZE} color={color}
                                            heading={category === "player" ? playerHeading : directionHeading(o)} />
                                    </g>
                                );
                            }
                            if (o.sx != null && o.sy != null && o.ex != null && o.ey != null) {
                                return (
                                    <g key={i}>
                                        <title>{o.icon ?? o.type}</title>
                                        {category !== "airfield" &&
                                            <rect x={Math.min(o.sx, o.ex) * 100}
                                                y={Math.min(o.sy, o.ey) * 100}
                                                width={Math.abs(o.ex - o.sx) * 100}
                                                height={Math.abs(o.ey - o.sy) * 100}
                                                fill="none" stroke={color} strokeWidth={0.5} />}
                                        {category !== "area" &&
                                            <MapSymbol category={category}
                                                x={(o.sx + o.ex) * 50 - MAP_SYMBOL_SIZE / 2}
                                                y={(o.sy + o.ey) * 50 - MAP_SYMBOL_SIZE / 2}
                                                size={MAP_SYMBOL_SIZE} color={color}
                                                heading={category === "player" ? playerHeading : directionHeading(o)} />}
                                    </g>
                                );
                            }
                            return null;
                        })}
                    </svg>
                )}
                </div>
            </div>
            </div>
            <div className="map-filter-controls">
            <details
                ref={filtersRef}
                className={`map-type-filters ${filtersPinned ? "map-type-filters--pinned" : ""}`}
                onToggle={(event) => {
                    if (!event.currentTarget.open && filtersPinned) setFiltersPinned(false);
                }}
            >
                <summary>
                    Afficher les types d'éléments · {positionedObjects.length} présents · {shownCount} activés
                </summary>
                <fieldset className="map-type-legend">
                    <legend className="visually-hidden">Types d'éléments sur la carte</legend>
                    <label className="map-type-legend__item map-type-legend__all">
                        <input
                            ref={allTypesRef}
                            type="checkbox"
                            checked={allTypesChecked}
                            onChange={() => setVisibility(() => {
                                const next = { ...DEFAULT_VISIBILITY };
                                for (const { id } of MAP_CATEGORIES) next[id] = !allTypesChecked;
                                return next;
                            })}
                        />
                        Tout afficher
                    </label>
                    {categoryCounts.map(({ id, label, count }) => (
                        <label key={id} className="map-type-legend__item">
                            <input type="checkbox" checked={visibility[id]}
                                onChange={() => setVisibility((current) => ({ ...current, [id]: !current[id] }))} />
                            <MapSymbol category={id} className="map-type-legend__icon" />
                            {label} <span className="map-type-legend__count">{count}</span>
                        </label>
                    ))}
                </fieldset>
            </details>
            <button
                type="button"
                className="map-filter-pin"
                aria-pressed={filtersPinned}
                onClick={() => {
                    if (filtersPinned && filtersRef.current) filtersRef.current.open = false;
                    setFiltersPinned(!filtersPinned);
                }}
            >
                {filtersPinned ? "Détacher les filtres" : "Épingler les filtres"}
            </button>
            </div>
        </div>
    );
}
