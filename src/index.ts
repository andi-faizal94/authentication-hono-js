import { PrismaClient } from "@prisma/client";
import { Context, Hono, Next } from "hono";
import { Routes } from "./routes";
import { rateLimiter } from "./utils/rateLimiter";

const app = new Hono();

app.use("*", async (c: Context, next: Next) => {
  const rateLimitResponse = rateLimiter(c);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  await next();
});

app.route("/api", Routes);

export default app;
