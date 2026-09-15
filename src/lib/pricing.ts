/**
 * Smart pricing engine for car rentals.
 * All prices in IQD. Settings are fetched from DB at runtime.
 */

export type PricingSettings = {
  partialDayCharge: 'FULL' | 'HALF' | 'NONE'; // how to charge partial days
  gracePeriodHours: number;                     // grace before late fees kick in
  lateFeePerDay: number;                        // IQD per overdue day
  minimumRentalDays: number;                    // minimum days for any rental
};

export type PricingInput = {
  rentalType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  startDate: Date;
  endDate: Date;
  dailyPrice: number;
  weeklyPrice?: number | null;
  monthlyPrice?: number | null;
  customPrice?: number | null;
  settings?: Partial<PricingSettings>;
};

export type PricingResult = {
  durationDays: number;
  durationWeeks: number;
  durationMonths: number;
  basePrice: number;
  breakdown: string;
};

const DEFAULTS: PricingSettings = {
  partialDayCharge: 'FULL',
  gracePeriodHours: 2,
  lateFeePerDay: 0,
  minimumRentalDays: 1,
};

export function calculatePrice(input: PricingInput): PricingResult {
  const settings: PricingSettings = { ...DEFAULTS, ...input.settings };

  const msInDay = 1000 * 60 * 60 * 24;
  const msInHour = 1000 * 60 * 60;
  const diffMs = input.endDate.getTime() - input.startDate.getTime();
  const rawDays = diffMs / msInDay;
  const rawHours = diffMs / msInHour;

  let durationDays = Math.max(settings.minimumRentalDays, Math.ceil(rawDays));

  // Partial day handling
  if (settings.partialDayCharge === 'NONE') {
    durationDays = Math.max(settings.minimumRentalDays, Math.floor(rawDays));
  } else if (settings.partialDayCharge === 'HALF') {
    const whole = Math.floor(rawDays);
    const fraction = rawDays - whole;
    durationDays = Math.max(settings.minimumRentalDays, fraction > 0.5 ? whole + 1 : whole + 0.5);
  }

  const durationWeeks = durationDays / 7;
  const durationMonths = durationDays / 30;

  let basePrice = 0;
  let breakdown = '';

  switch (input.rentalType) {
    case 'DAILY': {
      basePrice = durationDays * input.dailyPrice;
      breakdown = `${durationDays} days × ${input.dailyPrice.toLocaleString()} IQD`;
      break;
    }
    case 'WEEKLY': {
      const price = input.weeklyPrice ?? input.dailyPrice * 7;
      const weeks = Math.floor(durationWeeks);
      const remainDays = durationDays - weeks * 7;
      basePrice = weeks * price + remainDays * input.dailyPrice;
      breakdown = `${weeks} weeks × ${price.toLocaleString()} IQD`;
      if (remainDays > 0) breakdown += ` + ${remainDays} days × ${input.dailyPrice.toLocaleString()} IQD`;
      break;
    }
    case 'MONTHLY': {
      const price = input.monthlyPrice ?? input.dailyPrice * 30;
      const months = Math.floor(durationMonths);
      const remainDays = durationDays - months * 30;
      basePrice = months * price + remainDays * input.dailyPrice;
      breakdown = `${months} months × ${price.toLocaleString()} IQD`;
      if (remainDays > 0) breakdown += ` + ${remainDays} days × ${input.dailyPrice.toLocaleString()} IQD`;
      break;
    }
    case 'CUSTOM': {
      const price = input.customPrice ?? input.dailyPrice;
      basePrice = durationDays * price;
      breakdown = `${durationDays} days × ${price.toLocaleString()} IQD (custom rate)`;
      break;
    }
  }

  return {
    durationDays,
    durationWeeks,
    durationMonths,
    basePrice,
    breakdown,
  };
}

export function calculateLateFee(endDate: Date, lateFeePerDay: number, gracePeriodHours = 2): number {
  const now = new Date();
  if (now <= endDate) return 0;
  const overdueDays = Math.floor(
    (now.getTime() - endDate.getTime() - gracePeriodHours * 3600000) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, overdueDays) * lateFeePerDay;
}
