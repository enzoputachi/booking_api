import { processPaymentEvent, verifySignature } from "../services/paystackWebhook.js"


export const handlePaystackWebhook = async (req, res) => {
    const signatureValid = verifySignature(req);

    if (!signatureValid) {
        return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
        await processPaymentEvent(event.data)
    }

    res.status(200).send('Webhook received');
};

