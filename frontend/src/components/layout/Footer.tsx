/** Pied de page de l'application. */
export default function Footer() {
    return (
        <footer className="app__footer" role="contentinfo">
            <small>© {new Date().getFullYear()} WarThunder Dashboard</small>
        </footer>
    );
}
