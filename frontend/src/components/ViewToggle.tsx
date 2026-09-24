interface ViewToggleProps {
    showMap: boolean;
    showWidgets: boolean;
    onToggleMap: () => void;
    onToggleWidgets: () => void;
}

/**
 * Contrôle centré au-dessus de la carte permettant d'afficher/masquer la carte et/ou les
 * autres widgets (vitesse, altitude, boussole, gyroscope).
 *
 * Les deux boutons peuvent être actifs en même temps ou séparément, mais au moins un des deux
 * doit toujours rester actif : si on désactive le seul bouton encore actif, l'action est
 * inversée (ce bouton se désactive et l'autre s'active à sa place) plutôt que de tout masquer.
 */
export default function ViewToggle({ showMap, showWidgets, onToggleMap, onToggleWidgets }: ViewToggleProps) {
    return (
        <div className="view-toggle" role="group" aria-label="Choix de l'affichage">
            <button
                type="button"
                className={`view-toggle__button ${showMap ? "is-active" : ""}`}
                aria-pressed={showMap}
                onClick={onToggleMap}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                Carte
            </button>
            <button
                type="button"
                className={`view-toggle__button ${showWidgets ? "is-active" : ""}`}
                aria-pressed={showWidgets}
                onClick={onToggleWidgets}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                Widgets
            </button>
        </div>
    );
}
