import { Context } from "hono";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import prisma from "../../prisma/client";

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

const generateToken = (user: any) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: "1h",
  });
};

export const registerUser = async (c: Context) => {
  const { username, password } = await c.req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    return c.json(
      {
        success: true,
        message: "User registered successfully",
      },
      201
    );
  } catch (error) {
    return c.json(
      {
        message: "User already exists",
      },
      400
    );
  }
};

export const login = async (c: Context) => {
  const { username, password } = await c.req.json();

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json(
      {
        message: "Invalid credentials",
      },
      401
    );
  }

  const token = generateToken(user);
  return c.json({ token });
};

export const getPosts = async (c: Context) => {
  try {
    const posts = await prisma.post.findMany({ orderBy: { id: "desc" } });

    return c.json(
      {
        success: true,
        message: "List Data Posts!",
        data: posts,
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error getting posts: ${e}`);
  }
};
