import { processPaymentEvent, verifySignature } from "../services/paystackWebhook.js"


export const handlePaystackWebhook = async (req, res) => {
    const signatureValid = verifySignature(req);
    console.log('Webhook called', req);

    if (!signatureValid) {
        console.log('Invalid signature')
        return res.status(400).send('Invalid signature');        
    }

    const event = req.body;

    if (event.event === 'charge.success') {
        console.log('Webhook event data:', event.data)
        await processPaymentEvent(event.data)
    }

    res.status(200).send('Webhook received');
};

