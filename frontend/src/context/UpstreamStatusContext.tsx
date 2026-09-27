import { useMemo } from "react";
import type { ReactNode } from "react";

import { api } from "../api/client";
import { POLL_INTERVALS } from "../config/env";
import { usePolling } from "../hooks/usePolling";
import { UpstreamStatusContext, type UpstreamStatusValue } from "./upstreamStatusContextValue";
import type { StatusResponse } from "../api/types";

/**
 * Fournit un unique polling partagé de `GET /api/v1/status`, afin que tous les composants
 * (bannière, alarmes...) sachent si le jeu War Thunder est réellement joignable, et pas
 * seulement si le backend répond (le backend répond toujours en HTTP 200, même quand le jeu
 * est éteint, grâce au comportement de fallback).
 */
export function UpstreamStatusProvider({ children }: { children: ReactNode }) {
    const { data, online } = usePolling<StatusResponse>((signal) => api.status(signal), POLL_INTERVALS.status);

    const value = useMemo<UpstreamStatusValue>(
        () => ({
            backendOnline: online,
            upstreamReachable: online && (data?.upstream.reachable ?? false),
            status: data
        }),
        [data, online]
    );

    return <UpstreamStatusContext.Provider value={value}>{children}</UpstreamStatusContext.Provider>;
}

