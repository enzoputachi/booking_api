import axios from "axios";
import pathFinder from './../utils/pathFinder.js';

pathFinder()

// Send a post request to initialize transaction
const initializePaystackTransaction = async(payload) => {
    const { email, amount, bookingId } = payload
    
    try {
       const response = await axios.post('https://api.paystack.co/transaction/initialize', 
        {
            email:  email, 
            amount: amount, 
            metadata: {
                bookingId,
            }
        },
        {
            headers: { 
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` 
            },
            'Content-type': 'application/json'
        })

        return {
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference,
        };
    } catch (error) {
        console.error('Paystack Init Error:', error?.response?.data || error.message);
        throw new Error('Transaction initialization failed');    
    }
}


// Send a post request to verify transaction
const verifyPaystackTransaction = async(reference) => {

    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, 
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`}
            }
        )

        
        const { status, data } = response.data;

        if (!status) {
            throw new Error('Gateway error verifying transaction');
        }

        if (data.status === 'success') {
            return { verified: true, data }
        } else {
            return { verified: false, data };
        }
    } catch (error) {
        console.error("verification error: ", error?.response?.data || error.message);
        throw new Error('Verification failed');
    }
}

export {
    verifyPaystackTransaction,
    initializePaystackTransaction,
}