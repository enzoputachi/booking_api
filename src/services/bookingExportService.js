import { Parser } from "json2csv";
import prisma from "../models/index.js";

const createCSVParser = () => {
    const fields = [
      { label: "Booking ID", value: "id" },
      { label: "Trip ID", value: "tripId" },
      { label: "Passenger Name", value: "passengerName" },
      { label: "Email", value: "email" },
      { label: "Mobile", value: "mobile" },
      { label: "Status", value: "status" },
      { label: "Created At", value: "createdAt" },
      { label: "Trip Origin", value: "trip.route.origin" },
      { label: "Trip Destination", value: "trip.route.destination" },
      { label: "Seat Numbers", value: "seatNumbers" },
      { label: "Amount Paid", value: "amountPaid" },
      { label: "Payment Complete", value: "isPaymentComplete" },
      { label: "Payment Channel", value: "paymentChannel" },
      { label: "Payment Provider", value: "paymentProvider" },
      { label: "Payment Status", value: "paymentStatus" }
    ];

    return new Parser({ fields })
}

const transformBookingData = (bookings) => bookings.map(booking => ({
    ...booking,
    createdAt: booking.createdAt.toISOString(),
    seatNumbers: booking.seat?.map(s => s.seatNo).join(', ') || "", // Fixed: seatNo instead of seatNumber
    // Flatten nested trip and route data
    'trip.route.origin': booking.trip?.route?.origin || '',
    'trip.route.destination': booking.trip?.route?.destination || '',
    // Flatten payment data (get the first payment record if multiple exist)
    paymentChannel: booking.payment?.[0]?.channel || '',
    paymentProvider: booking.payment?.[0]?.provider || '',
    paymentStatus: booking.payment?.[0]?.status || ''
}));

// Helper functions remain the same
const buildWhereClause = (filters) => {
  const where = {};
  if (filters.startDate) where.createdAt = { ...where.createdAt, gte: new Date(filters.startDate) };
  if (filters.endDate) where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
  if (filters.status) where.status = filters.status;
  if (filters.tripId) where.tripId = parseInt(filters.tripId);
  return where;
};

const fetchBookingsWithRelations = async (whereClause) => {
  return await prisma.booking.findMany({
    where: whereClause,
    include: {
      trip: { 
        select: { 
          id: true,
          price: true, // Using price instead of fare since fare doesn't exist
          route: {
            select: {
              origin: true,
              destination: true
            }
          }
        } 
      },
      seat: { select: { seatNo: true, status: true } }, // Fixed: seatNo instead of seatNumber
      payment: { select: { amount: true, channel: true, provider: true, status: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const exportBookingsAsCVS = async (filters = {}) => {
    try {
      const whereClause = buildWhereClause(filters);
      const bookings = await fetchBookingsWithRelations(whereClause);

      // Transform data to csv
      const transformedData = transformBookingData(bookings);

      // Generate CSV with json2csv
      const parser = createCSVParser();
      return parser.parse(transformedData);
    } catch (error) {
        throw new Error(`Failed to export bookings: ${error.message}`);
    }
}

export default exportBookingsAsCVS;