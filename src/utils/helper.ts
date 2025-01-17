import { Context } from "hono";

export const responseSuccess = (data: any, message: string = "OK") => {
  return {
    success: true,
    data,
    message,
  };
};

export const responseError = (message: string) => {
  return {
    success: false,
    message,
  };
};

export const responseMessage = (message: string = "OK") => {
  return {
    success: true,
    message,
  };
};

export const errorMessage = (message: string) => {
  return {
    success: false,
    message,
  };
};

export const messageSuccess = (token: any, message: string = "OK") => {
  return {
    success: true,
    token,
    message,
  };
};

export const jsonOk = (c: Context, message: string = "OK") => {
  return c.json(
    {
      message,
    },
    200
  );
};
export const jsonCreated = (c: Context, message: string = "OK") => {
  return c.json(
    {
      message,
    },
    201
  );
};
