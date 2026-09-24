import { useState } from "react";

import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import StatusBanner from "./components/StatusBanner";
import ViewToggle from "./components/ViewToggle";
import AltitudeWidget from "./components/widgets/AltitudeWidget";
import CompassWidget from "./components/widgets/CompassWidget";
import GyroscopeWidget from "./components/widgets/GyroscopeWidget";
import MapWidget from "./components/widgets/MapWidget";
import SpeedWidget from "./components/widgets/SpeedWidget";
import { UpstreamStatusProvider } from "./context/UpstreamStatusContext";
import "./styles/App.css";

function App() {
    const [showMap, setShowMap] = useState(true);
    const [showWidgets, setShowWidgets] = useState(true);

    // Un seul des deux peut être désactivé à la fois : si on tente de désactiver le dernier
    // panneau encore visible, l'action est inversée (celui-ci se masque, l'autre se ré-affiche)
    // afin qu'il y ait toujours au moins un panneau affiché.
    const toggleMap = () => {
        if (showMap && !showWidgets) {
            setShowMap(false);
            setShowWidgets(true);
            return;
        }
        setShowMap((v) => !v);
    };

    const toggleWidgets = () => {
        if (showWidgets && !showMap) {
            setShowWidgets(false);
            setShowMap(true);
            return;
        }
        setShowWidgets((v) => !v);
    };

    return (
        <div className="app" lang="fr">
            <UpstreamStatusProvider>
                <Header />

                <StatusBanner />

                <main className="app__main" id="main" tabIndex={-1}>
                    <section className="widgets" aria-label="Widgets de télémétrie">
                        <article id="map" className="widget widget--map" aria-labelledby="map-title">
                            <h2 id="map-title" className="visually-hidden">Carte</h2>
                            <div className="view-toggle-bar">
                                <ViewToggle
                                    showMap={showMap}
                                    showWidgets={showWidgets}
                                    onToggleMap={toggleMap}
                                    onToggleWidgets={toggleWidgets}
                                />
                            </div>
                            {showMap && <MapWidget />}
                        </article>

                        {showWidgets && (
                            <>
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
                            </>
                        )}
                    </section>
                </main>

                <Footer />
            </UpstreamStatusProvider>
        </div>
    );
}

export default App;
