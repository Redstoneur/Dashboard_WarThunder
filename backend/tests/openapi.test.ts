import { describe, expect, it } from "vitest";

import { buildOpenApiDocument } from "../src/docs/openapi.js";

describe("OpenAPI telemetry contract", () => {
    it("documents arbitrary upstream map types and the offline image media type", () => {
        const document = buildOpenApiDocument();
        const objects = document.paths["/api/v1/map_objects"].get.responses["200"].content["application/json"].schema;
        const image = document.paths["/api/v1/map_img"].get.responses["200"].content;

        expect(objects.items.properties.type).not.toHaveProperty("enum");
        expect(image).toHaveProperty("application/octet-stream");
    });
});
