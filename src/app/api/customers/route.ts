import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { customerSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const includeArchived = searchParams.get("archived") === "true";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (!includeArchived) where.isArchived = false;
  if (q) where.OR = [{ fullName: { contains: q } }, { phone: { contains: q } }, { licenseNumber: { contains: q } }];
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, include: { _count: { select: { rentals: true } } }, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.customer.count({ where }),
  ]);
  return NextResponse.json({ customers, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const data = customerSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
    const customer = await prisma.customer.create({ data: { ...data.data, licenseExpiry: data.data.licenseExpiry ? new Date(data.data.licenseExpiry) : null } });
    await prisma.auditLog.create({ data: { userId: session.id, action: "CREATE", entity: "Customer", entityId: customer.id, description: `Added customer ${customer.fullName}` } });
    return NextResponse.json({ customer }, { status: 201 });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}