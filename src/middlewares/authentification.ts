import { Context } from "hono";
import * as jwt from "jsonwebtoken";
const SECRET_KEY =
  process.env.SECRET_KEY ||
  "edc35b4f3a755ebe9d4c07f156b27f952a4b7d4309e234c403f26688eb041a2a72bd344cb9e4173d893df77746c9b3bdcafe877d814197c77366d7ed6887ffd7";

export const verifyToken = async (c: Context, next: () => Promise<void>) => {
  const authHeader = c.req.header("authorization");
  const token = authHeader ? authHeader.split(" ")[1] : undefined;
  if (!token) {
    return c.json(
      {
        message: "Access Denied: No token provided",
      },
      401
    );
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    c.set("user", decoded);
    await next();
  } catch (err) {
    return c.json(
      {
        message: "Invalid token",
      },
      403
    );
  }
};
