import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { settingSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.setting.findMany();
  const obj: Record<string,string> = {};
  settings.forEach(s => { obj[s.key] = s.value; });
  return NextResponse.json({ settings: obj });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = settingSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
  const entries = Object.entries(data.data).filter(([,v]) => v !== undefined) as [string,string][];
  await Promise.all(entries.map(([key,value]) =>
    prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } })
  ));
  await prisma.auditLog.create({ data: { userId: session.id, action: "UPDATE", entity: "Settings", description: "Settings updated" } });
  return NextResponse.json({ ok: true });
}