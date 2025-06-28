import { getCompanySettings, updateCompanySettings } from "../services/settingsService.js";

const handleGetCompanySettings = async(req, res) => {
    try {
        // Call the service to get all settings
        const settings = await getCompanySettings();

        res.status(200).json({
            message: "Settings fetched successfully",
            status: "success",
            data: settings,
        });
    } catch (error) {
        console.error("Error fetching settings:", error.message);
        res.status(500).json({
            message: "Settings fetching failed",
            error: error.message,
        });
    }
}

const handleUpdateCompanySettings = async (req, res) => {
    try {
        const { settingsId } = req.params;
        const updateData = req.body;

        // Validate the settingsId and updateData as needed
        if (!settingsId || !updateData) {
            return res.status(400).json({
                message: "Invalid request data",
                status: "error",
            });
        }

        // Call the service to update settings
        const updatedSettings = await updateCompanySettings(updateData);

        res.status(200).json({
            message: "Settings updated successfully",
            status: "success",
            data: updatedSettings,
        });
    } catch (error) {
        console.error("Error updating settings:", error.message);
        res.status(500).json({
            message: "Settings update failed",
            error: error.message,
        });
    }
}

export {
    handleUpdateCompanySettings,
    handleGetCompanySettings,
};