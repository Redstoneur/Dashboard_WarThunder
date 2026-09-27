import { useCallback, useEffect, useRef } from "react";

const MAX_INTERVAL_MS = 1000; // au seuil "intermittent" -> 1 bip/seconde
const MIN_INTERVAL_MS = 0; // au seuil "continu" -> son continu
const PULSE_DURATION_MS = 150;

type AudioWindow = Window &
    typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
    };

/**
 * Alarme sonore de proximité sol (type GPWS simplifié): bips intermittents entre les seuils
 * "intermittent" et "continu", puis son continu en dessous, désactivée si le train est sorti.
 * Encapsule l'API Web Audio (gestion du cycle de vie du contexte/oscillateur).
 */
export function useAltitudeAlarm(params: {
    altitude: number;
    gearDeployed: boolean;
    enabled: boolean;
    intermittentStart: number;
    continuousStart: number;
}) {
    const { altitude, gearDeployed, enabled, intermittentStart, continuousStart } = params;

    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscRef = useRef<OscillatorNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const modeRef = useRef<"off" | "intermittent" | "continuous">("off");
    const pulseTimerRef = useRef<number | null>(null);

    const ensureAudio = useCallback(async () => {
        try {
            const win = window as AudioWindow;
            const AudioCtor = win.AudioContext ?? win.webkitAudioContext;
            if (!AudioCtor) return null;
            const ctx = audioCtxRef.current ?? new AudioCtor();
            audioCtxRef.current = ctx;
            await ctx.resume().catch(() => {});

            if (!oscRef.current) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.value = 880;
                gain.gain.value = 0;
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                oscRef.current = osc;
                gainRef.current = gain;
            }
            return ctx;
        } catch {
            return null;
        }
    }, []);

    const doPulse = useCallback(() => {
        const ctx = audioCtxRef.current;
        const gain = gainRef.current;
        if (!ctx || !gain) return;
        const now = ctx.currentTime;
        const vol = 0.06;
        try {
            gain.gain.cancelScheduledValues(now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(vol, now + 0.01);
            gain.gain.setValueAtTime(vol, now + PULSE_DURATION_MS / 1000);
            gain.gain.linearRampToValueAtTime(0, now + PULSE_DURATION_MS / 1000 + 0.02);
        } catch {
            gain.gain.value = vol;
            setTimeout(() => {
                gain.gain.value = 0;
            }, PULSE_DURATION_MS);
        }
    }, []);

    const stopAlarm = useCallback(() => {
        if (modeRef.current === "off") return;
        if (pulseTimerRef.current) {
            clearTimeout(pulseTimerRef.current);
            pulseTimerRef.current = null;
        }
        modeRef.current = "off";
        try {
            oscRef.current?.stop();
            oscRef.current?.disconnect();
            gainRef.current?.disconnect();
        } catch {
            // ignore
        }
        oscRef.current = null;
        gainRef.current = null;
        audioCtxRef.current?.suspend().catch(() => {});
    }, []);

    const enterContinuous = useCallback(async () => {
        const ctx = await ensureAudio();
        if (!ctx || !gainRef.current) return;
        if (pulseTimerRef.current) {
            clearTimeout(pulseTimerRef.current);
            pulseTimerRef.current = null;
        }
        modeRef.current = "continuous";
        const now = ctx.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.setValueAtTime(0.06, now);
    }, [ensureAudio]);

    const enterIntermittent = useCallback(
        async (intervalMs: number) => {
            if (intervalMs <= PULSE_DURATION_MS) {
                await enterContinuous();
                return;
            }
            const ctx = await ensureAudio();
            if (!ctx || !gainRef.current) return;
            if (pulseTimerRef.current) {
                clearTimeout(pulseTimerRef.current);
                pulseTimerRef.current = null;
            }
            modeRef.current = "intermittent";
            const loopPulse = () => {
                doPulse();
                pulseTimerRef.current = window.setTimeout(() => {
                    if (modeRef.current !== "intermittent") return;
                    loopPulse();
                }, intervalMs);
            };
            loopPulse();
        },
        [doPulse, ensureAudio, enterContinuous]
    );

    const intervalForAltitude = useCallback(
        (alt: number) => {
            if (alt >= intermittentStart) return MAX_INTERVAL_MS;
            if (alt <= continuousStart) return MIN_INTERVAL_MS;
            const ratio = (alt - continuousStart) / (intermittentStart - continuousStart);
            return Math.round(ratio * MAX_INTERVAL_MS);
        },
        [continuousStart, intermittentStart]
    );

    useEffect(() => {
        if (!enabled || gearDeployed || altitude >= intermittentStart) {
            stopAlarm();
            return;
        }
        if (altitude <= continuousStart) {
            enterContinuous().catch(() => {});
        } else {
            enterIntermittent(intervalForAltitude(altitude)).catch(() => {});
        }
    }, [altitude, continuousStart, enabled, enterContinuous, enterIntermittent, gearDeployed, intermittentStart, intervalForAltitude, stopAlarm]);

    useEffect(() => {
        return () => {
            stopAlarm();
            audioCtxRef.current?.close().catch(() => {});
            audioCtxRef.current = null;
        };
    }, [stopAlarm]);
}
