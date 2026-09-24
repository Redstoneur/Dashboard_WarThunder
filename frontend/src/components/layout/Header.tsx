interface HeaderProps {
    navOpen: boolean;
    onToggleNav: () => void;
    onLinkClick: () => void;
}

/** En-tête de l'application: titre, sous-titre et navigation responsive vers les widgets. */
export default function Header({ navOpen, onToggleNav, onLinkClick }: HeaderProps) {
    return (
        <header className="app__header">
            <div className="app__brand">
                <img src="/logo.svg" width="34" height="34" alt="" aria-hidden="true" className="app__logo" />
                <div>
                    <h1 className="app__title">WarThunder Dashboard</h1>
                    <p className="app__subtitle">Télémétrie en temps réel</p>
                </div>
            </div>

            <button
                className="nav-toggle"
                aria-controls="main-nav"
                aria-expanded={navOpen}
                aria-label={navOpen ? "Fermer la navigation" : "Ouvrir la navigation"}
                onClick={onToggleNav}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            <nav id="main-nav" className={`app__nav ${navOpen ? "is-open" : ""}`} aria-label="Navigation principale">
                <ul className="nav__list">
                    <li><a href="#map" className="nav__link" onClick={onLinkClick}>Carte</a></li>
                    <li><a href="#speed" className="nav__link" onClick={onLinkClick}>Vitesse</a></li>
                    <li><a href="#altitude" className="nav__link" onClick={onLinkClick}>Altitude</a></li>
                    <li><a href="#compass" className="nav__link" onClick={onLinkClick}>Boussole</a></li>
                    <li><a href="#gyro" className="nav__link" onClick={onLinkClick}>Gyroscope</a></li>
                </ul>
            </nav>
        </header>
    );
}
