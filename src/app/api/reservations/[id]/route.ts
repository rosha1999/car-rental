import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const r = await prisma.reservation.findUnique({ where: { id }, include: { car: true, customer: true } });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ reservation: r });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const reservation = await prisma.$transaction(async (tx) => {
    const r = await tx.reservation.update({ where: { id }, data: body, include: { car: true, customer: true } });
    if (body.status === "CANCELLED") {
      const other = await tx.reservation.findFirst({ where: { carId: r.carId, status: { in: ["PENDING","CONFIRMED"] }, NOT: { id } } });
      const rental = await tx.rental.findFirst({ where: { carId: r.carId, status: { in: ["ACTIVE","OVERDUE"] } } });
      if (!other && !rental) await tx.car.update({ where: { id: r.carId }, data: { status: "AVAILABLE" } });
    }
    await tx.auditLog.create({ data: { userId: session.id, action: "UPDATE", entity: "Reservation", entityId: id, description: `Updated reservation status to ${body.status ?? "modified"}` } });
    return r;
  });
  return NextResponse.json({ reservation });
}