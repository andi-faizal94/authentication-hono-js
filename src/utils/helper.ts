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
