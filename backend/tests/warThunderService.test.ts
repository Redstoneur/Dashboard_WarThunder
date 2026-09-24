import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as warThunderService from "../src/services/warThunderService.js";

/**
 * Le serveur War Thunder d'origine (la machine sur laquelle le jeu tourne) n'est pas
 * disponible dans cet environnement de test. Ces tests se limitent donc à vérifier le
 * comportement de fallback (upstream injoignable) et pourront être approfondis avec de
 * vrais appels d'intégration plus tard.
 */
describe("warThunderService fallback behaviour", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("getIndicators returns default (invalid) data when upstream is unreachable", async () => {
        vi.spyOn(axios, "get").mockRejectedValue(new Error("ECONNREFUSED"));

        const result = await warThunderService.getIndicators();

        expect(result.valid).toBe(false);
    });

    it("getSpeed returns 0 when upstream is unreachable", async () => {
        vi.spyOn(axios, "get").mockRejectedValue(new Error("ECONNREFUSED"));

        const result = await warThunderService.getSpeed();

        expect(result).toBe(0);
    });

    it("getStatus reports upstream as unreachable", async () => {
        vi.spyOn(axios, "get").mockRejectedValue(new Error("ECONNREFUSED"));

        const status = await warThunderService.getStatus();

        expect(status.status).toBe("ok");
        expect(status.upstream.reachable).toBe(false);
    });
});
