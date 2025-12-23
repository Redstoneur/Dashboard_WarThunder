import {useEffect, useRef, useState} from 'react'
import '../style/Altitude.css'

const API_URL = '/altitude'
const POLL_MS = 500
const SMOOTHING_TAU = 0.12 // secondes

export default function Altitude() {
    const targetRef = useRef<number>(0)
    const displayRef = useRef<number>(0)
    const [display, setDisplay] = useState<number>(0)

    useEffect(() => {
        let mounted = true
        const getOnce = async () => {
            try {
                const res = await fetch(API_URL)
                if (!res.ok) {
                    // défaut : afficher 0 si l'API renvoie une erreur
                    if (mounted) console.debug(`[Altitude] HTTP ${res.status}`)
                    targetRef.current = 0
                    displayRef.current = 0
                    if (mounted) setDisplay(0)
                    return
                }
                const text = await res.text()
                const val = Number(text)
                if (!Number.isFinite(val)) targetRef.current = 0
                else targetRef.current = val
                console.debug('[Altitude] data ok')
            } catch (err: unknown) {
                // en cas d'erreur réseau, afficher la valeur par défaut
                const msg = err instanceof Error ? err.message : String(err)
                console.warn(`[Altitude] fetch error: ${msg}`)
                targetRef.current = 0
                displayRef.current = 0
                if (mounted) setDisplay(0)
            }
        }

        let stopped = false
        const loop = async () => {
            while (!stopped) {
                await getOnce()
                await new Promise((r) => setTimeout(r, POLL_MS))
            }
        }

        loop()
        return () => {
            mounted = false
            stopped = true
        }
    }, [])

    useEffect(() => {
        let raf = 0
        let last = performance.now()
        const step = (now: number) => {
            const dt = (now - last) / 1000
            last = now
            const alpha = 1 - Math.exp(-dt / SMOOTHING_TAU)
            const t = targetRef.current
            let d = displayRef.current
            d += (t - d) * Math.max(0, Math.min(1, alpha))
            displayRef.current = d
            setDisplay(d)
            raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [])

    return (
        <div className="altitude-root">
            <div className="altitude-box">
                <div className="altitude-value">{Math.round(display).toLocaleString()} m</div>
                <div className="altitude-label">Altitude</div>
            </div>
        </div>
    )
}
