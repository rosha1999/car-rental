import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { rentalSchema } from "@/lib/validations";
import { checkCarAvailability } from "@/lib/availability";
import { calculatePrice } from "@/lib/pricing";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q) where.OR = [
    { rentalNumber: { contains: q } },
    { customer: { fullName: { contains: q } } },
    { car: { plate: { contains: q } } },
    { car: { name: { contains: q } } },
  ];
  const [rentals, total] = await Promise.all([
    prisma.rental.findMany({
      where, skip, take: limit,
      include: { car: { select: { name: true, plate: true, images: { take: 1 } } }, customer: { select: { fullName: true, phone: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rental.count({ where }),
  ]);
  return NextResponse.json({ rentals, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const data = rentalSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
    const startDate = new Date(data.data.startDate);
    const endDate = new Date(data.data.endDate);
    const avail = await checkCarAvailability(data.data.carId, startDate, endDate);
    if (!avail.available) return NextResponse.json({ error: `Car not available: conflicts with ${avail.conflict?.type} for ${avail.conflict?.customerName}` }, { status: 409 });
    const car = await prisma.car.findUnique({ where: { id: data.data.carId } });
    if (!car) return NextResponse.json({ error: "Car not found" }, { status: 404 });
    const pricing = calculatePrice({ rentalType: data.data.rentalType, startDate, endDate, dailyPrice: car.dailyPrice, weeklyPrice: car.weeklyPrice, monthlyPrice: car.monthlyPrice, customPrice: car.customPrice });
    const rentalCount = await prisma.rental.count();
    const rentalNumber = `R-${String(rentalCount + 1).padStart(4, "0")}`;
    const rental = await prisma.$transaction(async (tx) => {
      const r = await tx.rental.create({
        data: {
          rentalNumber, carId: data.data.carId, customerId: data.data.customerId,
          startDate, endDate, rentalType: data.data.rentalType,
          durationDays: pricing.durationDays, basePrice: pricing.basePrice,
          discount: data.data.discount, discountNote: data.data.discountNote,
          totalPrice: data.data.totalPrice, deposit: data.data.deposit,
          notes: data.data.notes, overridePriceNote: data.data.overridePriceNote,
          status: "ACTIVE",
        },
        include: { car: true, customer: true, payments: true },
      });
      if (data.data.initialPayment > 0) {
        await tx.rentalPayment.create({ data: { rentalId: r.id, amount: data.data.initialPayment, method: data.data.paymentMethod, paymentDate: new Date() } });
      }
      await tx.car.update({ where: { id: data.data.carId }, data: { status: "RENTED" } });
      await tx.auditLog.create({ data: { userId: session.id, action: "CREATE", entity: "Rental", entityId: r.id, description: `Created rental ${rentalNumber} for ${r.customer.fullName}` } });
      return r;
    });
    return NextResponse.json({ rental }, { status: 201 });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}