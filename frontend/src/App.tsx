import './style/App.css'
import Gyroscope from "./componant/Gyroscope";
import Compass from "./componant/Compass";
import Altitude from "./componant/Altitude";
import Speed from "./componant/Speed";
import Map from "./componant/Map";
import { useState, useEffect } from 'react';

function App() {
    const [navOpen, setNavOpen] = useState(false);

    // Close nav on Escape and when resizing larger than mobile
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setNavOpen(false);
        };
        const onResize = () => {
            if (window.innerWidth >= 768) setNavOpen(false);
        };
        window.addEventListener('keydown', onKey);
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const handleLinkClick = () => {
        setNavOpen(false);
    };

    return (
        <div className="app" lang="fr">
            <header className="app__header">
                <div className="app__brand">
                    <h1 className="app__title">WarThunder - Dashboard</h1>
                    <p className="app__subtitle">Télémetrie en temps réel</p>
                </div>
                <button
                  className="nav-toggle"
                  aria-controls="main-nav"
                  aria-expanded={navOpen}
                  aria-label={navOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'}
                  onClick={() => setNavOpen(v => !v)}
                >
                  ☰
                </button>
                <nav id="main-nav" className={`app__nav ${navOpen ? 'is-open' : ''}`} role="navigation" aria-label="Navigation principale">
                    <ul className="nav__list">
                        <li><a href="#map" className="nav__link" onClick={handleLinkClick}>Carte</a></li>
                        <li><a href="#speed" className="nav__link" onClick={handleLinkClick}>Vitesse</a></li>
                        <li><a href="#altitude" className="nav__link" onClick={handleLinkClick}>Altitude</a></li>
                        <li><a href="#compass" className="nav__link" onClick={handleLinkClick}>Boussole</a></li>
                        <li><a href="#gyro" className="nav__link" onClick={handleLinkClick}>Gyroscope</a></li>
                    </ul>
                </nav>
            </header>

            <main className="app__main" id="main" tabIndex={-1}>
                <section className="widgets" aria-label="Widgets de télémétrie">
                    <article id="map" className="widget widget--map" aria-labelledby="map-title">
                        <h2 id="map-title" className="visually-hidden">Carte</h2>
                        <Map/>
                    </article>

                    <article id="speed" className="widget widget--speed" aria-labelledby="speed-title">
                        <h2 id="speed-title" className="widget__title">Vitesse</h2>
                        <Speed/>
                    </article>

                    <article id="altitude" className="widget widget--altitude" aria-labelledby="altitude-title">
                        <h2 id="altitude-title" className="widget__title">Altitude</h2>
                        <Altitude/>
                    </article>

                    <article id="compass" className="widget widget--compass" aria-labelledby="compass-title">
                        <h2 id="compass-title" className="widget__title">Boussole</h2>
                        <Compass/>
                    </article>

                    <article id="gyro" className="widget widget--gyro" aria-labelledby="gyro-title">
                        <h2 id="gyro-title" className="widget__title">Gyroscope</h2>
                        <Gyroscope/>
                    </article>
                </section>
            </main>

            <footer className="app__footer" role="contentinfo">
                <small>© {new Date().getFullYear()} WarThunder Dashboard </small>
            </footer>
        </div>
    )
}

export default App
