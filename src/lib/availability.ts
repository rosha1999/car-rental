import { prisma } from './db';

/**
 * Check if a car is available for a given date range.
 * Checks both active rentals and confirmed/pending reservations.
 * Excludes a specific rental/reservation ID (for edits).
 */
export async function checkCarAvailability(
  carId: string,
  startDate: Date,
  endDate: Date,
  excludeRentalId?: string,
  excludeReservationId?: string
): Promise<{ available: boolean; conflict?: { type: string; id: string; startDate: Date; endDate: Date; customerName?: string } }> {
  // Check active/reserved rentals
  const rentalConflict = await prisma.rental.findFirst({
    where: {
      carId,
      id: excludeRentalId ? { not: excludeRentalId } : undefined,
      status: { in: ['ACTIVE', 'RESERVED', 'OVERDUE'] },
      AND: [
        { startDate: { lt: endDate } },
        { endDate: { gt: startDate } },
      ],
    },
    include: { customer: { select: { fullName: true } } },
  });

  if (rentalConflict) {
    return {
      available: false,
      conflict: {
        type: 'rental',
        id: rentalConflict.id,
        startDate: rentalConflict.startDate,
        endDate: rentalConflict.endDate,
        customerName: rentalConflict.customer.fullName,
      },
    };
  }

  // Check active reservations
  const reservationConflict = await prisma.reservation.findFirst({
    where: {
      carId,
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      status: { in: ['PENDING', 'CONFIRMED'] },
      AND: [
        { startDate: { lt: endDate } },
        { endDate: { gt: startDate } },
      ],
    },
    include: { customer: { select: { fullName: true } } },
  });

  if (reservationConflict) {
    return {
      available: false,
      conflict: {
        type: 'reservation',
        id: reservationConflict.id,
        startDate: reservationConflict.startDate,
        endDate: reservationConflict.endDate,
        customerName: reservationConflict.customer.fullName,
      },
    };
  }

  return { available: true };
}

/** Get all available cars for a date range */
export async function getAvailableCars(startDate: Date, endDate: Date) {
  const allCars = await prisma.car.findMany({
    where: { isDeleted: false, status: { notIn: ['MAINTENANCE', 'INACTIVE'] } },
  });

  const available = [];
  for (const car of allCars) {
    const result = await checkCarAvailability(car.id, startDate, endDate);
    if (result.available) available.push(car);
  }
  return available;
}

/** Auto-mark overdue rentals */
export async function syncOverdueRentals() {
  const now = new Date();
  await prisma.rental.updateMany({
    where: { status: 'ACTIVE', endDate: { lt: now } },
    data: { status: 'OVERDUE' },
  });
}
