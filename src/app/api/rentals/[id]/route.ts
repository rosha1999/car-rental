import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rental = await prisma.rental.findUnique({
    where: { id },
    include: {
      car: { include: { images: true } },
      customer: true,
      payments: { orderBy: { paymentDate: "asc" } },
    },
  });
  if (!rental) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ rental });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await request.json();
    const rental = await prisma.rental.update({ where: { id }, data: body, include: { car: true, customer: true, payments: true } });
    await prisma.auditLog.create({ data: { userId: session.id, action: "UPDATE", entity: "Rental", entityId: id, description: `Updated rental ${rental.rentalNumber}` } });
    return NextResponse.json({ rental });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rental = await prisma.rental.findUnique({ where: { id } });
  if (!rental) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (rental.status === "COMPLETED") return NextResponse.json({ error: "Cannot delete completed rental" }, { status: 409 });
  await prisma.$transaction(async (tx) => {
    await tx.rental.update({ where: { id }, data: { status: "CANCELLED" } });
    await tx.car.update({ where: { id: rental.carId }, data: { status: "AVAILABLE" } });
    await tx.auditLog.create({ data: { userId: session.id, action: "CANCEL", entity: "Rental", entityId: id, description: `Cancelled rental ${rental.rentalNumber}` } });
  });
  return NextResponse.json({ ok: true });
}