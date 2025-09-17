import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    store_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    domain: String,
    scope: String,
    avatar: String,
    description: String,
    plan: {
      type: String,
      enum: ["basic", "pro", "enterprise", "special"],
      default: "basic",
    },
    refresh_token: { type: String },
    access_token: {
      type: String,
      required: true,
    },
    access_token_expires_at: { type: Date },
    installed_at: {
      type: Date,
      default: Date.now,
    },
    json_path: {
      type: String,
    },
  },
  { timestamps: true }
);


const Store = mongoose.model("Store", StoreSchema);
export default Store;
