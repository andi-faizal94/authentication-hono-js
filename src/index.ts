import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { Routes } from "./routes";

const prisma = new PrismaClient();
const app = new Hono();

app.route("/api", Routes);

export default app;
