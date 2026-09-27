import { useEffect, useRef, useState } from "react";

/**
 * Lisse une valeur numérique cible vers un affichage progressif (interpolation exponentielle),
 * pour éviter les à-coups visuels dus au polling réseau.
 */
export function useSmoothedValue(target: number, tauSeconds = 0.1): number {
    const targetRef = useRef(target);
    const displayRef = useRef(target);
    const [display, setDisplay] = useState(target);

    useEffect(() => {
        targetRef.current = target;
    }, [target]);

    useEffect(() => {
        let raf = 0;
        let last = performance.now();
        const step = (now: number) => {
            const dt = (now - last) / 1000;
            last = now;
            const alpha = 1 - Math.exp(-dt / tauSeconds);
            const d = displayRef.current + (targetRef.current - displayRef.current) * Math.max(0, Math.min(1, alpha));
            displayRef.current = d;
            setDisplay(d);
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [tauSeconds]);

    return display;
}

function shortestAngleDiff(a: number, b: number): number {
    return ((b - a + 180) % 360) - 180;
}

/** Variante de `useSmoothedValue` pour des angles en degrés (0-360), gérant le wrap-around. */
export function useSmoothedAngle(target: number, tauSeconds = 0.1): number {
    const targetRef = useRef(target);
    const displayRef = useRef(target);
    const [display, setDisplay] = useState(target);

    useEffect(() => {
        targetRef.current = ((target % 360) + 360) % 360;
    }, [target]);

    useEffect(() => {
        let raf = 0;
        let last = performance.now();
        const step = (now: number) => {
            const dt = (now - last) / 1000;
            last = now;
            const alpha = 1 - Math.exp(-dt / tauSeconds);
            const diff = shortestAngleDiff(displayRef.current, targetRef.current);
            const d = (displayRef.current + diff * Math.max(0, Math.min(1, alpha)) + 360) % 360;
            displayRef.current = d;
            setDisplay(d);
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [tauSeconds]);

    return display;
}
