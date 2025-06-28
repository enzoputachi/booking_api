import { getDashboardStats } from "../services/dashboardStats.js";


export const handleGetDashboardStats = async (req, res) => {
    try {
        const stats = await getDashboardStats();
        res.status(200).json({
            message: "Dashboard stats fetched successfully",
            status: "success",
            data: stats,
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error.message);
        res.status(500).json({
            message: "Failed to fetch dashboard stats",
            error: error.message,
        });
    }
}