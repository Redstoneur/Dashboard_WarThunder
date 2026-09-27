import ViewToggle from "../ViewToggle";

interface HeaderProps {
    showMap: boolean;
    showWidgets: boolean;
    onToggleMap: () => void;
    onToggleWidgets: () => void;
}

/** En-tête de l'application: logo/titre, et bascule d'affichage carte/widgets centrée. */
export default function Header({ showMap, showWidgets, onToggleMap, onToggleWidgets }: HeaderProps) {
    return (
        <header className="app__header">
            <div className="app__brand">
                <img src="/logo.svg" width="34" height="34" alt="" aria-hidden="true" className="app__logo" />
                <div>
                    <h1 className="app__title">WarThunder Dashboard</h1>
                    <p className="app__subtitle">Télémétrie en temps réel</p>
                </div>
            </div>

            <div className="app__header-center">
                <ViewToggle
                    showMap={showMap}
                    showWidgets={showWidgets}
                    onToggleMap={onToggleMap}
                    onToggleWidgets={onToggleWidgets}
                />
            </div>

            <div className="app__header-spacer" aria-hidden="true" />
        </header>
    );
}
