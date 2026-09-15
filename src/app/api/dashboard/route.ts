import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { syncOverdueRentals } from "@/lib/availability";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncOverdueRentals();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalCars, availableCars, rentedCars, reservedCars, totalCustomers,
         todayPayments, monthPayments, activeRentals, overdueRentals] = await Promise.all([
    prisma.car.count({ where: { isDeleted: false } }),
    prisma.car.count({ where: { isDeleted: false, status: "AVAILABLE" } }),
    prisma.car.count({ where: { isDeleted: false, status: "RENTED" } }),
    prisma.car.count({ where: { isDeleted: false, status: "RESERVED" } }),
    prisma.customer.count({ where: { isArchived: false } }),
    prisma.rentalPayment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: todayStart, lt: todayEnd } } }),
    prisma.rentalPayment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: monthStart } } }),
    prisma.rental.findMany({
      where: { status: { in: ["ACTIVE", "OVERDUE"] } },
      include: { car: true, customer: { select: { fullName: true } }, payments: true },
      orderBy: { endDate: "asc" },
      take: 20,
    }),
    prisma.rental.count({ where: { status: "OVERDUE" } }),
  ]);

  // Calculate outstanding payments
  const allActiveRentals = await prisma.rental.findMany({
    where: { status: { in: ["ACTIVE", "OVERDUE", "RESERVED"] } },
    include: { payments: true },
  });
  const outstanding = allActiveRentals.reduce((sum, r) => {
    const paid = r.payments.reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, r.totalPrice + r.additionalCharges + r.lateFee - paid);
  }, 0);

  const upcomingReturns = activeRentals.map(r => {
    const paid = r.payments.reduce((s, p) => s + p.amount, 0);
    const daysRemaining = Math.ceil((r.endDate.getTime() - now.getTime()) / 86400000);
    return {
      rentalId: r.id,
      rentalNumber: r.rentalNumber,
      carName: r.car.name,
      plate: r.car.plate,
      customerName: r.customer.fullName,
      endDate: r.endDate.toISOString(),
      status: r.status,
      daysRemaining,
      totalPrice: r.totalPrice + r.additionalCharges + r.lateFee,
      paidAmount: paid,
      remainingBalance: Math.max(0, r.totalPrice + r.additionalCharges + r.lateFee - paid),
    };
  });

  // Notifications
  const notifications: Array<{ type: string; message: string; link?: string }> = [];
  upcomingReturns.forEach(u => {
    if (u.daysRemaining < 0) notifications.push({ type: "danger", message: `🔴 ${u.carName} rental overdue by ${-u.daysRemaining} days — ${u.customerName}`, link: `/rentals/${u.rentalId}` });
    else if (u.daysRemaining === 0) notifications.push({ type: "danger", message: `🔴 ${u.carName} rental due today — ${u.customerName}`, link: `/rentals/${u.rentalId}` });
    else if (u.daysRemaining <= 2) notifications.push({ type: "warning", message: `⚠️ ${u.carName} rental ends in ${u.daysRemaining} day(s) — ${u.customerName}`, link: `/rentals/${u.rentalId}` });
    if (u.remainingBalance > 0) notifications.push({ type: "info", message: `💰 ${u.customerName} has ${u.remainingBalance.toLocaleString()} IQD outstanding`, link: `/rentals/${u.rentalId}` });
  });

  const recentRentals = await prisma.rental.findMany({
    include: { car: { select: { name: true, plate: true } }, customer: { select: { fullName: true } }, payments: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    totalCars, availableCars, rentedCars, reservedCars, totalCustomers,
    todayIncome: todayPayments._sum.amount ?? 0,
    monthlyIncome: monthPayments._sum.amount ?? 0,
    outstandingPayments: outstanding,
    overdueRentals,
    upcomingReturns,
    recentRentals,
    notifications,
  });
}