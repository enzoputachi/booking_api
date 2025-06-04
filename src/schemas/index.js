import { z } from 'zod';

//
// =================== ENUMS ===================
//
export const RoleEnum = z.enum(['ADMIN']);
export const BookingStatusEnum = z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED']);
export const SeatStatusEnum = z.enum(['AVAILABLE', 'BOOKED', 'RESERVED']);
export const PaymentStatusEnum = z.enum(['PENDING', 'PAID', 'FAILED']);
export const TripStatusEnum = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']);

//
// =================== BASE SCHEMAS ===================
//

// We declare all base schemas with `let` so that circular references via z.lazy() compile correctly.
let UserBaseSchema;
let AdminActivityLogBaseSchema;
let RouteBaseSchema;
let BusBaseSchema;
let TripBaseSchema;
let SeatBaseSchema;
let BookingLogBaseSchema;
let NotificationBaseSchema;
let PaymentBaseSchema;
let BookingBaseSchema;

// 1. AdminActivityLog (has circular reference with User)
AdminActivityLogBaseSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().uuid(),
  action: z.string(),             // e.g. "LOGIN", "UPDATED_TRIP"
  metadata: z.any().nullable(),
  timestamp: z.date(),
  user: z.lazy(() => UserBaseSchema),
});

// 2. User (referencing AdminActivityLog)
UserBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  status: z.string(),
  lastLogin: z.date().nullable(),
  createdAt: z.date(),
  role: RoleEnum,
  logs: z.array(z.lazy(() => AdminActivityLogBaseSchema)),
});

// 3. Route (referencing Trip)
RouteBaseSchema = z.object({
  id: z.number().int().positive(),
  origin: z.string(),
  destination: z.string(),
  distanceKm: z.number().positive(),
  isActive: z.boolean(),
  trips: z.array(z.lazy(() => TripBaseSchema)),
});

// 4. Bus (referencing Trip)
BusBaseSchema = z.object({
  id: z.number().int().positive(),
  plateNo: z.string(),
  busType: z.string(),
  capacity: z.number().int().positive(),
  seatsPerRow: z.number().int().positive(),
  isActive: z.boolean(),
  trips: z.array(z.lazy(() => TripBaseSchema)),
});

// 5. Trip (referencing Bus, Route, Seat, Booking)
TripBaseSchema = z.object({
  id: z.number().int().positive(),
  departTime: z.date(),
  arriveTime: z.date(),
  busId: z.number().int(),
  bus: z.lazy(() => BusBaseSchema),
  routeId: z.number().int(),
  route: z.lazy(() => RouteBaseSchema),
  price: z.number().positive(),
  status: TripStatusEnum,
  seats: z.array(z.lazy(() => SeatBaseSchema)),
  bookings: z.array(z.lazy(() => BookingBaseSchema)),
});

// 6. Seat (referencing Trip, Booking)
SeatBaseSchema = z.object({
  id: z.number().int().positive(),
  seatNo: z.string(),
  status: SeatStatusEnum,
  tripId: z.number().int(),
  trip: z.lazy(() => TripBaseSchema),
  reservedAt: z.date().nullable(),
  booking: z.union([z.lazy(() => BookingBaseSchema), z.null()]),
});

// 7. BookingLog (referencing Booking)
BookingLogBaseSchema = z.object({
  id: z.number().int().positive(),
  bookingId: z.number().int(),
  action: z.string(),
  timestamp: z.date(),
  metadata: z.any().nullable(),
  booking: z.lazy(() => BookingBaseSchema),
});

// 8. Notification (referencing Booking)
NotificationBaseSchema = z.object({
  id: z.number().int().positive(),
  contactInfo: z.string(),
  type: z.string(),           // e.g. "EMAIL", "SMS"
  message: z.string(),
  sentAt: z.date(),
  bookingId: z.number().int().nullable(),
  booking: z.union([z.lazy(() => BookingBaseSchema), z.null()]),
});

// 9. Payment (referencing Booking)
PaymentBaseSchema = z.object({
  id: z.number().int().positive(),
  bookingId: z.number().int(),
  paystackRef: z.string().nullable(),
  amount: z.number().positive(),
  channel: z.string().nullable(),
  currency: z.string(),
  provider: z.string(),
  status: PaymentStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  customerId: z.string().nullable(),
  paidAt: z.date().nullable(),
  authorization: z.any().nullable(),
  booking: z.lazy(() => BookingBaseSchema),
});

