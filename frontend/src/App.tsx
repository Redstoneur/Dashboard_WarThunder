import { useEffect, useState } from "react";

import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import StatusBanner from "./components/StatusBanner";
import AltitudeWidget from "./components/widgets/AltitudeWidget";
import CompassWidget from "./components/widgets/CompassWidget";
import GyroscopeWidget from "./components/widgets/GyroscopeWidget";
import MapWidget from "./components/widgets/MapWidget";
import SpeedWidget from "./components/widgets/SpeedWidget";
import "./styles/App.css";

function App() {
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setNavOpen(false);
        };
        const onResize = () => {
            if (window.innerWidth >= 768) setNavOpen(false);
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <div className="app" lang="fr">
            <Header navOpen={navOpen} onToggleNav={() => setNavOpen((v) => !v)} onLinkClick={() => setNavOpen(false)} />

            <StatusBanner />

            <main className="app__main" id="main" tabIndex={-1}>
                <section className="widgets" aria-label="Widgets de télémétrie">
                    <article id="map" className="widget widget--map" aria-labelledby="map-title">
                        <h2 id="map-title" className="visually-hidden">Carte</h2>
                        <MapWidget />
                    </article>

                    <article id="speed" className="widget widget--speed" aria-labelledby="speed-title">
                        <h2 id="speed-title" className="widget__title">Vitesse</h2>
                        <SpeedWidget />
                    </article>

                    <article id="altitude" className="widget widget--altitude" aria-labelledby="altitude-title">
                        <h2 id="altitude-title" className="widget__title">Altitude</h2>
                        <AltitudeWidget />
                    </article>

                    <article id="compass" className="widget widget--compass" aria-labelledby="compass-title">
                        <h2 id="compass-title" className="widget__title">Boussole</h2>
                        <CompassWidget />
                    </article>

                    <article id="gyro" className="widget widget--gyro" aria-labelledby="gyro-title">
                        <h2 id="gyro-title" className="widget__title">Gyroscope</h2>
                        <GyroscopeWidget />
                    </article>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default App;
