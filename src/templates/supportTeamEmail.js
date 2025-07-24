import { format } from "date-fns";

export const templates = {
  // existing bookingConfirmation...

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
