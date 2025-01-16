import { Context } from "hono";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import validator from "validator";
import * as nodemailer from "nodemailer";
import * as crypto from "crypto";

import { errorMessage, messageSuccess, responseMessage } from "../utils/helper";
const SECRET_KEY = process.env.SECRET_KEY!;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
    return c.json(responseMessage("User registered successfully"), 201);
  } catch (error) {
    return c.json(errorMessage("User already exists"), 400);
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
      return c.json(errorMessage("Invalid username or password"), 401);
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return c.json(errorMessage("Invalid username or password"), 401);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return c.json(errorMessage("Invalid credentials"), 401);
    }

    const token = generateToken(user);
    return c.json(messageSuccess(token, "Login successful"));
  } catch (error) {
    console.error(error);
    c.json(errorMessage("Database error"));
  }
};

export const forgotPassword = async (c: Context) => {
  const { email } = await c.req.json();

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    console.log({ user });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const existingTokens = await prisma.passwordResetToken.findMany({
      where: { userId: user.id },
    });
    const expiredTokens = existingTokens.filter(
      (token) => token.expiresAt > new Date()
    );

    if (expiredTokens.length > 0) {
      return c.json(
        {
          message:
            "A reset link has already been sent, please check your email.",
        },
        400
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the following link to reset your password: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    return c.json({ message: "Reset email sent" });
  } catch (error) {
    console.log("error", error);
  }
};

export const verifyPasswordResetToken = async (token: string) => {
  const passwordResetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!passwordResetToken) {
    throw new Error("Invalid or expired password reset token");
  }

  if (new Date(passwordResetToken.expiresAt) < new Date()) {
    throw new Error("Password reset token has expired");
  }

  return passwordResetToken.user;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await verifyPasswordResetToken(token);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    },
  });

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  return { message: "Password has been reset successfully." };
};

export const passwordReset = async (c: Context) => {
  const { token, newPassword } = await c.req.json();

  if (!token || !newPassword) {
    return c.json({ error: "Token and new password are required." }, 400);
  }

  try {
    const response = await resetPassword(token, newPassword);
    return c.json(response);
  } catch (error) {
    return c.json({ error: error }, 400);
  }
};
