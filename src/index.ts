import { Hono } from "hono";

import { Routes } from "./routes";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const app = new Hono();

app.route("/api", Routes);

export default app;
