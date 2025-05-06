import { z } from 'zod';

// =================== ENUMS ===================
const Role = z.enum(['ADMIN']);
const BookingStatus = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']);
const SeatStatus = z.enum(['AVAILABLE', 'BOOKED']);
const PaymentStatus = z.enum(['PENDING', 'PAID', 'FAILED']);

// =================== USER ===================
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(6),
  role: Role,
});

// =================== ROUTE ===================
const RouteSchema = z.object({
  id: z.number().int().positive(),
  origin: z.string(),
  destination: z.string(),
  distanceKm: z.number().positive(),
});

// =================== BUS ===================
const BusSchema = z.object({
  id: z.number().int().positive(),
  plateNo: z.string(),
  capacity: z.number().int().positive(),
  seatsPerRow: z.number().int().positive(),
});

// =================== TRIP ===================
const TripSchema = z.object({
  id: z.number().int().positive(),
  origin: z.string(),
  destination: z.string(),
  departTime: z.coerce.date(),
  arriveTime: z.coerce.date(),
  busId: z.number().int(),
  routeId: z.number().int(),
});

// =================== SEAT ===================
const SeatSchema = z.object({
  id: z.number().int().positive(),
  seatNo: z.string(),
  status: SeatStatus.default('AVAILABLE'),
  tripId: z.number().int(),
});

// =================== BOOKING ===================
const BookingSchema = z.object({
  id: z.number().int().positive(),
  tripId: z.number().int(),
  seatId: z.number().int(),
  passengerName: z.string(),
  contactInfo: z.string(),
  contactHash: z.string(),
  userAgent: z.string(),
  ipAddress: z.string(),
  sessionId: z.string(),
  referrer: z.string().optional(),
  deviceFingerprint: z.string().optional(),
  bookingToken: z.string(),
  status: BookingStatus,
  createdAt: z.coerce.date(),
});

// =================== PAYMENT ===================
const PaymentSchema = z.object({
  id: z.number().int().positive(),
  bookingId: z.number().int(),
  amount: z.number().positive(),
  method: z.string(),
  status: PaymentStatus,
  paidAt: z.coerce.date().nullable().optional(),
});

// =================== BOOKING LOG ===================
const BookingLogSchema = z.object({
  id: z.number().int().positive(),
  bookingId: z.number().int(),
  action: z.string(),
  timestamp: z.coerce.date(),
  metadata: z.any().optional(), // could be refined with structure
});

// =================== NOTIFICATION ===================
const NotificationSchema = z.object({
  id: z.number().int().positive(),
  contactInfo: z.string(),
  type: z.string(),
  message: z.string(),
  sentAt: z.coerce.date(),
  bookingId: z.number().int().optional(),
});

// =================== ADMIN ACTIVITY ===================
const AdminActivityLogSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string(),
  action: z.string(),
  metadata: z.any().optional(),
  timestamp: z.coerce.date(),
});



// ******************************
const TripCreateSchema = TripSchema.omit({ id: true });
const BusCreateSchema = BusSchema.omit({ id: true });
const UserCreateSchema = UserSchema.omit({ id: true });
const RouteCreateSchema = RouteSchema.omit({ id: true });
const SeatCreateSchema = SeatSchema.omit({ id: true });
const BookingCreateSchema = BookingSchema.omit({ id: true });
const BookingLogCreateSchema = BookingLogSchema.omit({ id: true });
const NotificationCreateSchema = NotificationSchema.omit({ id: true });
const AdminActivityLogCreateSchema = AdminActivityLogSchema.omit({ id: true });
const PaymentCreateSchema = PaymentSchema.omit({ id: true });

export {
  Role,
  BookingStatus,
  SeatStatus,
  PaymentStatus,
  UserCreateSchema,
  RouteCreateSchema,
  BusCreateSchema,
  TripCreateSchema,
  SeatCreateSchema,
  BookingCreateSchema,
  PaymentCreateSchema,
  BookingLogCreateSchema,
  NotificationCreateSchema,
  AdminActivityLogCreateSchema,
};
