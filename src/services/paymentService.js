

// create
const createPayment = async(db = prisma) => {
    const paymentData = { amount, reference, method }
    const payment = await db.payment.create({
        data: paymentData
    })
}