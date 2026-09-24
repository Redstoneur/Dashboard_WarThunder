import { createContext } from "react";

import type { StatusResponse } from "../api/types";

export interface UpstreamStatusValue {
    /** Le backend a répondu (indépendamment de l'état du jeu War Thunder). */
    backendOnline: boolean;
    /** Le serveur War Thunder d'origine (la machine sur laquelle le jeu tourne) est joignable. */
    upstreamReachable: boolean;
    status: StatusResponse | null;
}

export const UpstreamStatusContext = createContext<UpstreamStatusValue | null>(null);
