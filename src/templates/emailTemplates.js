export const templates = {
    bookingConfirmation: ({ name, bookingToken, link, isSplitPayment }) => {
        const paymentNote = isSplitPayment 
        ? '<p>Note: You have chosen split payment. Please complete the remaining payment before travel.</p>'
        : '<p>Your payment has been received in full.</p>';

        return {
            subject: `🎟️ Booking #${bookingToken} Confirmed`,
            html: `
                <h2>Hello ${name},</h2>
                <p>Your seat is secured! Download your ticket here:</p>
                <a href="${link}">Download PDF Ticket</a>
                ${paymentNote}
                <p>Thank you for choosing us.</p>
            ` 
        }
    }
}