const { db } = require('./lib/db');

async function main() {
    try {
        await db.$connect();
        console.log("Successfully connected to the database");
        await db.$disconnect();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
