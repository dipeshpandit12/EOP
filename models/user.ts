
import dotenv from "dotenv";
dotenv.config();
import mongoose, { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = models.User || model("User", userSchema);

export async function createUser({ email, password }: { email: string; password: string }) {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = new UserModel({ email, password });
  await user.save();
  return user._id;
}

export async function findUserByEmail(email: string) {
  await mongoose.connect(process.env.MONGODB_URI!);
  return UserModel.findOne({ email });
}

const userModel = {
  createUser,
  findUserByEmail,
};

export default userModel;
