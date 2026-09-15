import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { carSchema } from "@/lib/validations";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      images: { orderBy: { isPrimary: "desc" } },
      rentals: { include: { customer: { select: { fullName: true, phone: true } }, payments: true }, orderBy: { createdAt: "desc" } },
      maintenances: { orderBy: { startDate: "desc" } },
    },
  });
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ car });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await request.json();
    const data = carSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
    const dupPlate = await prisma.car.findFirst({ where: { plate: data.data.plate, isDeleted: false, NOT: { id } } });
    if (dupPlate) return NextResponse.json({ error: "License plate already used" }, { status: 409 });
    const car = await prisma.car.update({ where: { id }, data: { ...data.data }, include: { images: true } });
    await prisma.auditLog.create({ data: { userId: session.id, action: "UPDATE", entity: "Car", entityId: id, description: `Updated car ${car.name}` } });
    return NextResponse.json({ car });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const activeRentals = await prisma.rental.count({ where: { carId: id, status: { in: ["ACTIVE","RESERVED","OVERDUE"] } } });
  if (activeRentals > 0) return NextResponse.json({ error: "Cannot delete: car has active rentals" }, { status: 409 });
  const hasHistory = await prisma.rental.count({ where: { carId: id } });
  if (hasHistory > 0) {
    await prisma.car.update({ where: { id }, data: { isDeleted: true, status: "INACTIVE" } });
  } else {
    await prisma.car.delete({ where: { id } });
  }
  await prisma.auditLog.create({ data: { userId: session.id, action: "DELETE", entity: "Car", entityId: id, description: `Deleted/archived car` } });
  return NextResponse.json({ ok: true });
}