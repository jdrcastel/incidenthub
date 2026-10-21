import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("GET /api/ping", () => {
  it("answers pong", async () => {
    const res = await request(createApp()).get("/api/ping");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("pong");
  });
});

describe("unknown routes", () => {
  it("return a JSON 404", async () => {
    const res = await request(createApp()).get("/nope");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not Found");
  });
});
