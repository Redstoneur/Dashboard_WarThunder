/** En-tête de l'application: logo, titre et sous-titre. */
export default function Header() {
    return (
        <header className="app__header">
            <div className="app__brand">
                <img src="/logo.svg" width="34" height="34" alt="" aria-hidden="true" className="app__logo" />
                <div>
                    <h1 className="app__title">WarThunder Dashboard</h1>
                    <p className="app__subtitle">Télémétrie en temps réel</p>
                </div>
            </div>
        </header>
    );
}
