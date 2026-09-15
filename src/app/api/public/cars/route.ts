import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const cars = await prisma.car.findMany({
    where: { isDeleted: false, status: "AVAILABLE" },
    select: { id: true, name: true, make: true, model: true, year: true, color: true, fuelType: true, transmission: true, seats: true, description: true, images: { select: { id: true, url: true, isPrimary: true }, orderBy: { isPrimary: "desc" } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ cars });
}
