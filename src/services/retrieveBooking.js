// ============================================================================
// ENHANCED BOOKING SERVICE - bookingService.js
// ============================================================================

/**
 * Helper function to assign seats to a booking
 * @param {Object} booking - The booking object
 * @param {number} requiredSeats - Number of seats needed
 * @param {Object} tx - Prisma transaction client
 * @returns {Array} - Array of assigned seat numbers


/**
 * Enhanced updateBookingService with automatic seat assignment logic
 * @param {string|number} identifier - booking token (string) or booking id (number)
 * @param {Object} updateData - data to update
 * @param {Object} options - additional options
 * @param {boolean} options.autoAssignSeats - whether to auto-assign seats when confirming
 * @param {number} options.requiredSeats - number of seats to assign (default: 1)
 * @param {Object} db - database client (for testing)
 * @returns {Object} - updated booking with seats
 */
const updateBookingService = async (identifier, updateData, options = {}, db = prisma) => {
  const { autoAssignSeats = true, requiredSeats = 1 } = options;
  
  const whereClause = typeof identifier === 'string'
    ? { bookingToken: identifier }
    : { id: identifier };

  // Avoid updating immutable fields explicitly
  const { id, bookingToken, createdAt, updatedAt, ...safeUpdateData } = updateData;

  // Use transaction to ensure data consistency
  return await db.$transaction(async (tx) => {
    
    // 1. First, get the current booking to check status changes
    const currentBooking = await tx.booking.findUnique({
      where: whereClause,
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          }
        },
        seat: true,
        payment: true,
      }
    });

    if (!currentBooking) {
      throw new Error(`Booking not found with identifier: ${JSON.stringify(identifier)}`);
    }

    // 2. Update the booking first
    const updatedBooking = await tx.booking.update({
      where: whereClause,
      data: safeUpdateData,   // Prisma updates updatedAt automatically
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          }
        },
        seat: true,
        payment: true,
      }
    });

    // 3. Handle status-based logic for seat assignment/release
    const oldStatus = currentBooking.status;
    const newStatus = updatedBooking.status;

    // Scenario 1: Booking is being confirmed and needs seat assignment
    if (autoAssignSeats && newStatus === 'CONFIRMED' && oldStatus !== 'CONFIRMED') {
      console.log(`Auto-assigning seats for confirmed booking: ${updatedBooking.bookingToken}`);
      
      try {
        const assignedSeats = await assignSeatsToBookingHelper(updatedBooking, requiredSeats, tx);
        console.log(`Successfully assigned seats: ${assignedSeats.join(', ')}`);
        
        // Create activity log for confirmation
        await tx.bookingLog.create({
          data: {
            bookingId: updatedBooking.id,
            action: 'BOOKING_CONFIRMED_BY_ADMIN',
            metadata: {
              previousStatus: oldStatus,
              newStatus: newStatus,
              assignedSeats: assignedSeats,
              autoAssigned: true
            }
          }
        });
        
      } catch (seatError) {
        console.error('Seat assignment failed:', seatError.message);
        // You can choose to either throw the error or continue without seats
        // For now, we'll throw to maintain data integrity
        throw new Error(`Booking confirmed but seat assignment failed: ${seatError.message}`);
      }
    }

    // Scenario 2: Booking is being cancelled - release seats
    if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      console.log(`Releasing seats for cancelled booking: ${updatedBooking.bookingToken}`);
      await releaseSeatsHelper(updatedBooking, tx);
      
      // Create activity log for cancellation
      await tx.bookingLog.create({
        data: {
          bookingId: updatedBooking.id,
          action: 'BOOKING_CANCELLED_BY_ADMIN',
          metadata: {
            previousStatus: oldStatus,
            newStatus: newStatus,
            seatsReleased: updatedBooking.seat ? updatedBooking.seat.length : 0
          }
        }
      });
    }

    // Scenario 3: Booking is being moved from confirmed to pending/draft - release seats
    if (oldStatus === 'CONFIRMED' && ['PENDING', 'DRAFT'].includes(newStatus)) {
      console.log(`Releasing seats for downgraded booking: ${updatedBooking.bookingToken}`);
      await releaseSeatsHelper(updatedBooking, tx);
      
      await tx.bookingLog.create({
        data: {
          bookingId: updatedBooking.id,
          action: 'BOOKING_STATUS_DOWNGRADED',
          metadata: {
            previousStatus: oldStatus,
            newStatus: newStatus,
            reason: 'Status changed from confirmed to pending/draft'
          }
        }
      });
    }

    // 4. Fetch the final updated booking with all relationships
    const finalBooking = await tx.booking.findUnique({
      where: whereClause,
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
          }
        },
        seat: true,
        payment: true,
      }
    });

    return finalBooking;
  });
};

/**
 * Explicit function to manually assign seats (for cases where you want manual control)
 * @param {string|number} identifier - booking identifier
 * @param {number} seatCount - number of seats to assign
 * @param {Object} db - database client
 * @returns {Object} - updated booking with assigned seats
 */
