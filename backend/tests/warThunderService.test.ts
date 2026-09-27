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

    it("preserves naval and unknown map object types from the game", async () => {
        vi.spyOn(axios, "get").mockResolvedValue({
            data: [
                { type: "sea_model", icon: "Destroyer", x: 0.2, y: 0.3 },
                { type: "new_vehicle", icon: "NewIcon", x: 0.5, y: 0.6 }
            ]
        });

        const objects = await warThunderService.getMapObjects();

        expect(objects.map(({ type, icon }) => ({ type, icon }))).toEqual([
            { type: "sea_model", icon: "Destroyer" },
            { type: "new_vehicle", icon: "NewIcon" }
        ]);
    });

    it("getStatus reports upstream as unreachable", async () => {
        vi.spyOn(axios, "get").mockRejectedValue(new Error("ECONNREFUSED"));

        const status = await warThunderService.getStatus();

        expect(status.status).toBe("ok");
        expect(status.upstream.reachable).toBe(false);
    });
});
