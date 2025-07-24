import pathFinder from '../utils/pathFinder.js';
import { sendEmail } from '../services/mailService.js';
import dotenv  from 'dotenv';
dotenv.config()
pathFinder()


const handleSupport = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !phone || !message) {
            return res.status(400).json({ error: "Missing required fields"})
        }

        await sendEmail(
            "supportMessage",
            process.env.FROM_EMAIL,
            {
                name,
                email,
                phone,
                subject,
                message,
                submittedAt: new Date()
            }
        );

        res.status(200).json({ success: true, message: "Message sent successfully." })

    } catch (error) {
        console.error("Error sending contact message:", err);
        res.status(500).json({ error: "Failed to send message" });
    }
}

export default handleSupport;
