import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const carSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1980).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Color is required'),
  plate: z.string().min(1, 'License plate is required'),
  vin: z.string().optional().nullable(),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']).default('PETROL'),
  transmission: z.enum(['AUTOMATIC', 'MANUAL']).default('AUTOMATIC'),
  seats: z.coerce.number().min(1).max(20).default(5),
  mileage: z.coerce.number().min(0).default(0),
  dailyPrice: z.coerce.number().min(0),
  weeklyPrice: z.coerce.number().min(0).optional().nullable(),
  monthlyPrice: z.coerce.number().min(0).optional().nullable(),
  customPrice: z.coerce.number().min(0).optional().nullable(),
  deposit: z.coerce.number().min(0).default(0),
  description: z.string().optional().default(''),
  status: z.enum(['AVAILABLE', 'RENTED', 'RESERVED', 'MAINTENANCE', 'INACTIVE']).default('AVAILABLE'),
});

export const customerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(7, 'Phone number is required'),
  altPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  licenseExpiry: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  notes: z.string().optional().default(''),
});

export const rentalSchema = z.object({
  carId: z.string().min(1, 'Car is required'),
  customerId: z.string().min(1, 'Customer is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  rentalType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']).default('DAILY'),
  totalPrice: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  discountNote: z.string().optional().default(''),
  initialPayment: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  notes: z.string().optional().default(''),
  overridePriceNote: z.string().optional().default(''),
}).refine(d => new Date(d.endDate) > new Date(d.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const paymentSchema = z.object({
  rentalId: z.string().min(1),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  paymentDate: z.string().optional(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  notes: z.string().optional().default(''),
});

export const reservationSchema = z.object({
  carId: z.string().min(1, 'Car is required'),
  customerId: z.string().min(1, 'Customer is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  estimatedPrice: z.coerce.number().min(0).default(0),
  deposit: z.coerce.number().min(0).default(0),
  notes: z.string().optional().default(''),
}).refine(d => new Date(d.endDate) > new Date(d.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const returnRentalSchema = z.object({
  returnMileage: z.coerce.number().min(0).optional().nullable(),
  returnFuelLevel: z.string().optional().default(''),
  returnCondition: z.string().optional().default(''),
  returnDamageNotes: z.string().optional().default(''),
  additionalCharges: z.coerce.number().min(0).default(0),
  lateFee: z.coerce.number().min(0).default(0),
  finalPayment: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  postReturnStatus: z.enum(['AVAILABLE', 'MAINTENANCE']).default('AVAILABLE'),
  depositReturned: z.boolean().default(false),
});

export const settingSchema = z.object({
  businessName: z.string().optional(),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  currency: z.string().default('IQD'),
  whatsappNumber: z.string().optional(),
  lateFeePerDay: z.coerce.number().min(0).default(0),
  gracePeriodHours: z.coerce.number().min(0).default(2),
  minimumRentalDays: z.coerce.number().min(1).default(1),
  partialDayCharge: z.enum(['FULL', 'HALF', 'NONE']).default('FULL'),
  rentalTerms: z.string().optional(),
});

export const bookingRequestSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerPhone: z.string().min(7, 'Phone is required'),
  carId: z.string().optional(),
  carName: z.string().min(1, 'Car name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().optional().default(''),
});
