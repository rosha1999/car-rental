import { NextRequest, NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const user = await authenticate(data.data.email, data.data.password);
    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    await createSession(user);
    return NextResponse.json({ user, ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}