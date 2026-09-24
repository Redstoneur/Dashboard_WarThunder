import axios, { type AxiosResponse } from "axios";

import { config, warThunderEndpoints } from "../config/env.js";
import { UpstreamUnavailableError } from "../utils/errors.js";

/**
 * Récupère du JSON depuis le serveur War Thunder upstream.
 *
 * @throws {UpstreamUnavailableError} si l'hôte est injoignable ou renvoie une erreur HTTP.
 */
export async function fetchJson<T>(url: string, timeoutMs: number = config.warThunderTimeoutMs): Promise<T> {
    try {
        const response: AxiosResponse<T> = await axios.get<T>(url, { timeout: timeoutMs });
        return response.data;
    } catch (error) {
        throw new UpstreamUnavailableError(`Upstream service unreachable: ${describeError(error)}`, error);
    }
}

/**
 * Récupère un contenu binaire (image de carte) depuis le serveur War Thunder upstream.
 *
 * @throws {UpstreamUnavailableError} si l'hôte est injoignable ou renvoie une erreur HTTP.
 */
export async function fetchBinary(
    url: string,
    timeoutMs: number = config.warThunderImgTimeoutMs
): Promise<{ data: Buffer; contentType: string }> {
    try {
        const response = await axios.get<ArrayBuffer>(url, {
            timeout: timeoutMs,
            responseType: "arraybuffer"
        });
        const contentType = (response.headers["content-type"] as string | undefined) ?? "application/octet-stream";
        return { data: Buffer.from(response.data), contentType };
    } catch (error) {
        throw new UpstreamUnavailableError(`Upstream service unreachable: ${describeError(error)}`, error);
    }
}

function describeError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.code ?? error.message;
    }
    return error instanceof Error ? error.message : String(error);
}

export { warThunderEndpoints };
