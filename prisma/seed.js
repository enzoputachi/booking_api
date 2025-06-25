import prisma from "./index.js";

const main = async() => {

    const trip = await prisma.trip.create({
        data: {
            origin: 'Owerri',
            destination: "Enugu",
            departTime: new Date(),
            arriveTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000)
        }
    })

     // Create seats for the trip
    for (let i = 1; i <= 10; i++) {
        await prisma.seat.create({
        data: {
            seatNo: `S${i}`,
            status: 'available',
            tripId: trip.id,
        },
        });
    }


     // Create seats for the bus
     await prisma.bus.create({
        data: {
            plateNo: '123yt54',
            capacity: 10,
            tripId: trip.id,
        }
    });

    console.log('Data seeded!');
    
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() });