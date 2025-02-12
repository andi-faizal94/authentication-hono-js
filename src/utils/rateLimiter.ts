import { Context } from "hono";
import { getConnInfo } from "hono/bun";

const rateLimitWindowMs = 60 * 1000;
const maxRequests = 5;
const requestLog: Record<string, { count: number; startTime: number }> = {};

export function rateLimiter(c: Context) {
  const info = getConnInfo(c);

  const ip = info.remote.address || "unknown";
  const currentTime = Date.now();

  if (!requestLog[ip]) {
    requestLog[ip] = { count: 1, startTime: currentTime };
  } else {
    const elapsedTime = currentTime - requestLog[ip].startTime;

    if (elapsedTime > rateLimitWindowMs) {
      requestLog[ip] = { count: 1, startTime: currentTime };
    } else {
      requestLog[ip].count++;
    }
  }

  if (requestLog[ip].count > maxRequests) {
    return c.json({ message: "Too many requests, slow down!" }, 429);
  }
  return;
}
