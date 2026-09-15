import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "month";
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const now = new Date();
  let startDate: Date, endDate: Date;
  if (range === "custom" && startParam && endParam) {
    startDate = new Date(startParam); endDate = new Date(endParam);
  } else if (range === "week") {
    startDate = new Date(now); startDate.setDate(now.getDate() - 7); endDate = now;
  } else if (range === "year") {
    startDate = new Date(now.getFullYear(),0,1); endDate = now;
  } else { // month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1); endDate = now;
  }
  const rentals = await prisma.rental.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    include: { payments: true, car: { select: { name: true, plate: true } } },
  });
  const payments = await prisma.rentalPayment.findMany({
    where: { paymentDate: { gte: startDate, lte: endDate } },
  });
  const totalRevenue = rentals.reduce((s,r) => s+r.totalPrice+r.additionalCharges+r.lateFee, 0);
  const totalCollected = payments.reduce((s,p) => s+p.amount, 0);
  const totalOutstanding = rentals.reduce((s,r) => {
    const paid = r.payments.reduce((ps,p) => ps+p.amount, 0);
    return s + Math.max(0, r.totalPrice+r.additionalCharges+r.lateFee - paid);
  }, 0);
  // Daily chart
  const dailyMap = new Map<string, { revenue: number; rentals: number }>();
  rentals.forEach(r => {
    const d = r.createdAt.toISOString().split("T")[0];
    const cur = dailyMap.get(d) || { revenue: 0, rentals: 0 };
    cur.revenue += r.totalPrice; cur.rentals += 1;
    dailyMap.set(d, cur);
  });
  const dailyChart = Array.from(dailyMap.entries())
    .map(([date,v]) => ({ date, ...v }))
    .sort((a,b) => a.date.localeCompare(b.date));
  // Top cars
  const carMap = new Map<string,{ carName:string;plate:string;count:number;revenue:number }>();
  rentals.forEach(r => {
    const key = r.carId;
    const cur = carMap.get(key) || { carName: r.car.name, plate: r.car.plate, count:0, revenue:0 };
    cur.count++; cur.revenue += r.totalPrice;
    carMap.set(key, cur);
  });
  const topCars = Array.from(carMap.values()).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
  // Payment methods
  const methodMap = new Map<string,{ total:number;count:number }>();
  payments.forEach(p => {
    const cur = methodMap.get(p.method) || { total:0, count:0 };
    cur.total += p.amount; cur.count++;
    methodMap.set(p.method, cur);
  });
  const paymentMethods = Array.from(methodMap.entries()).map(([method,v]) => ({ method, ...v }));
  return NextResponse.json({
    totalRentals: rentals.length, totalRevenue, totalCollected, totalOutstanding,
    averageRentalValue: rentals.length ? totalRevenue/rentals.length : 0,
    dailyChart, topCars, paymentMethods, startDate: startDate.toISOString(), endDate: endDate.toISOString(),
  });
}