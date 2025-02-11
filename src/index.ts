import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { Routes } from "./routes";
import rateLimit from "express-rate-limit";

const prisma = new PrismaClient();
const app = new Hono();

const rateLimiterUsingThirdParty = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 100,
  message: "You have exceeded the 100 requests in 24 hrs limit!",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("api", rateLimiterUsingThirdParty);

app.route("/api", Routes);

export default app;
