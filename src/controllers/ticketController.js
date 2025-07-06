import { generateTicketPDF } from "../services/pdfService.js";


export const streamTicketPDF = async (req, res) => {
    const { bookingToken } = req.params;

    try {
        await generateTicketPDF(bookingToken, res)
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message });
    }
}