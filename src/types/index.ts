export type Locale = 'ar' | 'ku' | 'en';
export type Direction = 'rtl' | 'ltr';

export type CarStatus = 'AVAILABLE' | 'RENTED' | 'RESERVED' | 'MAINTENANCE' | 'INACTIVE';
export type RentalStatus = 'ACTIVE' | 'RESERVED' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CONVERTED_TO_RENTAL';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'OTHER';
export type RentalType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
export type Transmission = 'AUTOMATIC' | 'MANUAL';

export interface CarImage { id: string; carId: string; url: string; isPrimary: boolean; }

export interface Car {
  id: string; name: string; make: string; model: string; year: number; color: string;
  plate: string; vin?: string | null; fuelType: FuelType; transmission: Transmission;
  seats: number; mileage: number; dailyPrice: number; weeklyPrice?: number | null;
  monthlyPrice?: number | null; customPrice?: number | null; deposit: number;
  description?: string; status: CarStatus; isDeleted: boolean;
  createdAt: string; updatedAt: string;
  images?: CarImage[];
  _count?: { rentals: number };
}

export interface Customer {
  id: string; fullName: string; phone: string; altPhone?: string | null;
  address?: string | null; licenseNumber?: string | null; licenseExpiry?: string | null;
  nationality?: string | null; notes?: string; isArchived: boolean;
  createdAt: string; updatedAt: string;
  rentals?: Rental[];
  _count?: { rentals: number };
}

export interface RentalPayment {
  id: string; rentalId: string; amount: number; paymentDate: string;
  method: PaymentMethod; notes?: string; createdAt: string;
}

export interface Rental {
  id: string; rentalNumber: string; carId: string; customerId: string;
  startDate: string; endDate: string; actualReturnDate?: string | null;
  rentalType: RentalType; durationDays: number; basePrice: number;
  discount: number; discountNote?: string; totalPrice: number;
  deposit: number; depositReturned: boolean; status: RentalStatus;
  notes?: string; returnMileage?: number | null; returnFuelLevel?: string;
  returnCondition?: string; returnDamageNotes?: string;
  additionalCharges: number; lateFee: number; overridePriceNote?: string;
  createdAt: string; updatedAt: string;
  car?: Car; customer?: Customer; payments?: RentalPayment[];
}

export interface Reservation {
  id: string; reservationNumber: string; carId: string; customerId: string;
  startDate: string; endDate: string; estimatedPrice: number; deposit: number;
  notes?: string; status: ReservationStatus; createdAt: string; updatedAt: string;
  car?: Car; customer?: Customer;
}

export interface DashboardStats {
  totalCars: number; availableCars: number; rentedCars: number; reservedCars: number;
  totalCustomers: number; todayIncome: number; monthlyIncome: number; outstandingPayments: number;
  upcomingReturns: UpcomingReturn[]; recentRentals: Rental[];
  notifications: Notification[];
}

export interface UpcomingReturn {
  rentalId: string; carName: string; plate: string; customerName: string;
  endDate: string; daysRemaining: number; totalPrice: number;
  paidAmount: number; remainingBalance: number;
}

export interface Notification {
  id: string; type: 'warning' | 'danger' | 'info'; message: string;
  link?: string; relatedId?: string;
}

export interface ReportData {
  totalRentals: number; totalRevenue: number; totalCollected: number;
  totalOutstanding: number; averageRentalValue: number;
  dailyChart: { date: string; revenue: number; rentals: number }[];
  topCars: { carName: string; plate: string; count: number; revenue: number }[];
  paymentMethods: { method: string; total: number; count: number }[];
}

export interface BookingRequest {
  id: string; customerName: string; customerPhone: string;
  carName: string; startDate: string; endDate: string;
  notes?: string; status: string; adminNotes?: string;
  createdAt: string;
}

export interface Setting { key: string; value: string; }

export interface BusinessSettings {
  businessName: string; businessPhone: string; businessAddress: string;
  currency: string; whatsappNumber: string; lateFeePerDay: number;
  gracePeriodHours: number; minimumRentalDays: number;
  partialDayCharge: 'FULL' | 'HALF' | 'NONE'; rentalTerms: string;
}