const assignSeatsManually = async (identifier, seatCount = 1, db = prisma) => {
  const whereClause = typeof identifier === 'string'
    ? { bookingToken: identifier }
    : { id: identifier };

  return await db.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: whereClause,
      include: {
        trip: { include: { route: true, bus: true } },
        seat: true,
        payment: true,
      }
    });

    if (!booking) {
      throw new Error(`Booking not found with identifier: ${JSON.stringify(identifier)}`);
    }

    // Validate booking can have seats assigned
    if (booking.status === 'CANCELLED') {
      throw new Error('Cannot assign seats to cancelled booking');
    }

    const assignedSeats = await assignSeatsToBookingHelper(booking, seatCount, tx);

    // Fetch updated booking
    const updatedBooking = await tx.booking.findUnique({
      where: whereClause,
      include: {
        trip: { include: { route: true, bus: true } },
        seat: true,
        payment: true,
      }
    });

    return {
      booking: updatedBooking,
      assignedSeats,
      message: `Successfully assigned ${assignedSeats.length} seat(s) to booking`
    };
  });
};

/**
 * Function to get available seats for a booking's trip
 * @param {string|number} identifier - booking identifier
 * @param {Object} db - database client
 * @returns {Object} - available seats information
 */
const getAvailableSeatsForBooking = async (identifier, db = prisma) => {
  const whereClause = typeof identifier === 'string'
    ? { bookingToken: identifier }
    : { id: identifier };

  const booking = await db.booking.findUnique({
    where: whereClause,
    include: {
      trip: { include: { bus: true, route: true } }
    }
  });

  if (!booking) {
    throw new Error(`Booking not found with identifier: ${JSON.stringify(identifier)}`);
  }

  const availableSeats = await db.seat.findMany({
    where: {
      tripId: booking.tripId,
      status: 'AVAILABLE',
      bookingId: null
    },
    orderBy: { seatNo: 'asc' }
  });

  const bookedSeats = await db.seat.findMany({
    where: {
      tripId: booking.tripId,
      status: 'BOOKED'
    },
    orderBy: { seatNo: 'asc' }
  });

  return {
    tripId: booking.tripId,
    route: `${booking.trip.route.origin} → ${booking.trip.route.destination}`,
    bus: {
      plateNo: booking.trip.bus.plateNo,
      busType: booking.trip.bus.busType,
      capacity: booking.trip.bus.capacity
    },
    availableSeats: availableSeats.map(s => ({
      id: s.id,
      seatNo: s.seatNo
    })),
    bookedSeats: bookedSeats.map(s => ({
      id: s.id,
      seatNo: s.seatNo,
      bookingId: s.bookingId
    })),
    totalAvailable: availableSeats.length,
    totalBooked: bookedSeats.length
  };
};

module.exports = {
  updateBookingService,
  assignSeatsManually,
  getAvailableSeatsForBooking
};

// ============================================================================
// CONTROLLER UPDATES - bookingController.js
// ============================================================================

const { updateBookingService, assignSeatsManually, getAvailableSeatsForBooking } = require('../services/bookingService');

/**
 * Enhanced controller method for updating bookings
 * PATCH /api/admin/bookings/:bookingToken
 */
const updateBooking = async (req, res) => {
  try {
    const { bookingToken } = req.params;
    const updateData = req.body;
    
    // Extract options from request
    const { autoAssignSeats = true, requiredSeats = 1, ...bookingData } = updateData;
    const options = { autoAssignSeats, requiredSeats };

    if (!bookingToken) {
      return res.status(400).json({
        success: false,
        message: 'Booking token is required'
      });
    }

    // Validate status if provided
    const validStatuses = ['DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED'];
    if (bookingData.status && !validStatuses.includes(bookingData.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status'
      });
    }

    // Call enhanced service
    const updatedBooking = await updateBookingService(bookingToken, bookingData, options);

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: {
        booking: updatedBooking,
        seats: updatedBooking.seat ? updatedBooking.seat.map(s => s.seatNo) : []
      }
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    
    // Handle specific errors
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Insufficient seats') || 
        error.message.includes('seat assignment failed') ||
        error.message.includes('Cannot assign seats')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error occurred while updating booking'
    });
  }
};

/**
 * Controller for manual seat assignment
 * PATCH /api/admin/bookings/:bookingToken/assign-seats
 */
const assignSeats = async (req, res) => {
  try {
    const { bookingToken } = req.params;
    const { seatCount = 1 } = req.body;

    if (!bookingToken) {
      return res.status(400).json({
        success: false,
        message: 'Booking token is required'
      });
    }

    if (seatCount < 1 || seatCount > 5) {
      return res.status(400).json({
        success: false,
        message: 'Seat count must be between 1 and 5'
      });
    }

    const result = await assignSeatsManually(bookingToken, seatCount);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        booking: result.booking,
        assignedSeats: result.assignedSeats
      }
    });

  } catch (error) {
    console.error('Error assigning seats:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Insufficient seats') || 
        error.message.includes('Cannot assign seats')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error occurred while assigning seats'
    });
  }
};

/**
 * Controller to get available seats for a booking
 * GET /api/admin/bookings/:bookingToken/available-seats
 */
const getAvailableSeats = async (req, res) => {
  try {
    const { bookingToken } = req.params;

    if (!bookingToken) {
      return res.status(400).json({
        success: false,
        message: 'Booking token is required'
      });
    }

    const seatsInfo = await getAvailableSeatsForBooking(bookingToken);

    res.json({
      success: true,
      data: seatsInfo
    });

  } catch (error) {
    console.error('Error fetching available seats:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching available seats'
    });
  }
};

exports = {
  updateBooking,
  assignSeats,
  getAvailableSeats
};