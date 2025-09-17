import { config } from "dotenv";

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorMiddleware = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  if (config.nodeEnv !== "production") {
    console.error("[Error]: ", err);
  }
  res.status(status).json({
    success: false,
    status,
    message,
  });
};
