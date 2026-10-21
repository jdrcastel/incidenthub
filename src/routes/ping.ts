import { Router } from "express";

// Smallest possible endpoint: proves the request -> JSON round trip.
export const pingRouter = Router();

pingRouter.get("/", (_req, res) => {
  res.json({ message: "pong", time: new Date().toISOString() });
});
