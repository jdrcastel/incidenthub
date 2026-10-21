import { Router } from "express";
import { prisma } from "../db/prisma.js";

// Reports whether the API can reach PostgreSQL.
export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "UP", database: "UP" });
  } catch {
    res.status(503).json({ status: "DOWN", database: "DOWN" });
  }
});
