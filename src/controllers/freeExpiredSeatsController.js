import { freeExpiredSeatsService } from "../jobs/freeExpiredSeats.js";



export const handleFreeExpired = async (req, res) => {
   console.log('function called')
    try {
      const freedCount = await freeExpiredSeatsService();

      res.status(200).json({
        success: true,
        message: `Successfully freed ${freedCount} expired seat(s)`,
        data: {
          freedSeats: freedCount,
        },
      });
    } catch (error) {
      console.error("Error freeing expired seats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to free expired seats",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
}