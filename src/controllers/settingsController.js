import { getCompanySettings, seedCompanySettings, updateCompanySettings } from "../services/settingsService.js";

const handleSeedCompanySettings = async(req, res) => {
    try {
        const settings = await seedCompanySettings();

        res.status(200).json({
            message: "Settings seeded successfully",
            status: "success",
            data: settings,
        })
    } catch (error) {
        console.error("Error seeding company settings:", error.message);
        res.status(500).json({
            message: "Error seeding company settings",
            error: error.message,
        })
    }
}

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

        console.log( "Here:", settingsId);
        

        // Validate the settingsId and updateData as needed
        if (!settingsId || !updateData) {
            return res.status(400).json({
                message: "Invalid request data",
                status: "error",
            });
        }

        // Call the service to update settings
        const updatedSettings = await updateCompanySettings(Number(settingsId), updateData);

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
    handleSeedCompanySettings,
};