import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import prisma from '../models/index.js';
// import fs from 'fs';
// import path from 'path';

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
    email,
    mobile,
    // bookingToken,
    id
  } = booking;

  const { code: tripCode, departTime, route } = trip;
  const { origin, destination } = route;
  const { seatNo: seatNumber, gate } = seat;

  // ─── Setup ───────────────────────────────────────────────────────────
  // const ticketsDir = path.join(process.cwd(), 'tickets');
  // if (!fs.existsSync(ticketsDir)) fs.mkdirSync(ticketsDir);
  
  // const outputPath = path.join(ticketsDir, `${bookingToken}.pdf`);
  // const stream = doc.pipe(fs.createWriteStream(outputPath));
  const doc = new PDFDocument({ size: [800, 300], margins: { top: 0, left: 0, right: 0, bottom: 0 } });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${bookingToken}.pdf"`)
  doc.pipe(res);

  // ─── Colors ──────────────────────────────────────────────────────────
  const darkGray = '#333333';
  const mediumGray = '#666666';
  const lightGray = '#999999';
  const veryLightGray = '#e8e8e8';

  const boardingTime = new Date(departTime);
  boardingTime.setMinutes(boardingTime.getMinutes() - 30);
  const formattedBoardingTime = boardingTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  // ─── Helper Functions ────────────────────────────────────────────────
  const drawBusIcon = (x, y, size = 24) => {
  // Main bus body (rectangle)
  doc.rect(x, y + size * 0.2, size, size * 0.5)
    .fill(darkGray);
  
  // Front of bus (small rectangle)
  doc.rect(x + size, y + size * 0.25, size * 0.15, size * 0.4)
    .fill(darkGray);
  
  // Windows (3 small rectangles)
  doc.rect(x + size * 0.1, y + size * 0.3, size * 0.2, size * 0.15)
    .fill('white');
  doc.rect(x + size * 0.4, y + size * 0.3, size * 0.2, size * 0.15)
    .fill('white');
  doc.rect(x + size * 0.7, y + size * 0.3, size * 0.2, size * 0.15)
    .fill('white');
  
  // Front wheel
  doc.circle(x + size * 0.2, y + size * 0.8, size * 0.08)
    .fill(darkGray);
  
  // Back wheel
  doc.circle(x + size * 0.8, y + size * 0.8, size * 0.08)
    .fill(darkGray);
};


  // ─── Background Gradient Effect ──────────────────────────────────────
  doc.rect(0, 0, 800, 300).fill(veryLightGray);

  // ─── Main Content Section ────────────────────────────────────────────
  const mainWidth = 600;
  const stubWidth = 180;

  doc.rect(0, 0, mainWidth, 300).fill('#f5f5f5');

  doc.rect(5, 5, 790, 290)
    .fillOpacity(0.1)
    .fill(darkGray)
    .fillOpacity(1);

  // ─── Header ──────────────────────────────────────────────────────────
  doc.fillColor(darkGray)
    .font('Times-Bold')
    .fontSize(32)
    .text('BOARDING PASS', 20, 20);

  doc.fillColor(mediumGray)
    .font('Times-Roman')
    .fontSize(10)
    .text('Corpers Drive', 20, 55);

  doc.fillColor(darkGray)
    .font('Times-Bold')
    .fontSize(10)
    .text(`${origin.toUpperCase()}  ${destination.toUpperCase()}`, 380, 25, { width: 160, align: 'left' });

  // ─── Passenger Info ──────────────────────────────────────────────────
  const passengerY = 85;

  doc.fillColor(mediumGray)
    .fontSize(9)
    .text('PASSENGER', 20, passengerY);
  doc.fillColor(darkGray)
    .font('Times-Bold')
    .fontSize(14)
    .text(passengerName?.toUpperCase() || 'JOHN DOE', 20, passengerY + 12, { width: 160, align: 'left' });

  doc.fillColor(mediumGray)
    .fontSize(9)
    .text('BOARDING TIME', 200, gateY);
  doc.fillColor(darkGray)
    .font('Times-Bold')
    .fontSize(20)
    .text(formattedBoardingTime, 200, gateY + 12);

  // doc.fillColor(mediumGray)
  //   .fontSize(9)
  //   .text('BUS', 200, passengerY);
  // doc.fillColor(darkGray)
  //   .font('Times-Bold')
  //   .fontSize(14)
  //   .text(tripCode || 'AV 1A9', 200, passengerY + 12);

  const tripDate = new Date(departTime);
  const formattedDate = `${String(tripDate.getDate()).padStart(2, '0')} ${tripDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${tripDate.getFullYear()}`;

  doc.fillColor(mediumGray)
    .fontSize(9)
    .text('DATE', 340, passengerY);
  doc.fillColor(darkGray)
    .font('Times-Bold')
    .fontSize(14)
    .text(formattedDate, 340, passengerY + 12);

  doc.fillColor(mediumGray)
    .fontSize(9)
    .text('SEAT', 500, passengerY);
  doc.fillColor(darkGray)
    .font('Times-Bold')
    .fontSize(14)
    .text(seatNumber || '2A', 500, passengerY + 12);

  // ─── Large Route Display ─────────────────────────────────────────────
  const destinationY = 140;

  doc.fillColor(darkGray)
    .font('Times-Bold')
    .fontSize(14)
    .text(origin.toUpperCase(), 20, destinationY, { width: 200, align: 'left' });

  // drawAirplaneIcon(240, destinationY + 10);

  doc.fontSize(14)
    .text(destination.toUpperCase(), 290, destinationY, { width: 200, align: 'left' });

  // ─── Gate & Boarding ─────────────────────────────────────────────────
  const gateY = 220;


  // doc.fillColor(mediumGray)
  //   .fontSize(9)
  //   .text('GATE', 20, gateY);
  // doc.fillColor(darkGray)
  //   .font('Times-Bold')
  //   .fontSize(20)
  //   .text(gate || '25A', 20, gateY + 12);


  // ─── Divider ─────────────────────────────────────────────────────────
  doc.dash(3, { space: 5 })
    .moveTo(mainWidth, 0)
    .lineTo(mainWidth, 300)
    .strokeColor(lightGray)
    .lineWidth(2)
    .stroke()
    .undash();

  // ─── Stub ────────────────────────────────────────────────────────────
  const stubX = mainWidth + 10;
  const stubInfoY = 60;
  const stubSpacing = 35;

  doc.fillColor(darkGray)
    .font('Times-Bold')
    .fontSize(7)
    .text(`${origin.toUpperCase()} to ${destination.toUpperCase()}`, stubX, 20, { width: 160, align: 'left' });

  doc.fillColor(mediumGray).fontSize(8).text('PASSENGER', stubX, stubInfoY);
  doc.fillColor(darkGray).font('Times-Bold').fontSize(10).text(passengerName.toUpperCase(), stubX, stubInfoY + 10, { width: 160, align: 'left' });

  // doc.fillColor(mediumGray).fontSize(8).text('FLIGHT', stubX, stubInfoY + stubSpacing);
  // doc.fillColor(darkGray).font('Times-Bold').fontSize(10).text(tripCode, stubX, stubInfoY + stubSpacing + 10);

  doc.fillColor(mediumGray).fontSize(8).text('SEAT', stubX, stubInfoY + stubSpacing * 2);
  doc.fillColor(darkGray).font('Times-Bold').fontSize(10).text(seatNumber, stubX, stubInfoY + stubSpacing * 2 + 10);

  doc.fillColor(mediumGray).fontSize(8).text('DATE', stubX, stubInfoY + stubSpacing * 3);
  doc.fillColor(darkGray).font('Times-Bold').fontSize(10).text(formattedDate, stubX, stubInfoY + stubSpacing * 3 + 10);

  // doc.fillColor(mediumGray).fontSize(8).text('GATE', stubX, stubInfoY + stubSpacing * 4);
  // doc.fillColor(darkGray).font('Times-Bold').fontSize(10).text(gate, stubX, stubInfoY + stubSpacing * 4 + 10);

  // ─── QR Code ─────────────────────────────────────────────────────────
  try {
    const qrUrl = `${process.env.APP_URL}/verify/${bookingToken}`;
    const buffer = await QRCode.toBuffer(qrUrl, { width: 100 });
    doc.image(buffer, 700, 180, { width: 80, height: 80 });
  } catch (err) {
    doc.fillColor('red').fontSize(10).text('QR Code Failed', 650, 260);
  }

  // ─── Finalize ────────────────────────────────────────────────────────
  doc.end();
  
  // await new Promise((resolve, reject) => {
  //   stream.on('finish', resolve);
  //   stream.on('error', reject);
  // });

  // return { path: outputPath, exists: fs.existsSync(outputPath) };
};