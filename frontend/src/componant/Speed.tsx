import {useEffect, useRef, useState} from 'react'
import '../style/Speed.css'

const API_URL = '/speed'
const POLL_MS = 200
const SMOOTHING_TAU = 0.08

// Configurable range for speed (km/h)
const SPEED_MIN = 0
const SPEED_MAX = 1000

function valueToColor(value: number, min: number, max: number) {
    const clamped = Math.max(min, Math.min(max, value))
    const ratio = (clamped - min) / Math.max(1, (max - min))
    // hue 0 = red, 120 = green
    const hue = Math.round(ratio * 120)
    return `hsl(${hue} 75% 35%)` // modern HSL with spaces works in browsers
}

export default function Speed() {
    const targetRef = useRef<number>(0)
    const displayRef = useRef<number>(0)
    const [display, setDisplay] = useState<number>(0)

    useEffect(() => {
        let mounted = true

        const getOnce = async () => {
            try {
                const res = await fetch(API_URL)
                if (!res.ok) {
                    if (mounted) console.debug(`[Speed] HTTP ${res.status}`)
                    targetRef.current = 0
                    displayRef.current = 0
                    if (mounted) setDisplay(0)
                    return
                }
                const text = await res.text()
                const val = Number(text)
                if (!Number.isFinite(val)) targetRef.current = 0
                else targetRef.current = val
                console.debug('[Speed] data ok')
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                console.warn(`[Speed] fetch error: ${msg}`)
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

    const color = valueToColor(display, SPEED_MIN, SPEED_MAX)

    return (
        <div className="speed-root">
            <div className="speed-box" style={{ borderColor: color }}>
                <div className="speed-value" style={{ color }}>{Math.round(display).toLocaleString()} km/h</div>
            </div>
        </div>
    )
}
