import exportBookingsAsCVS from "../services/bookingExportService.js";




export  const handleExportBookings = async (req, res) => {
    console.log("Endpoint hit");
    
  try {
    // Validation
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
      tripId: req.query.tripId
    };

    // Generate CSV (much simpler now!)
    const csvContent = await exportBookingsAsCVS(filters);
    
    const filename = `booking-reports-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
};