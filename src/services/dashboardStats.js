import prisma from "../models/index.js";


export const getDashboardStats = async () => {

    const now = new Date();

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const totalBookings = await prisma.booking.count();
    
    // Count bookings created this month and last month
    const [newThisMonth, newLastMonth] = await Promise.all([
        prisma.booking.count({ where: { createdAt: { gte: startOfThisMonth } } }),
        prisma.booking.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    ]);

    // Calculate bookings growth percentage
   const bookingGrowth = newLastMonth === 0
        ? 100 // or null or 'N/A'
        : Math.round(100 * (newThisMonth - newLastMonth) / newLastMonth);

    // Count active trips (scheduled trips with departTime in the future)
    const activeTrips = await prisma.trip.count({
        where: {
            status: "SCHEDULED",
            departTime: { gt: now }
        },
    })

    // Count trips scheduled for this month and last month
    const [tripsThisMonth, tripsLastMonth] = await Promise.all([
        prisma.trip.count({
            where: {
                status: "SCHEDULED",
                departTime: {
                    gte: startOfThisMonth,
                    lt: new Date(now.getFullYear(), now.getMonth() + 1, 1) // Up to the start of next month
                }
            }
        }),
        prisma.trip.count({
            where: {
                status: "SCHEDULED",
                departTime: {
                    gte: startOfLastMonth,
                    lt: startOfThisMonth // Up to the start of this month
                }
            }
        })
    ])

    // Calculate trip growth percentage
    const tripGrowth = tripsLastMonth === 0
        ? 100
        : Math.round(100 * (tripsThisMonth - tripsLastMonth) / tripsLastMonth);

    // Count pending bookings
    const pendingBookings = await prisma.booking.count({
        where: {
            status: "PENDING",
        },
    });

    // Calculate monthly revenue and growth
    const [thisRev, lastRev] = await Promise.all([
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
                status: "PAID",
                paidAt: { gte: startOfThisMonth }
            }
        }),

        prisma.payment.aggregate({
            _sum: { amount: true },
            where: {
                status: "PAID",
                paidAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
        })
    ]);

    // Calculate monthly revenue and growth percentage
    const thisRevenueKobo = thisRev._sum.amount ?? 0;
    const lastRevenueKobo = lastRev._sum.amount ?? 0;

    const monthlyRevenue = thisRevenueKobo / 100;
    const lastMonthRevenue = lastRevenueKobo / 100;

    const revenueGrowth = lastMonthRevenue === 0
        ? 100  // could also be `null`, `"N/A"`, or `Infinity`
        : Math.round(
            100 * (monthlyRevenue - lastMonthRevenue) / lastMonthRevenue
            );

    console.log("Revenue growth:", revenueGrowth, lastMonthRevenue);
    

    return {
        totalBookings,
        newThisMonth,
        newLastMonth,
        bookingGrowth,
        activeTrips,
        pendingBookings,
        monthlyRevenue,
        revenueGrowth,
        tripGrowth,
    }
}