import mongoose from "mongoose";
import { config } from "../config/env.js";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  console.log(config.mongoUri);
  try {
    await mongoose.connect(config.mongoUri);
    console.log("[Database]: Mongoose is connected");
  } catch (err) {
    console.log("[Database]: Error connecting mongoose", err);
  }
};

export default connectDB;
