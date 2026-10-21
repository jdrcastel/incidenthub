import express, { type ErrorRequestHandler } from "express";
import { pingRouter } from "./routes/ping.js";
import { healthRouter } from "./routes/health.js";

// Builds the Express app without starting the server, so tests can use it.
export function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/api/ping", pingRouter);
  app.use("/health", healthRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not Found", path: req.path });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  };
  app.use(errorHandler);

  return app;
}
