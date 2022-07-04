import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, default: new mongoose.Types.ObjectId() },
    oid: {
      type: Schema.Types.ObjectId,
      required: true,
      default: new mongoose.Types.ObjectId(),
    },
    email: {
      type: Schema.Types.String,
      index: true,
      required: true,
      unique: true,
    },
    first_name: { type: Schema.Types.String, required: true },
    middle_name: { type: Schema.Types.String, required: true },
    last_name: { type: Schema.Types.String, required: true },
    verify_email_token: { type: Schema.Types.String },
    verify_email_token_expiry: { type: Schema.Types.Date },
    activation_token: { type: Schema.Types.String },
    activation_token_expiry: { type: Schema.Types.Date },
    status: {
      type: Schema.Types.String,
      required: true,
      default: "unverified",
    },
    date_status_changed: { type: Schema.Types.String },
    password_reset_token: { type: Schema.Types.String },
    password_reset_expiry: { type: Schema.Types.Date },
    password_salt: { type: Schema.Types.String },
    password_hash: { type: Schema.Types.String },
    password_algo: { type: Schema.Types.String },
    token: { type: String },
  },
  { timestamps: true, versionKey: false }
);

const User = new model("User", userSchema);

export default User;
