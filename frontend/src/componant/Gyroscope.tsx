import { useEffect, useRef, useState } from 'react'
import '../style/Gyroscope.css'

type GyroData = {
  pitch: number
  roll: number
  yaw: number
  turn: number
}

// Utiliser un chemin relatif permet d'utiliser le proxy Vite (vite.config.ts)
const API_URL = '/gyroscope'
const POLL_MS = 100 // intervalle de polling par défaut
const PITCH_TO_PX = 1.2 // facteur pour convertir degrés de tangage en translation px
const SMOOTHING_TAU = 0.08 // constante de lissage (en secondes)

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

// calcule la plus petite différence angulaire en degrés (a -> b)
function shortestAngleDiff(a: number, b: number) {
  return ((b - a + 180) % 360) - 180
}

export function Gyroscope() {
  const targetRef = useRef<GyroData>({ pitch: 0, roll: 0, yaw: 0, turn: 0 })
  const displayRef = useRef<GyroData>({ pitch: 0, roll: 0, yaw: 0, turn: 0 })
  const [display, setDisplay] = useState<GyroData>({ pitch: 0, roll: 0, yaw: 0, turn: 0 })

  // Polling fetch
  useEffect(() => {
    let mounted = true
    const getOnce = async () => {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) return
        const data = (await res.json()) as GyroData
        // keep angles in degrees; normalize yaw to [0,360)
        if (!mounted) return
        const rawYaw = Number(data.yaw)
        const yaw = Number.isFinite(rawYaw) ? ((rawYaw % 360) + 360) % 360 : 0
        targetRef.current = {
          pitch: Number(data.pitch) || 0,
          roll: Number(data.roll) || 0,
          yaw,
          turn: Number(data.turn) || 0,
        }
      } catch {
        // ignore errors silently for now; we keep previous target
      }
    }

    getOnce()
    const id = setInterval(getOnce, POLL_MS)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  // Animation loop pour interpolation fluide
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = (now - last) / 1000 // secondes
      last = now
      const alpha = 1 - Math.exp(-dt / SMOOTHING_TAU)

      const t = targetRef.current
      const d = displayRef.current

      // pitch: simple lerp
      d.pitch += (t.pitch - d.pitch) * clamp(alpha, 0, 1)

      // roll: simple lerp
      d.roll += (t.roll - d.roll) * clamp(alpha, 0, 1)

      // yaw: gérer wrap-around en utilisant la plus courte distance
      const yawDiff = shortestAngleDiff(d.yaw, t.yaw)
      d.yaw = (d.yaw + yawDiff * clamp(alpha, 0, 1) + 360) % 360

      // turn (rate) : lerp
      d.turn += (t.turn - d.turn) * clamp(alpha, 0, 1)

      // met à jour l'état utilisé dans le rendu (copie pour garantir immutabilité)
      setDisplay({ pitch: d.pitch, roll: d.roll, yaw: d.yaw, turn: d.turn })

      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const d = display

  // Transformations visuelles : roll -> rotation, pitch -> translateY
  const roll = d.roll
  const pitchPx = d.pitch * PITCH_TO_PX

  return (
    <div className="gyro-root">
      <div className="gyro-face" role="img" aria-label={`Gyroscope: pitch ${d.pitch.toFixed(2)}°, roll ${d.roll.toFixed(2)}°`}>
        <div
          className="gyro-horizon"
          style={{ transform: `rotate(${roll}deg) translateY(${pitchPx}px)` }}
        />

        <div className="gyro-overlay">
          <div className="gyro-crossh"></div>
          <div className="gyro-crossv"></div>
          <div className="gyro-center" />
        </div>
      </div>

      <div className="gyro-readouts">
        <div className="gyro-row">Pitch: <strong>{d.pitch.toFixed(3)}°</strong></div>
        <div className="gyro-row">Roll: <strong>{d.roll.toFixed(3)}°</strong></div>
        <div className="gyro-row">Yaw: <strong>{d.yaw.toFixed(3)}°</strong></div>
        <div className="gyro-row">Turn: <strong>{d.turn.toFixed(3)}°/s</strong></div>
      </div>
    </div>
  )
}

export default Gyroscope
