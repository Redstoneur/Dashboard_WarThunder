/**
 * Erreur levée lorsque le serveur War Thunder (upstream) est injoignable ou renvoie une erreur.
 * Traduite en HTTP 502 par le middleware d'erreurs, sauf si le mode "fallback" est activé.
 */
export class UpstreamUnavailableError extends Error {
    public override readonly cause?: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = "UpstreamUnavailableError";
        this.cause = cause;
    }
}

/** Erreur HTTP générique avec code de statut, utilisée par le middleware d'erreurs. */
export class HttpError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
    }
}
