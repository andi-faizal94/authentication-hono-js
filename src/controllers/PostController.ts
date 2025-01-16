import { Context } from "hono";
import prisma from "../prisma/client";
import {
  responseSuccess,
  responseError,
  responseMessage,
} from "../utils/helper";

const authorization = (id: number, userId: any) => {
  if (id !== userId) {
    return true;
  }
  return false;
};

export const getPosts = async (c: Context) => {
  try {
    const posts = await prisma.post.findMany({ orderBy: { id: "desc" } });
    return c.json(responseSuccess(posts, "List Data Posts!"), 200);
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
      return c.json(responseError("Post with this title already exists."), 400);
    }

    const users = c.get("user");

    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
        userId: users?.id,
      },
    });

    return c.json(responseSuccess(post, "Post Created Successfully!"), 201);
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
      return c.json(responseError("Post Not Found!"), 404);
    }

    return c.json(
      responseSuccess(post, `Detail Data Post By ID : ${postId}`),
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
        responseError("Unauthorized: You can only edit your own posts."),
        403
      );
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title,
        content: content,
        updatedAt: new Date(),
      },
    });

    return c.json(responseSuccess(post, "Post Updated Successfully!"), 200);
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
        responseError("Unauthorized: You can only edit your own posts."),
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

    return c.json(responseSuccess(post, "Post Updated Successfully!"), 200);
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
        responseError("Unauthorized: You can only edit your own posts."),
        403
      );
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return c.json(responseMessage("Post Deleted Successfully!"), 200);
  } catch (e: unknown) {
    console.error(`Error deleting post: ${e}`);
  }
};
