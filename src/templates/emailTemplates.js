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
  },
  
  supportMessage: ({ name, email, phone, subject, message, submittedAt }) => {
    const formattedDate = submittedAt
      ? format(new Date(submittedAt), 'PPPpp') // Optional: format if you provide a timestamp
      : format(new Date(), 'PPPpp');

    return {
      subject: `📩 New Contact Message: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="margin: 1em 0; padding: 1em; background: #f9f9f9; border-left: 4px solid #ccc;">
          ${message.replace(/\n/g, '<br/>')}
        </blockquote>
        <p><small>Submitted on ${formattedDate}</small></p>
      `
    };
  }
};
