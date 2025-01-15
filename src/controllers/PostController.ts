import { Context } from "hono";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import prisma from "../../prisma/client";
import { secretKey } from "../helper";
const SECRET_KEY = process.env.SECRET_KEY || secretKey;

const authorization = (id: number, userId: any) => {
  if (id !== userId) {
    return true;
  }
  return false;
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

export const createPost = async (c: Context) => {
  try {
    const { title, content } = await c.req.json();
    const existingPost = await prisma.post.findMany({
      where: { title: title },
    });

    if (existingPost.length > 0) {
      return c.json(
        {
          success: false,
          message: "Post with this title already exists.",
        },
        400
      );
    }

    const users = c.get("user");

    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
        userId: users?.id,
      },
    });

    return c.json(
      {
        success: true,
        message: "Post Created Successfully!",
        data: post,
      },
      201
    );
  } catch (e: unknown) {
    console.error(`Error creating post: ${e}`);
  }
};

export const getPostById = async (c: Context) => {
  try {
    const postId = parseInt(c.req.param("id"));

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return c.json(
        {
          success: false,
          message: "Post Not Found!",
        },
        404
      );
    }

    return c.json(
      {
        success: true,
        message: `Detail Data Post By ID : ${postId}`,
        data: post,
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error finding post: ${e}`);
  }
};
export const updatePost = async (c: Context) => {
  try {
    const postId = parseInt(c.req.param("id"));
    const { title, content } = await c.req.json();

    const postById = await prisma.post.findUnique({
      where: { id: postId },
    });

    const users = c.get("user");

    if (authorization(users?.id, postById?.id)) {
      return c.json(
        {
          success: false,
          message: "Unauthorized: You can only edit your own posts.",
        },
        403
      );
    }
    // if (postById?.id !== users?.id) {
    //   return c.json(
    //     {
    //       success: false,
    //       message: "Unauthorized: You can only edit your own posts.",
    //     },
    //     403
    //   );
    // }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title,
        content: content,
        updatedAt: new Date(),
      },
    });

    return c.json(
      {
        success: true,
        message: "Post Updated Successfully!",
        data: post,
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error updating post: ${e}`);
  }
};

export const editPost = async (c: Context) => {
  try {
    const postId = parseInt(c.req.param("id"));
    const { title, content } = await c.req.json();

    const users = c.get("user");

    const postById = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (authorization(users?.id, postById?.id)) {
      return c.json(
        {
          success: false,
          message: "Unauthorized: You can only edit your own posts.",
        },
        403
      );
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title,
        content: content,
        updatedAt: new Date(),
        userId: users?.id,
      },
    });

    return c.json(
      {
        success: true,
        message: "Post Updated Successfully!",
        data: post,
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error updating post: ${e}`);
  }
};

export const deletePost = async (c: Context) => {
  try {
    const postId = parseInt(c.req.param("id"));

    const postById = await prisma.post.findUnique({
      where: { id: postId },
    });

    const users = c.get("user");

    if (authorization(users?.id, postById?.id)) {
      return c.json(
        {
          success: false,
          message: "Unauthorized: You can only edit your own posts.",
        },
        403
      );
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return c.json(
      {
        success: true,
        message: "Post Deleted Successfully!",
      },
      200
    );
  } catch (e: unknown) {
    console.error(`Error deleting post: ${e}`);
  }
};
