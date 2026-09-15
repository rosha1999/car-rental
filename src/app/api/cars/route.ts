import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { carSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status   = searchParams.get("status") || undefined;
  const q        = searchParams.get("q") || "";
  const page     = parseInt(searchParams.get("page") || "1");
  const limit    = parseInt(searchParams.get("limit") || "20");
  const skip     = (page - 1) * limit;
  const where: Record<string, unknown> = { isDeleted: false };
  if (status) where.status = status;
  if (q) where.OR = [{ name: { contains: q } }, { make: { contains: q } }, { model: { contains: q } }, { plate: { contains: q } }];
  const [cars, total] = await Promise.all([
    prisma.car.findMany({ where, include: { images: { orderBy: { isPrimary: "desc" }, take: 1 } }, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.car.count({ where }),
  ]);
  return NextResponse.json({ cars, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const data = carSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
    const existing = await prisma.car.findFirst({ where: { plate: data.data.plate, isDeleted: false } });
    if (existing) return NextResponse.json({ error: "License plate already exists" }, { status: 409 });
    const car = await prisma.car.create({
      data: { ...data.data },
      include: { images: true },
    });
    await prisma.auditLog.create({ data: { userId: session.id, action: "CREATE", entity: "Car", entityId: car.id, description: `Added car ${car.name} (${car.plate})` } });
    return NextResponse.json({ car }, { status: 201 });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}