// 10. Booking (referencing Trip, Seat, Payment, BookingLog, Notification)
BookingBaseSchema = z.object({
  id: z.number().int().positive(),
  tripId: z.number().int(),
  trip: z.lazy(() => TripBaseSchema),
  seatId: z.number().int(),
  seat: z.lazy(() => SeatBaseSchema),
  passengerTitle: z.string().nullable(),
  passengerName: z.string(),
  passengerAge: z.number().int().nullable(),
  nextOfKinName: z.string(),
  nextOfKinPhone: z.string(),
  email: z.string().email(),
  mobile: z.string(),
  contactHash: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  sessionId: z.string().nullable(),
  referrer: z.string().nullable(),
  deviceFingerprint: z.string().nullable(),
  bookingToken: z.string(),
  status: BookingStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  payment: z.union([z.lazy(() => PaymentBaseSchema), z.null()]),
  logs: z.array(z.lazy(() => BookingLogBaseSchema)),
  Notifications: z.array(z.lazy(() => NotificationBaseSchema)),
});

//
// =================== CREATE SCHEMAS ===================
//

// 1. UserCreate (omit auto-generated and relation fields)
export const UserCreateSchema = UserBaseSchema
  .omit({
    id: true,
    createdAt: true,
    lastLogin: true,
    logs: true, 
  })
  .partial({
    status: true,  // allow default "active"
    role: true,    // allow default "ADMIN"
  });

// 2. AdminActivityLogCreate (omit id & relation)
export const AdminActivityLogCreateSchema = AdminActivityLogBaseSchema
  .omit({
    id: true,
    user: true,
  });

// 3. RouteCreate (omit id & relation)
export const RouteCreateSchema = RouteBaseSchema
  .omit({
    id: true,
    trips: true,
  })
  .partial({
    isActive: true, // allow default true
  });

// 4. BusCreate (omit id & relation)
export const BusCreateSchema = BusBaseSchema
  .omit({
    id: true,
    trips: true,
  })
  .partial({
    isActive: true, // allow default true
  });

// 5. TripCreate (omit id & relation fields)
export const TripCreateSchema = TripBaseSchema
  .omit({
    id: true,
    bus: true,
    route: true,
    seats: true,
    bookings: true,
  })
  .partial({
    status: true, // allow default "SCHEDULED"
  });

// 6. SeatCreate (omit id & relation)
export const SeatCreateSchema = SeatBaseSchema
  .omit({
    id: true,
    trip: true,
    booking: true,
  })
  .partial({
    status: true,      // allow default "AVAILABLE"
    reservedAt: true,  // nullable
  });

// 7. BookingLogCreate (omit id & relation)
export const BookingLogCreateSchema = BookingLogBaseSchema
  .omit({
    id: true,
    booking: true,
  });

// 8. NotificationCreate (omit id & relation)
export const NotificationCreateSchema = NotificationBaseSchema
  .omit({
    id: true,
    booking: true,
  });

// 9. PaymentCreate (omit id & relation)
export const PaymentCreateSchema = PaymentBaseSchema
  .omit({
    id: true,
    booking: true,
  })
  .partial({
    channel: true,
    paystackRef: true,
    currency: true,
    provider: true,
    status: true,
    customerId: true,
    paidAt: true,
    authorization: true,
  });

// 10. BookingCreate (omit id & relations)
export const BookingCreateSchema = BookingBaseSchema
  .omit({
    id: true,
    trip: true,
    seat: true,
    payment: true,
    logs: true,
    Notifications: true,
  })
  .partial({
    passengerTitle: true,
    passengerAge: true,
    userAgent: true,
    ipAddress: true,
    sessionId: true,
    referrer: true,
    deviceFingerprint: true,
    status: true,       // allow default "DRAFT"
  });

//
// =================== UPDATE SCHEMAS ===================
//

// 1. UserUpdate
export const UserUpdateSchema = UserCreateSchema.partial();

// 2. AdminActivityLogUpdate
export const AdminActivityLogUpdateSchema = AdminActivityLogCreateSchema.partial();

// 3. RouteUpdate
export const RouteUpdateSchema = RouteCreateSchema.partial();

// 4. BusUpdate
export const BusUpdateSchema = BusCreateSchema.partial();

// 5. TripUpdate
export const TripUpdateSchema = TripCreateSchema.partial();

// 6. SeatUpdate
export const SeatUpdateSchema = SeatCreateSchema.partial();

// 7. BookingLogUpdate
export const BookingLogUpdateSchema = BookingLogCreateSchema.partial();

// 8. NotificationUpdate
export const NotificationUpdateSchema = NotificationCreateSchema.partial();

// 9. PaymentUpdate
export const PaymentUpdateSchema = PaymentCreateSchema.partial();

// 10. BookingUpdate
export const BookingUpdateSchema = BookingCreateSchema.partial();
