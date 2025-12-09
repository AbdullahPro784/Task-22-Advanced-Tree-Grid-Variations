import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DATA = [
    {
        id: "1306811",
        serial: "123456789",
        category: "Cups",
        brand: "Kärcher",
        type: "CoffeCup",
        vehicle: "-",
        status: { state: "maintenance", level: 2 },
    },
    {
        id: "1306700",
        serial: "Meiners",
        category: "Floor Scrubber",
        brand: "Tennant",
        type: "Tennant - T7 - Floor Scrubber",
        vehicle: "-",
        status: { state: "maintenance", level: 1 },
    },
    {
        id: "1306666",
        serial: "Daily Check",
        category: "Staubsauger",
        brand: "AVANT",
        type: "CP030",
        vehicle: "-",
        status: { state: "operational" },
    },
    {
        id: "1302986",
        serial: "123123123",
        category: "Öl",
        brand: "Junkers",
        type: "Heizung",
        vehicle: "-",
        status: { state: "operational" },
    },
    {
        id: "1302496",
        serial: "682528",
        category: "Glassware",
        brand: "Cuppo",
        type: "Cup",
        vehicle: "-",
        status: { state: "repair", level: 1 },
    },
    {
        id: "1300903",
        serial: "600009",
        category: "Welding Machines",
        brand: "Miller",
        type: "Maxstar 200",
        vehicle: "-",
        status: { state: "maintenance", level: 4 },
    },
    {
        id: "1296312",
        serial: "618162",
        category: "Paperware",
        brand: "SHERPA",
        type: "Block",
        vehicle: "-",
        status: { state: "maintenance", level: 2 },
    },
    {
        id: "1296260",
        serial: "44444444",
        category: "Walk-Behind Scrubber",
        brand: "Nilfisk",
        type: "B2037",
        vehicle: "-",
        status: { state: "inspection", level: 1 },
    },
    {
        id: "1296258",
        serial: "123321123",
        category: "Walk-Behind Scrubber",
        brand: "Nilfisk",
        type: "B2037",
        vehicle: "-",
        status: { state: "maintenance", level: 1 },
    },
    {
        id: "1296218",
        serial: "67687",
        category: "Stifte",
        brand: "Calligraph",
        type: "Stift",
        vehicle: "-",
        status: { state: "operational" },
    },
    {
        id: "1296033",
        serial: "111111111",
        category: "Computer",
        brand: "Apple",
        type: "Macbook Pro 13 Zoll",
        vehicle: "-",
        status: { state: "repair", level: 1 },
    },
    {
        id: "1295996",
        serial: "294758792hj",
        category: "Attachment",
        brand: "AVANT",
        type: "Collecting Lawn Mower 1500",
        vehicle: "-",
        status: { state: "maintenance", level: 1 },
    },
    {
        id: "1295995",
        serial: "1395839HDS",
        category: "Loader",
        brand: "AVANT",
        type: "e-series",
        vehicle: "-",
        status: { state: "maintenance", level: 1 },
    },
    {
        id: "1295994",
        serial: "1397593HGD",
        category: "Avant Hoflader",
        brand: "AVANT",
        type: "745",
        vehicle: "-",
        status: { state: "maintenance", level: 2 },
    },
]

async function main() {
    console.log('Start seeding ...')
    for (const item of DATA) {
        const result = await prisma.item.upsert({
            where: { id: item.id },
            update: {
                serial: item.serial,
                category: item.category,
                brand: item.brand,
                type: item.type,
                vehicle: item.vehicle,
                statusState: item.status.state,
                statusLevel: item.status.level ?? null,
            },
            create: {
                id: item.id,
                serial: item.serial,
                category: item.category,
                brand: item.brand,
                type: item.type,
                vehicle: item.vehicle,
                statusState: item.status.state,
                statusLevel: item.status.level ?? null,
            },
        })
        console.log(`Upserted item with id: ${result.id}`)
    }
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
