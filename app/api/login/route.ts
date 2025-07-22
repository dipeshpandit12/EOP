import { NextResponse } from "next/server";
import { findUserByEmail } from "@/models/user";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }
    const user = await findUserByEmail(email);
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    const token = jwt.sign({ email, userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    const res = NextResponse.json({ success: true });
    res.cookies.set("token", token, { httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
