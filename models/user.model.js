import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, index: true },
    name: { type: String, index: true },
    email: { type: String, index: true },
    password: { type: String },
    token: { type: String },
    expTime: { type: Number },
    isActive: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false }
);

const User = new model("User", userSchema);

export default User;
