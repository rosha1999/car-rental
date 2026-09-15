// Integration tests for availability logic (runs in-memory)

describe("availability business rules", () => {
  // Simple unit-test date overlap logic
  function overlaps(s1: Date, e1: Date, s2: Date, e2: Date): boolean {
    return s1 < e2 && s2 < e1;
  }

  const d = (y:number,m:number,day:number) => new Date(y,m-1,day);

  it("detects overlapping ranges", () => {
    // |---A---|   
    //   |---B---|
    expect(overlaps(d(2026,9,1),d(2026,9,10), d(2026,9,5),d(2026,9,15))).toBe(true);
  });

  it("allows adjacent (non-overlapping) ranges", () => {
    // |---A---||---B---|
    expect(overlaps(d(2026,9,1),d(2026,9,8), d(2026,9,8),d(2026,9,15))).toBe(false);
  });

  it("detects B fully inside A", () => {
    // |-------A-------|
    //    |--B--|
    expect(overlaps(d(2026,9,1),d(2026,9,20), d(2026,9,5),d(2026,9,15))).toBe(true);
  });

  it("detects A fully inside B", () => {
    //    |--A--|
    // |-------B-------|
    expect(overlaps(d(2026,9,5),d(2026,9,10), d(2026,9,1),d(2026,9,20))).toBe(true);
  });

  it("does not overlap when A ends before B starts", () => {
    // |--A--|  |--B--|
    expect(overlaps(d(2026,9,1),d(2026,9,5), d(2026,9,10),d(2026,9,15))).toBe(false);
  });

  it("does not overlap when B ends before A starts", () => {
    // |--B--|  |--A--|
    expect(overlaps(d(2026,9,10),d(2026,9,15), d(2026,9,1),d(2026,9,5))).toBe(false);
  });
});

describe("overdue calculation", () => {
  function daysOverdue(endDate: Date, now: Date): number {
    const diff = now.getTime() - endDate.getTime();
    return Math.max(0, Math.ceil(diff / (1000*60*60*24)));
  }

  it("returns 0 when not overdue", () => {
    const future = new Date(); future.setDate(future.getDate()+2);
    expect(daysOverdue(future, new Date())).toBe(0);
  });

  it("returns correct overdue days", () => {
    const past = new Date(); past.setDate(past.getDate()-3);
    expect(daysOverdue(past, new Date())).toBe(3);
  });
});

describe("payment balance", () => {
  function balance(total: number, payments: number[]): number {
    return Math.max(0, total - payments.reduce((s,p)=>s+p,0));
  }

  it("calculates remaining balance", () => {
    expect(balance(700000, [300000, 200000])).toBe(200000);
  });

  it("returns 0 when fully paid", () => {
    expect(balance(350000, [350000])).toBe(0);
  });

  it("returns 0 even if overpaid", () => {
    expect(balance(350000, [400000])).toBe(0);
  });
});