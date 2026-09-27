/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_POLL_STATUS_MS?: string;
    readonly VITE_POLL_SPEED_MS?: string;
    readonly VITE_POLL_ALTITUDE_MS?: string;
    readonly VITE_POLL_COMPASS_MS?: string;
    readonly VITE_POLL_GYROSCOPE_MS?: string;
    readonly VITE_POLL_MAP_MS?: string;
    readonly VITE_SPEED_MIN?: string;
    readonly VITE_SPEED_MAX?: string;
    readonly VITE_ALTITUDE_MIN?: string;
    readonly VITE_ALTITUDE_MAX?: string;
    readonly VITE_ALTITUDE_ALARM_INTERMITTENT_M?: string;
    readonly VITE_ALTITUDE_ALARM_CONTINUOUS_M?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
