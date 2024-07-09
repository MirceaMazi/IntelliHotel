import mongoose from "mongoose";

export const userRoles = {
  Admin: "Admin",
  Maid: "Personal menajer",
  Client: "Client",
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please input username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please input email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please input password"],
    },
    role: {
      type: String,
      enum: Object.values(userRoles),
      required: [true, "Is the user an admin?(true/false)"],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
