import {useEffect, useRef, useState, useCallback} from 'react'
import '../style/Altitude.css'

const API_URL = '/altitude'
const POLL_MS = 500
const SMOOTHING_TAU = 0.12 // secondes

// Configurable range pour altitude (m)
const ALT_MIN = 0
const ALT_MAX = 3000
// Alarm thresholds (m)
const ALT_ALARM_INTERMITTENT_START = 100 // début de l'intermittence
const ALT_ALARM_CONTINUOUS_START = 50 // début du son continu

const ALARM_STORAGE_KEY = 'altitude.alarmEnabled'

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

    // Alarm enabled state (persisted)
    const [alarmEnabled, setAlarmEnabled] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem(ALARM_STORAGE_KEY)
            return v === null ? true : v === 'true'
        } catch {
            return true
        }
    })
    const alarmEnabledRef = useRef<boolean>(alarmEnabled)

    // Sync ref when alarmEnabled changes (avoid updating ref during render)
    useEffect(() => {
        alarmEnabledRef.current = alarmEnabled
    }, [alarmEnabled])

    // Audio alarm refs
    const audioCtxRef = useRef<AudioContext | null>(null)
    const oscRef = useRef<OscillatorNode | null>(null)
    const gainRef = useRef<GainNode | null>(null)
    const alarmOnRef = useRef<boolean>(false)
    // mode: 'off' | 'intermittent' | 'continuous'
    const alarmModeRef = useRef<'off' | 'intermittent' | 'continuous'>('off')
    const pulseTimerRef = useRef<number | null>(null)

    // Pulse configuration
    const MAX_INTERVAL_MS = 1000 // at 100m -> 1s between beeps
    const MIN_INTERVAL_MS = 0 // at 50m -> continuous
    const PULSE_DURATION_MS = 150 // how long each beep lasts

    // compute interval (ms) for a given altitude in [ALT_ALARM_CONTINUOUS_START, ALT_ALARM_INTERMITTENT_START]
    const intervalForAltitude = (alt: number) => {
        if (alt >= ALT_ALARM_INTERMITTENT_START) return MAX_INTERVAL_MS
        if (alt <= ALT_ALARM_CONTINUOUS_START) return MIN_INTERVAL_MS
        const ratio = (alt - ALT_ALARM_CONTINUOUS_START) / (ALT_ALARM_INTERMITTENT_START - ALT_ALARM_CONTINUOUS_START)
        return Math.round(ratio * MAX_INTERVAL_MS)
    }

    // ensure audio graph exists (oscillator + gain)
    const ensureAudio = useCallback(async () => {
        // respect alarmEnabledRef at call sites
        try {
            const globalWithAudio = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
            const AudioCtor = globalWithAudio.AudioContext ?? globalWithAudio.webkitAudioContext
            if (!AudioCtor) return null
            const ctx = audioCtxRef.current ?? new AudioCtor()
            audioCtxRef.current = ctx
            try { await ctx.resume() } catch (err) { console.debug('[Altitude] audio resume failed', err) }

            if (!oscRef.current) {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.value = 880
                // start with 0 gain
                gain.gain.value = 0
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start()
                oscRef.current = osc
                gainRef.current = gain
            }
            return ctx
        } catch (err) {
            console.warn('[Altitude] ensureAudio failed', err)
            return null
        }
    }, [])

    // perform a single pulse: raise gain briefly then lower
    const doPulse = useCallback(() => {
        const ctx = audioCtxRef.current
        const gain = gainRef.current
        if (!ctx || !gain) return
        const now = ctx.currentTime
        const vol = 0.06
        try {
            gain.gain.cancelScheduledValues(now)
            gain.gain.setValueAtTime(0, now)
            // ramp up quickly
            gain.gain.linearRampToValueAtTime(vol, now + 0.01)
            // hold for pulse duration
            gain.gain.setValueAtTime(vol, now + PULSE_DURATION_MS / 1000)
            // ramp down quickly
            gain.gain.linearRampToValueAtTime(0, now + PULSE_DURATION_MS / 1000 + 0.02)
        } catch (err) {
            console.debug('[Altitude] doPulse scheduling failed', err)
            // fallback naive set
            try { gain.gain.value = vol } catch (e) { console.debug('[Altitude] set gain fallback failed', e) }
            setTimeout(() => { try { gain.gain.value = 0 } catch (e) { console.debug('[Altitude] reset gain failed', e) } }, PULSE_DURATION_MS)
        }
    }, [])

    const enterContinuous = useCallback(async () => {
        if (!alarmEnabledRef.current) return
        const ctx = await ensureAudio()
        if (!ctx || !gainRef.current) return
        // cancel pulses
        if (pulseTimerRef.current) {
            clearTimeout(pulseTimerRef.current)
            pulseTimerRef.current = null
        }
        alarmModeRef.current = 'continuous'
        alarmOnRef.current = true
        try {
            const now = ctx.currentTime
            gainRef.current.gain.cancelScheduledValues(now)
            gainRef.current.gain.setValueAtTime(0.06, now)
        } catch (e) { console.debug('[Altitude] enterContinuous set gain failed', e) }
        console.debug('[Altitude] alarm continuous')
    }, [ensureAudio])

    const enterIntermittent = useCallback(async (intervalMs: number) => {
        if (!alarmEnabledRef.current) return
        const ctx = await ensureAudio()
        if (!ctx || !gainRef.current) return
        if (intervalMs <= PULSE_DURATION_MS) {
            // effectively continuous
            await enterContinuous()
            return
        }
        // stop any existing timer
        if (pulseTimerRef.current) {
            clearTimeout(pulseTimerRef.current)
            pulseTimerRef.current = null
        }
        alarmModeRef.current = 'intermittent'
        alarmOnRef.current = true

        const loopPulse = () => {
            // do a pulse now
            doPulse()
            // schedule next
            pulseTimerRef.current = window.setTimeout(() => {
                // if mode changed, bail
                if (alarmModeRef.current !== 'intermittent') return
                loopPulse()
            }, intervalMs)
        }

        loopPulse()
        console.debug('[Altitude] alarm intermittent interval=', intervalMs)
    }, [ensureAudio, doPulse, enterContinuous])

    // Helper: stopper l'alarme
    const stopAlarm = useCallback(() => {
         if (!alarmOnRef.current && alarmModeRef.current === 'off') return
         // clear pulse timer
         if (pulseTimerRef.current) {
             clearTimeout(pulseTimerRef.current)
             pulseTimerRef.current = null
         }
         alarmModeRef.current = 'off'
         alarmOnRef.current = false
         try {
             // stop oscillator and disconnect
             try { oscRef.current?.stop() } catch (e) { console.debug('[Altitude] osc stop failed', e) }
             try { oscRef.current?.disconnect() } catch (e) { console.debug('[Altitude] osc disconnect failed', e) }
             try { gainRef.current?.disconnect() } catch (e) { console.debug('[Altitude] gain disconnect failed', e) }
         } catch (e) { console.debug('[Altitude] stopAlarm outer failed', e) }
         oscRef.current = null
         gainRef.current = null
         // suspend audio context to save resources
         try { audioCtxRef.current?.suspend().catch((e) => { console.debug('[Altitude] suspend failed', e) }) } catch (e) { console.debug('[Altitude] suspend outer failed', e) }
         console.debug('[Altitude] alarm stopped')
    }, [])

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
                if (alarmEnabledRef.current && !gearRef.current && altitude < 100) {
                    // between 100 and 50 -> intermittent; below 50 -> continuous
                    if (altitude <= 50) {
                        // continuous
                        enterContinuous().catch(() => {})
                    } else {
                        // intermittent: interval scales from 1000ms (at 100m) down to 0ms at 50m
                        const interval = intervalForAltitude(altitude)
                        enterIntermittent(interval).catch(() => {})
                    }
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
    }, [enterContinuous, enterIntermittent, stopAlarm])

    // persist alarmEnabled to localStorage when it changes
    useEffect(() => {
        try {
            localStorage.setItem(ALARM_STORAGE_KEY, alarmEnabled ? 'true' : 'false')
        } catch {
            // ignore storage errors
        }
    }, [alarmEnabled])

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
    }, [stopAlarm])

    const color = valueToColor(display, ALT_MIN, ALT_MAX)

    // create a semi-transparent shadow color using modern HSL alpha syntax
    const shadowColor = color.replace(')', ' / 0.12)')

    // debug to console to help diagnose if the value is updating
    useEffect(() => {
        console.debug(`[Altitude] display=${display.toFixed(2)} color=${color}`)
    }, [display, color])

    const toggleAlarm = () => setAlarmEnabled((v) => !v)

    return (
        <div className="altitude-root">
            <div className="altitude-box" style={{ borderColor: color, boxShadow: `0 8px 20px ${shadowColor}` }}>
                <div className="altitude-value" style={{ color }}>{Math.round(display).toLocaleString()} m</div>

                {/* Small controls area: toggle alarm on/off */}
                <div className="altitude-controls">
                    <button
                        type="button"
                        className={`alarm-toggle ${alarmEnabled ? 'on' : 'off'}`}
                        aria-pressed={alarmEnabled}
                        onClick={toggleAlarm}
                    >
                        {alarmEnabled ? 'Alarme: activée' : 'Alarme: désactivée'}
                    </button>
                </div>

            </div>
        </div>
    )
}