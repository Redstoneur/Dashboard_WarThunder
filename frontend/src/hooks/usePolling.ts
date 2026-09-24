import { useEffect, useRef, useState } from "react";

/**
 * Interroge périodiquement `fetcher` et expose la dernière valeur reçue ainsi qu'un indicateur
 * `online` (false si le dernier appel a échoué). Attend la fin de chaque appel avant de
 * replanifier, pour éviter les requêtes concurrentes en cas de latence réseau.
 */
export function usePolling<T>(fetcher: (signal: AbortSignal) => Promise<T>, intervalMs: number, deps: unknown[] = []) {
    const [data, setData] = useState<T | null>(null);
    const [online, setOnline] = useState<boolean>(true);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    useEffect(() => {
        let stopped = false;
        const controller = new AbortController();

        const tick = async () => {
            try {
                const result = await fetcherRef.current(controller.signal);
                if (stopped) return;
                setData(result);
                setOnline(true);
            } catch (err) {
                if (stopped || controller.signal.aborted) return;
                console.debug("[usePolling] fetch error", err);
                setOnline(false);
            }
        };

        const loop = async () => {
            while (!stopped) {
                await tick();
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
            }
        };

        loop();
        return () => {
            stopped = true;
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intervalMs, ...deps]);

    return { data, online };
}
