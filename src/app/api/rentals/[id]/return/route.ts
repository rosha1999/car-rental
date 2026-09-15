import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { returnRentalSchema } from "@/lib/validations";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rental = await prisma.rental.findUnique({ where: { id }, include: { payments: true } });
  if (!rental) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (rental.status === "COMPLETED" || rental.status === "CANCELLED") return NextResponse.json({ error: "Rental already closed" }, { status: 409 });
  try {
    const body = await request.json();
    const data = returnRentalSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
    const returned = await prisma.$transaction(async (tx) => {
      const r = await tx.rental.update({
        where: { id },
        data: {
          status: "COMPLETED", actualReturnDate: new Date(),
          returnMileage: data.data.returnMileage, returnFuelLevel: data.data.returnFuelLevel,
          returnCondition: data.data.returnCondition, returnDamageNotes: data.data.returnDamageNotes,
          additionalCharges: data.data.additionalCharges, lateFee: data.data.lateFee,
          depositReturned: data.data.depositReturned,
        },
        include: { car: true, customer: true, payments: true },
      });
      if (data.data.finalPayment > 0) {
        await tx.rentalPayment.create({ data: { rentalId: id, amount: data.data.finalPayment, method: data.data.paymentMethod, paymentDate: new Date() } });
      }
      await tx.car.update({ where: { id: rental.carId }, data: { status: data.data.postReturnStatus, mileage: data.data.returnMileage ?? undefined } });
      await tx.auditLog.create({ data: { userId: session.id, action: "RETURN", entity: "Rental", entityId: id, description: `Returned vehicle for rental ${rental.rentalNumber}` } });
      return r;
    });
    return NextResponse.json({ rental: returned });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}