import {useEffect, useState} from 'react'
import '../style/Map.css'

type MapInfo = {
    grid_size: [number, number]
    grid_steps: [number, number]
    grid_zero: [number, number]
    hud_type?: number
    map_generation?: number
    map_max?: [number, number]
    map_min?: [number, number]
    valid?: boolean
}

type MapObject = {
    type: string
    color?: string
    blink?: number
    icon?: string
    icon_bg?: string
    // position normalized [0..1]
    x?: number
    y?: number
    dx?: number
    dy?: number
    sx?: number
    sy?: number
    ex?: number
    ey?: number
}

const INFO_URL = '/map_info'
const OBJECTS_URL = '/map_objects'
const IMG_URL = '/map_img'
const POLL_MS = 400

export default function Map() {
    const [info, setInfo] = useState<MapInfo | null>(null)
    const [objects, setObjects] = useState<MapObject[]>([])
    const [imgUrl, setImgUrl] = useState<string | null>(null)

    // fetch map info once
    useEffect(() => {
        let mounted = true
        const fetchInfo = async () => {
            try {
                const res = await fetch(INFO_URL)
                if (!res.ok) {
                    console.debug(`[Map] HTTP ${res.status} fetching map_info`)
                    return
                }
                const json = await res.json()
                if (mounted) setInfo(json as MapInfo)
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                console.warn(`[Map] fetch info error: ${msg}`)
            }
        }
        fetchInfo()
        return () => {
            mounted = false
        }
    }, [])

    // fetch map image: try blob then base64 fallback via data URL
    useEffect(() => {
        let mounted = true
        let objectUrl: string | null = null
        const fetchImg = async () => {
            try {
                const res = await fetch(IMG_URL)
                if (!res.ok) {
                    // try as_base64
                    const fallback = await fetch(`${IMG_URL}?as_base64=true`)
                    if (!fallback.ok) {
                        console.debug(`[Map] HTTP ${res.status} fetching map_img`)
                        return
                    }
                    const j = await fallback.json()
                    const content = j?.content
                    const contentType = j?.content_type || 'image/png'
                    if (content) {
                        // use data URL -> fetch -> blob to avoid manual decoding
                        const dataUrl = `data:${contentType};base64,${content}`
                        const bres = await fetch(dataUrl)
                        const blob = await bres.blob()
                        objectUrl = URL.createObjectURL(blob)
                        if (mounted) setImgUrl(objectUrl)
                    }
                    return
                }
                const blob = await res.blob()
                objectUrl = URL.createObjectURL(blob)
                if (mounted) setImgUrl(objectUrl)
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                console.warn(`[Map] fetch image error: ${msg}`)
            }
        }
        fetchImg()
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl)
            mounted = false
        }
    }, [])

    // poll objects
    useEffect(() => {
        let mounted = true
        const fetchObjects = async () => {
            try {
                const res = await fetch(OBJECTS_URL)
                if (!res.ok) return
                const json = await res.json()
                if (mounted) setObjects(json as MapObject[])
            } catch {
                // ignore
            }
        }

        let stopped = false
        const loop = async () => {
            while (!stopped) {
                await fetchObjects()
                await new Promise((r) => setTimeout(r, POLL_MS))
            }
        }

        loop()
        return () => {
            mounted = false;
            stopped = true
        }
    }, [])

    return (
        <div className="map-root">
            <div className="map-header">
                <div>Map</div>
                {info && <div className="map-info">{info.valid ? 'valid' : 'invalid'}</div>}
            </div>

            <div className="map-container">
                {imgUrl ? (
                    <img src={imgUrl} alt="map" className="map-image"/>
                ) : (
                    <div className="map-placeholder">No map image</div>
                )}

                <div className="map-overlay">
                    {objects.map((o, i) => {
                        // objects with x/y -> use percentages to avoid measuring DOM
                        if (o.x != null && o.y != null) {
                            const leftPct = (o.x * 100).toFixed(4) + '%'
                            const topPct = ((1 - o.y) * 100).toFixed(4) + '%'
                            const style: React.CSSProperties = {
                                left: leftPct,
                                top: topPct,
                                background: o.color || '#ff0'
                            }
                            return (
                                <div key={i} className={`map-marker type-${o.type}`} style={style} title={o.type}/>
                            )
                        }

                        // objects with sx/sy/ex/ey => draw rect using percentages
                        if (o.sx != null && o.sy != null && o.ex != null && o.ey != null) {
                            const left = Math.min(o.sx, o.ex)
                            const right = Math.max(o.sx, o.ex)
                            const top = Math.min(o.sy, o.ey)
                            const bottom = Math.max(o.sy, o.ey)
                            const leftPct = (left * 100).toFixed(4) + '%'
                            const topPct = ((1 - bottom) * 100).toFixed(4) + '%'
                            const widthPct = ((right - left) * 100).toFixed(4) + '%'
                            const heightPct = ((bottom - top) * 100).toFixed(4) + '%'
                            const style: React.CSSProperties = {
                                left: leftPct,
                                top: topPct,
                                width: widthPct,
                                height: heightPct,
                                border: `2px solid ${o.color || '#0f0'}`
                            }
                            return (
                                <div key={i} className={`map-rect type-${o.type}`} style={style} title={o.type}/>
                            )
                        }

                        return null
                    })}
                </div>
            </div>

            <div className="map-legend">
                <div className="legend-item"><span className="legend-dot friend"/> Friendly</div>
                <div className="legend-item"><span className="legend-dot enemy"/> Enemy</div>
            </div>
        </div>
    )
}
