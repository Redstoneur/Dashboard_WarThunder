import {useEffect, useRef, useState} from 'react'
import '../style/Altitude.css'

const API_URL = '/altitude'
const POLL_MS = 500
const SMOOTHING_TAU = 0.12 // secondes

// Configurable range pour altitude (m)
const ALT_MIN = 0
const ALT_MAX = 3000

type AltitudeResp = {
    altitude_meters?: number | null
    gear_deployed?: boolean | null
}

function valueToColor(value: number, min: number, max: number) {
    const clamped = Math.max(min, Math.min(max, value))
    const ratio = (clamped - min) / Math.max(1, (max - min))
    const hue = Math.round(ratio * 120) // 0 red -> 120 green
    return `hsl(${hue} 70% 35%)`
}

export default function Altitude() {
    const targetRef = useRef<number>(0)
    const displayRef = useRef<number>(0)
    const gearRef = useRef<boolean>(true)
    const [display, setDisplay] = useState<number>(0)

    // Audio alarm refs
    const audioCtxRef = useRef<AudioContext | null>(null)
    const oscRef = useRef<OscillatorNode | null>(null)
    const gainRef = useRef<GainNode | null>(null)
    const alarmOnRef = useRef<boolean>(false)

    // Helper: démarrer l'alarme
    const startAlarm = async () => {
        if (alarmOnRef.current) return
        try {
            // typed access to possible AudioContext constructors (évite 'any')
            const globalWithAudio = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
            const AudioCtor = globalWithAudio.AudioContext ?? globalWithAudio.webkitAudioContext
            if (!AudioCtor) {
                console.warn('[Altitude] AudioContext not available in this environment')
                return
            }
            const ctx = audioCtxRef.current ?? new AudioCtor()
            audioCtxRef.current = ctx
            // resume may require a user gesture in modern browsers
            try {
                await ctx.resume()
            } catch (e) {
                console.warn('[Altitude] audio resume failed:', e)
            }
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.value = 880 // A high-pitched alert tone
            gain.gain.value = 0.04 // faible volume
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start()
            oscRef.current = osc
            gainRef.current = gain
            alarmOnRef.current = true
            console.debug('[Altitude] alarm started')
        } catch (err) {
            console.warn('[Altitude] cannot start alarm:', err)
        }
    }

    // Helper: stopper l'alarme
    const stopAlarm = () => {
        if (!alarmOnRef.current) return
        try {
            oscRef.current?.stop()
            oscRef.current?.disconnect()
            gainRef.current?.disconnect()
        } catch {
            // ignore
        }
        oscRef.current = null
        gainRef.current = null
        alarmOnRef.current = false
        // suspend plutôt que close pour éviter coûts de recreation fréquente
        try {
            audioCtxRef.current?.suspend().catch(() => {})
        } catch {
            // ignore
        }
        console.debug('[Altitude] alarm stopped')
    }

    useEffect(() => {
        let mounted = true
        const getOnce = async () => {
            try {
                const res = await fetch(API_URL)
                if (!res.ok) {
                    if (mounted) console.debug(`[Altitude] HTTP ${res.status}`)
                    // defaults sûrs
                    targetRef.current = 0
                    gearRef.current = true
                    displayRef.current = 0
                    if (mounted) {
                        setDisplay(0)
                    }
                    stopAlarm()
                    return
                }
                const data: AltitudeResp = await res.json()
                const raw = Number(data?.altitude_meters ?? 0)
                const altitude = Number.isFinite(raw) ? raw : 0
                const gear = data?.gear_deployed ?? true
                targetRef.current = altitude
                gearRef.current = gear
                console.debug('[Altitude] data ok', { altitude, gear: gearRef.current })
                // alarm control based on freshly fetched (raw) altitude
                if (altitude < 100 && !gearRef.current) {
                    startAlarm()
                } else {
                    stopAlarm()
                }
                if (mounted) setDisplay((d) => d) // no-op to keep parity (safe)
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                console.warn(`[Altitude] fetch error: ${msg}`)
                targetRef.current = 0
                gearRef.current = true
                displayRef.current = 0
                if (mounted) {
                    setDisplay(0)
                }
                stopAlarm()
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

    // smoothing display loop
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

    // cleanup audio context on unmount
    useEffect(() => {
        return () => {
            stopAlarm()
            try {
                audioCtxRef.current?.close().catch(() => {})
            } catch {
                // ignore
            }
            audioCtxRef.current = null
        }
    }, [])

    const color = valueToColor(display, ALT_MIN, ALT_MAX)

    // create a semi-transparent shadow color using modern HSL alpha syntax
    const shadowColor = color.replace(')', ' / 0.12)')

    // debug to console to help diagnose if the value is updating
    useEffect(() => {
        console.debug(`[Altitude] display=${display.toFixed(2)} color=${color}`)
    }, [display, color])

    return (
        <div className="altitude-root">
            <div className="altitude-box" style={{ borderColor: color, boxShadow: `0 8px 20px ${shadowColor}` }}>
                <div className="altitude-value" style={{ color }}>{Math.round(display).toLocaleString()} m</div>
            </div>
        </div>
    )
}