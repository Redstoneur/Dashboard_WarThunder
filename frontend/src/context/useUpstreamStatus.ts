import { useContext } from "react";

import { UpstreamStatusContext } from "./upstreamStatusContextValue";

/** Accès à l'état de connectivité au serveur War Thunder (voir `UpstreamStatusProvider`). */
export function useUpstreamStatus() {
    const ctx = useContext(UpstreamStatusContext);
    if (!ctx) {
        throw new Error("useUpstreamStatus must be used within an UpstreamStatusProvider");
    }
    return ctx;
}
