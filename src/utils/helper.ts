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
