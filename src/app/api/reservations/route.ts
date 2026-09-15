import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { reservationSchema } from "@/lib/validations";
import { checkCarAvailability } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page-1)*limit;
  const where: Record<string,unknown> = {};
  if (status) where.status = status;
  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({ where, skip, take: limit,
      include: { car: { select: { name: true, plate: true } }, customer: { select: { fullName: true, phone: true } } },
      orderBy: { createdAt: "desc" } }),
    prisma.reservation.count({ where }),
  ]);
  return NextResponse.json({ reservations, total, page, limit, pages: Math.ceil(total/limit) });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const data = reservationSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
    const startDate = new Date(data.data.startDate);
    const endDate = new Date(data.data.endDate);
    const avail = await checkCarAvailability(data.data.carId, startDate, endDate);
    if (!avail.available) return NextResponse.json({ error: `Car not available: conflicts with ${avail.conflict?.type}` }, { status: 409 });
    const count = await prisma.reservation.count();
    const reservationNumber = `RES-${String(count+1).padStart(4,"0")}`;
    const reservation = await prisma.$transaction(async (tx) => {
      const r = await tx.reservation.create({
        data: { reservationNumber, carId: data.data.carId, customerId: data.data.customerId,
          startDate, endDate, estimatedPrice: data.data.estimatedPrice,
          deposit: data.data.deposit, notes: data.data.notes, status: "CONFIRMED" },
        include: { car: true, customer: true },
      });
      await tx.car.update({ where: { id: data.data.carId }, data: { status: "RESERVED" } });
      await tx.auditLog.create({ data: { userId: session.id, action: "CREATE", entity: "Reservation", entityId: r.id, description: `Created reservation ${reservationNumber}` } });
      return r;
    });
    return NextResponse.json({ reservation }, { status: 201 });
  } catch(err) { console.error(err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}