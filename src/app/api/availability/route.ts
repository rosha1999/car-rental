import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkCarAvailability } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const carId = searchParams.get("carId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  if (!carId || !startDate || !endDate) return NextResponse.json({ error: "carId, startDate, endDate required" }, { status: 400 });
  const result = await checkCarAvailability(carId, new Date(startDate), new Date(endDate));
  return NextResponse.json(result);
}