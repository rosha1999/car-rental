import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bookingRequestSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("cr_session")?.value;
  if (!cookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const requests = await prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = bookingRequestSchema.safeParse(body);
  if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
  const req = await prisma.bookingRequest.create({
    data: { ...data.data, carId: data.data.carId || null, startDate: new Date(data.data.startDate), endDate: new Date(data.data.endDate) },
  });
  return NextResponse.json({ request: req }, { status: 201 });
}