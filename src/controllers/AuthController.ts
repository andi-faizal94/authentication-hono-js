import { Context } from "hono";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
import { secretKey } from "../helper";
const SECRET_KEY = process.env.SECRET_KEY || secretKey;

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
