import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import prisma from '../models/index.js';

export const generateTicketPDF = async (bookingToken, res) => {

  const booking = await prisma.booking.findUnique({
    where: { bookingToken },
    include: {
      trip: {
        include: {
          route: true,
        }
      },
      seat: true,
    }
  })

  if (!booking) throw new Error('Booking not found');

  if (!booking.trip) throw new Error("Missing trip");
  if (!booking.seat) throw new Error("Missing seat");

  // ─── Destructure ───
  const {
    trip,
    seat,
    passengerName,
    isSplitPayment,
    email,
    mobile,
    amountDue,
    amountPaid,
    id
  } = booking;

  const { code: tripCode, departTime, route } = trip;
  const { origin, destination } = route;
  const seatNumbers = seat.map(s => s.seatNo).join(', ');
  const isSplit = isSplitPayment ? 'SPLIT' : 'FULL';

  // ─── Setup ───────────────────────────────────────────────────────────
  // Custom page size: 3 inches wide x 8 inches tall (216 x 576 points)
  const doc = new PDFDocument({ 
    size: [216, 576], 
    margins: { top: 10, left: 10, right: 10, bottom: 10 } 
  });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${bookingToken}.pdf"`)
  doc.pipe(res);

  // ─── Colors ──────────────────────────────────────────────────────────
  const black = '#000000';

  // ─── Helper Functions ────────────────────────────────────────────────
  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName} ${day} ${month} ${year}`;
  };

  const formatPrintDateTime = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const time = date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    return `${month} ${day}, ${year} - ${time}`;
  };

  // Helper function to add multi-line text and return the new Y position
  const addMultiLineText = (doc, text, x, y, options = {}) => {
    const textHeight = doc.heightOfString(text, options);
    doc.text(text, x, y, options);
    return y + textHeight;
  };

  const boardingTime = new Date(departTime);
  boardingTime.setMinutes(boardingTime.getMinutes() - 30);
  const formattedBoardingTime = boardingTime.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });

  // ─── Header Section ──────────────────────────────────────────────────
  let currentY = 15;

  // Company name - centered and bold
  doc.fillColor(black)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('CORPERS DRIVE', 0, currentY, { align: 'center', width: doc.page.width });

  currentY += 15;

  doc.text('BUS TICKET', 0, currentY, { align: 'center', width: doc.page.width });

  currentY += 18;

  // Address and phone - centered
  doc.font('Helvetica')
    .fontSize(8)
    .text('TRANSPORT COMPANY', 0, currentY, { align: 'center', width: doc.page.width });

  currentY += 12;

  doc.text('Tel: Contact Info', 0, currentY, { align: 'center', width: doc.page.width });

  currentY += 20;

  // ─── Ticket Details Section ──────────────────────────────────────────
  const leftMargin = 10;
  const textWidth = 196;
  const sectionSpacing = 3;

  // Trip code
  doc.font('Helvetica-Bold')
    .fontSize(10);
  currentY = addMultiLineText(doc, `Trip Code: ${tripCode}`, leftMargin, currentY, { width: textWidth });
  currentY += sectionSpacing;

  // Route - separate From and To on different lines
  doc.font('Helvetica-Bold')
    .fontSize(10);
  currentY = addMultiLineText(doc, `From: ${origin}`, leftMargin, currentY, { width: textWidth });
  currentY += 3;
  currentY = addMultiLineText(doc, `To: ${destination}`, leftMargin, currentY, { width: textWidth });
  currentY += sectionSpacing;

  // Seat numbers
  currentY = addMultiLineText(doc, `Seat: ${seatNumbers}`, leftMargin, currentY, { width: textWidth });
  currentY += sectionSpacing;

  // Passenger name with label
  doc.font('Helvetica-Bold')
    .fontSize(10);
  currentY = addMultiLineText(doc, 'Passenger Name:', leftMargin, currentY, { width: textWidth });
  currentY += 2;
  doc.font('Helvetica')
    .fontSize(10);
  currentY = addMultiLineText(doc, passengerName?.toUpperCase() || 'N/A', leftMargin, currentY, { width: textWidth });
  currentY += sectionSpacing;

  // Phone with label
  if (mobile) {
    doc.font('Helvetica-Bold')
      .fontSize(10);
    currentY = addMultiLineText(doc, 'Phone:', leftMargin, currentY, { width: textWidth });
    currentY += 2;
    doc.font('Helvetica')
      .fontSize(10);
    currentY = addMultiLineText(doc, mobile, leftMargin, currentY, { width: textWidth });
    currentY += sectionSpacing;
  }

  // Email with label
  if (email) {
    doc.font('Helvetica-Bold')
      .fontSize(10);
    currentY = addMultiLineText(doc, 'Email:', leftMargin, currentY, { width: textWidth });
    currentY += 2;
    doc.font('Helvetica')
      .fontSize(10);
    currentY = addMultiLineText(doc, email, leftMargin, currentY, { width: textWidth });
    currentY += sectionSpacing;
  }

  // Amount Due
  doc.font('Helvetica-Bold')
    .fontSize(10);
  currentY = addMultiLineText(doc, `AMOUNT DUE: NGN${amountDue}`, leftMargin, currentY, { width: textWidth });
  currentY += sectionSpacing;

  // Amount Paid
  if (amountPaid) {
    currentY = addMultiLineText(doc, `AMOUNT PAID: NGN${amountPaid}`, leftMargin, currentY, { width: textWidth });
    currentY += sectionSpacing;
  }

  // Payment Type
  currentY = addMultiLineText(doc, `PAYMENT TYPE: ${isSplit}`, leftMargin, currentY, { width: textWidth });
  currentY += sectionSpacing;

  // Departure date - handle long date text by wrapping
  const departureDate = formatDate(new Date(departTime));
  currentY = addMultiLineText(doc, `Departure Date: ${departureDate}`, leftMargin, currentY, { width: textWidth });
  currentY += sectionSpacing;

  // Boarding time
  currentY = addMultiLineText(doc, `Boarding Time: ${formattedBoardingTime}`, leftMargin, currentY, { width: textWidth });
  currentY += sectionSpacing;

  // Print date and time - handle long date/time text by wrapping
  const printDateTime = formatPrintDateTime(new Date());
  currentY = addMultiLineText(doc, `Print Date: ${printDateTime}`, leftMargin, currentY, { width: textWidth });
  currentY += 15;

  // ─── Terms and Conditions Section ───────────────────────────────────
  doc.font('Helvetica-Bold')
    .fontSize(9)
    .text('TERMS AND CONDITIONS', leftMargin, currentY, { width: 196 });
  currentY += 15;

  // Updated Terms and Conditions
  const termsAndConditions = [
    "1. Bookings are valid only after full payment. Tickets are non-transferable and expire 30 minutes after departure.",
    "2. Commitment fees are non-refundable. A 50% refund is possible if full payment was made.",
    "3. Arrive at least 30 minutes early with valid ID if required.",
    "4. Misconduct, smoking, alcohol, or drugs are strictly prohibited.",
    "5. Sprinter buses allow 10kg luggage per passenger; excess attracts extra fees.",
    "6. We are not liable for delays, missed trips, or lost items. Travel is at your own risk.",
    "7. Cancellations must be made 24 hours in advance. Refunds are at our discretion.",
    "8. Pickups in Ijebu-Ode, Shagamu, and IFE require full prepayment. Be punctual.",
    "9. Terms follow Nigerian law and FRSC guidelines.",
    "10. Use of our service means you accept all terms. Contact: corpersdrive@gmail.com or 08141241741."
  ];

  doc.font('Helvetica')
    .fontSize(7);

  termsAndConditions.forEach((condition, index) => {
    const textHeight = doc.heightOfString(condition, { width: 196 });
    
    // Check if we need a new page
    if (currentY + textHeight > doc.page.height - 20) {
      doc.addPage();
      currentY = 15;
    }
    
    doc.text(condition, leftMargin, currentY, { width: 196, align: 'justify' });
    currentY += textHeight + 6;
  });

  // ─── QR Code ─────────────────────────────────────────────────────────
  // try {
  //   const qrUrl = `${process.env.APP_URL}/api/verify/${bookingToken}`;
  //   const buffer = await QRCode.toBuffer(qrUrl, { width: 60 });
    
  //   // Add QR code at bottom if there's space
  //   if (currentY < doc.page.height - 70) {
  //     const qrSize = 50;
  //     const qrX = (doc.page.width - qrSize) / 2; // Center horizontally
  //     doc.image(buffer, qrX, currentY + 5, { width: qrSize, height: qrSize });
  //   }
  // } catch (err) {
  //   console.warn('QR Code generation failed:', err);
  //   // Add fallback text if QR fails
  //   if (currentY < doc.page.height - 30) {
  //     doc.fillColor('red').fontSize(8).text('QR Code Failed', leftMargin, currentY + 5);
  //   }
  // }

  // ─── Finalize ────────────────────────────────────────────────────────
  doc.end();
};