import { format } from 'date-fns'; // If you're formatting the date

export const templates = {
  bookingConfirmation: ({ name, bookingToken, link, isSplitPayment, amountPaid, amountDue, origin, destination, departTime }) => {
    const paymentNote = isSplitPayment
      ? `<p><strong>Split Payment:</strong> You've paid ₦${amountPaid.toLocaleString()}, with ₦${amountDue.toLocaleString()} remaining. Please complete payment before your trip.</p>`
      : `<p><strong>Payment:</strong> Received in full. Thank you!</p>`;

    const tripDate = format(new Date(departTime), 'PPP'); // e.g., Jul 6, 2025
    const tripTime = format(new Date(departTime), 'p');   // e.g., 4:00 PM

    return {
      subject: `🎟️ Booking #${bookingToken} Confirmed`,
      html: `
        <h2>Hi ${name},</h2>
        <p>Your booking from <strong>${origin}</strong> to <strong>${destination}</strong> is confirmed.</p>
        <p><strong>Departure:</strong> ${tripDate} at ${tripTime}</p>
        ${paymentNote}
        <p><a href="${link}" style="text-decoration: underline; color: #007bff;">🎫 Download Your Ticket</a></p>
        <p>Travel safely and thank you for choosing <strong>Corpers Drive</strong>.</p>
      `
    };
  }
};
