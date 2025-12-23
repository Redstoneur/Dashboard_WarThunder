import {useEffect, useRef, useState} from 'react'
import '../style/Compass.css'

interface CompassData {
    heading: number
    direction: string
}

const API_URL = '/compass'
const POLL_MS = 100
const SMOOTHING_TAU = 0.08 // secondes

function shortestAngleDiff(a: number, b: number) {
    return ((b - a + 180) % 360) - 180
}

export default function Compass() {
    const targetRef = useRef<number>(0)
    const displayRef = useRef<number>(0)
    const [displayHeading, setDisplayHeading] = useState<number>(0)
    const [direction, setDirection] = useState<string>('---')

    useEffect(() => {
        let mounted = true

        const getOnce = async () => {
            try {
                const res = await fetch(API_URL)
                if (!res.ok) {
                    console.debug(`[Compass] HTTP ${res.status}`)
                    // valeur par défaut
                    targetRef.current = 0
                    displayRef.current = 0
                    if (mounted) setDisplayHeading(0)
                    if (mounted) setDirection('--')
                    return
                }
                const data = (await res.json()) as CompassData
                if (!mounted) return
                const raw = Number(data.heading)
                if (!Number.isFinite(raw)) {
                    targetRef.current = 0
                } else {
                    targetRef.current = ((raw % 360) + 360) % 360
                }
                setDirection(data.direction ?? '--')
                console.debug('[Compass] data ok')
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                console.warn(`[Compass] fetch error: ${msg}`)
                // valeur par défaut
                targetRef.current = 0
                displayRef.current = 0
                if (mounted) setDisplayHeading(0)
                if (mounted) setDirection('--')
            }
        }

        // Polling loop qui attend la fin du fetch avant de replanifier
        let stopped = false
        const loop = async () => {
            while (!stopped) {
                await getOnce()
                // attendre POLL_MS ms avant la prochaine itération
                await new Promise((r) => setTimeout(r, POLL_MS))
            }
        }

        loop()
        return () => {
            mounted = false
            stopped = true
        }
    }, [])

    // animation loop pour interpolation fluide du heading
    useEffect(() => {
        let raf = 0
        let last = performance.now()
        const step = (now: number) => {
            const dt = (now - last) / 1000
            last = now
            const alpha = 1 - Math.exp(-dt / SMOOTHING_TAU)

            const t = targetRef.current
            let d = displayRef.current

            const diff = shortestAngleDiff(d, t)
            d = (d + diff * Math.max(0, Math.min(1, alpha)) + 360) % 360

            displayRef.current = d
            setDisplayHeading(d)

            raf = requestAnimationFrame(step)
        }

        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [])

    const heading = displayHeading

    return (
        <div className="compass-root" aria-live="polite">
            <div className="compass" role="img" aria-label={`Compass heading ${heading.toFixed(2)}° ${direction}`}>
                <div
                    className="compass-needle"
                    style={{transform: `rotate(${heading}deg)`}}
                    aria-hidden="true"
                />
                <div className="compass-center"/>

                {/* cardinals */}
                <div className="compass-label north">N</div>
                <div className="compass-label east">E</div>
                <div className="compass-label south">S</div>
                <div className="compass-label west">W</div>

                {/* intercardinals */}
                <div className="compass-label ne">NE</div>
                <div className="compass-label nw">NW</div>
                <div className="compass-label se">SE</div>
                <div className="compass-label sw">SW</div>
            </div>

            <div className="compass-info">
                <div className="compass-heading">{heading.toFixed(2)}°</div>
                <div className="compass-direction">{
                    (({
                        N: 'Nord',
                        NE: 'Nord-Est',
                        E: 'Est',
                        SE: 'Sud-Est',
                        S: 'Sud',
                        SW: 'Sud-Ouest',
                        W: 'Ouest',
                        NW: 'Nord-Ouest'
                    } as Record<string, string>)[direction] ?? direction)
                }</div>
            </div>
        </div>
    )
}
