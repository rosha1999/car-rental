import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { paymentSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const data = paymentSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
    if (data.data.amount <= 0) return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    const rental = await prisma.rental.findUnique({ where: { id: data.data.rentalId } });
    if (!rental) return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    const payment = await prisma.rentalPayment.create({
      data: { rentalId: data.data.rentalId, amount: data.data.amount, method: data.data.method, notes: data.data.notes, paymentDate: data.data.paymentDate ? new Date(data.data.paymentDate) : new Date() },
    });
    await prisma.auditLog.create({ data: { userId: session.id, action: "PAYMENT", entity: "Rental", entityId: data.data.rentalId, description: `Payment of ${data.data.amount.toLocaleString()} IQD recorded` } });
    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}