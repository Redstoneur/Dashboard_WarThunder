import { useUpstreamStatus } from "../context/useUpstreamStatus";

/**
 * Bannière indiquant si le serveur War Thunder d'origine (la machine sur laquelle le jeu
 * tourne) est joignable. S'appuie sur `GET /api/v1/status`, qui reste disponible même quand
 * le jeu est éteint (voir backend: comportement de fallback).
 */
export default function StatusBanner() {
    const { status, upstreamReachable } = useUpstreamStatus();

    if (!status || upstreamReachable) return null;

    return (
        <div className="status-banner" role="status">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span>
                Serveur War Thunder injoignable ({status.upstream.host}:{status.upstream.port}) — lancez le jeu pour
                recevoir la télémétrie en direct. Affichage de données par défaut.
            </span>
        </div>
    );
}
