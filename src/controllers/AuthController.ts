import { Context } from "hono";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
import { secretKey } from "../helpers";
import validator from "validator";
const SECRET_KEY = process.env.SECRET_KEY || secretKey;

const generateToken = (user: any) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: "1h",
  });
};
export const registerUser = async (c: Context) => {
  const { username, password, email } = await c.req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
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
  const { usernameOrEmail, password } = await c.req.json();

  let user;

  const isEmail = validator.isEmail(usernameOrEmail);

  try {
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: usernameOrEmail },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: usernameOrEmail },
      });
    }

    if (!user) {
      return c.json(
        {
          message: "Invalid username or password",
        },
        401
      );
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return c.json(
        {
          message: "Invalid username or password",
        },
        401
      );
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return c.json(
        {
          message: "Invalid credentials",
        },
        401
      );
    }

    const token = generateToken(user);
    return c.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    c.json({ error: "Database error" });
  }
};
