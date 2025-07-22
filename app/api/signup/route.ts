
import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/models/user";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "User already exists." }, { status: 409 });
    }
    await createUser({ email, password });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Signup failed." }, { status: 500 });
  }
}
