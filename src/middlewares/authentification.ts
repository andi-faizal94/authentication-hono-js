import { Context } from "hono";
import * as jwt from "jsonwebtoken";
import { errorMessage } from "../utils/helper";

const SECRET_KEY = process.env.SECRET_KEY!;

export const verifyToken = async (c: Context, next: () => Promise<void>) => {
  const authHeader = c.req.header("authorization");
  const token = authHeader ? authHeader.split(" ")[1] : undefined;
  if (!token) {
    return c.json(errorMessage("Access Denied: No token provided"), 401);
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    c.set("user", decoded);
    await next();
  } catch (err) {
    return c.json(errorMessage("Invalid token"), 403);
  }
};
