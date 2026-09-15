import { calculatePrice } from "../lib/pricing";

describe("calculatePrice", () => {
  const base = { dailyPrice: 50000, weeklyPrice: 300000, monthlyPrice: 1100000, customPrice: 50000 };

  const d = (y:number,m:number,day:number) => new Date(y,m-1,day);

  it("calculates daily price for 7 days", () => {
    const result = calculatePrice({ ...base, rentalType:"DAILY", startDate:d(2026,9,1), endDate:d(2026,9,8) });
    expect(result.durationDays).toBe(7);
    expect(result.basePrice).toBe(350000);
  });

  it("calculates weekly price for 1 week", () => {
    const result = calculatePrice({ ...base, rentalType:"WEEKLY", startDate:d(2026,9,1), endDate:d(2026,9,8) });
    expect(result.basePrice).toBe(300000);
  });

  it("calculates weekly price for 2 weeks", () => {
    const result = calculatePrice({ ...base, rentalType:"WEEKLY", startDate:d(2026,9,1), endDate:d(2026,9,15) });
    expect(result.basePrice).toBe(600000);
  });

  it("calculates monthly price for 30 days", () => {
    const result = calculatePrice({ ...base, rentalType:"MONTHLY", startDate:d(2026,9,1), endDate:d(2026,10,1) });
    expect(result.basePrice).toBe(1100000);
  });

  it("falls back to daily if weekly price not set", () => {
    const result = calculatePrice({ ...base, weeklyPrice: null, rentalType:"WEEKLY", startDate:d(2026,9,1), endDate:d(2026,9,8) });
    expect(result.basePrice).toBe(350000); // 7 days * 50000
  });

  it("returns 0 for 0 days", () => {
    const result = calculatePrice({ ...base, rentalType:"DAILY", startDate:d(2026,9,1), endDate:d(2026,9,1) });
    expect(result.basePrice).toBe(0);
  });

  it("returns positive for 1 day", () => {
    const result = calculatePrice({ ...base, rentalType:"DAILY", startDate:d(2026,9,1), endDate:d(2026,9,2) });
    expect(result.basePrice).toBe(50000);
  });

  it("provides a breakdown string", () => {
    const result = calculatePrice({ ...base, rentalType:"DAILY", startDate:d(2026,9,1), endDate:d(2026,9,8) });
    expect(result.breakdown).toContain("7");
  });
});