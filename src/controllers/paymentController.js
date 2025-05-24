// Send a post request to initialize transaction
const handleInitializeTransaction = async(req, res) => {
    const { email, amount, bookingId } = req.body;
    
    try {
       const initialize = await axios.post('https://api.paystack.co/transaction/initialize', 
        {
            email:  email, 
            amount: amount, 
            metadata: {
                bookingId,
            }
        },
        {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
            'Content-type': 'application/json'
        })

        await db.payment.create()

        res.status(200).json({
        message: 'Transaction initilalized',
        status: 'success',
        data: initialize.data.data
       })
    } catch (error) {
        console.error('Paystack Init Error:', error?.response?.data || error.message);
        res.status(500).json({ message: 'Transaction initialization failed', error: error?.initialize?.data || error.message})
    }
}
// Send a post request to verify transaction
const handleVerifyTransaction = async(req, res) => {
    const { reference } = req.params;

    try {
        const verifyTransaction = await axios.get(`https://api.paystack.co/transaction/verify${reference}`, 
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`}
            }
        )

        
        const { status, data: txn } = verifyTransaction.data;

        if (!status) {
            return res.status(502).json({ message: 'Gateway error verifying transaction' });
        }

        if (txn.status === 'sucecsss') {
            res.status(200).json({ message: 'Payment verified successfully', data: txn });
        } else {
            res.status(400).json({ message: 'Payment failed', data: txn });
        }
    } catch (error) {
        console.error("verification error: ", error?.response?.data || error.message);
        return res.status(500).json({ error: 'Verrirfication Error' })
    }
}

export {
    handleVerifyTransaction,
    handleInitializeTransaction,
}