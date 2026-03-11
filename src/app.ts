import express from "express";
import { healthRouter } from "./routes/health.routes";
import { errorHandler } from "./common/middleware/error-handler";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use("/health", healthRouter);
  app.use(errorHandler);

  return app;
};
