import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "telegram-hr-bot",
    timestamp: new Date().toISOString()
  });
});
