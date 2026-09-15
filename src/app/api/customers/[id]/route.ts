import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { customerSchema } from "@/lib/validations";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      rentals: {
        include: { car: { select: { name: true, plate: true } }, payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await request.json();
    const data = customerSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
    const customer = await prisma.customer.update({ where: { id }, data: { ...data.data, licenseExpiry: data.data.licenseExpiry ? new Date(data.data.licenseExpiry) : null } });
    await prisma.auditLog.create({ data: { userId: session.id, action: "UPDATE", entity: "Customer", entityId: id, description: `Updated customer ${customer.fullName}` } });
    return NextResponse.json({ customer });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const active = await prisma.rental.count({ where: { customerId: id, status: { in: ["ACTIVE", "OVERDUE", "RESERVED"] } } });
  if (active > 0) return NextResponse.json({ error: "Cannot delete: customer has active rentals" }, { status: 409 });
  await prisma.customer.update({ where: { id }, data: { isArchived: true } });
  await prisma.auditLog.create({ data: { userId: session.id, action: "ARCHIVE", entity: "Customer", entityId: id, description: "Archived customer" } });
  return NextResponse.json({ ok: true });
}