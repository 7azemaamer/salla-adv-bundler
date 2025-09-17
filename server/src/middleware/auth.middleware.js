import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { asyncWrapper, AppError } from "../utils/errorHandler.js";

export const authenticateToken = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    throw new AppError("Access token required", 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
});
