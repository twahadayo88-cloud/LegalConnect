const db = require("./config/db");

async function checkDb() {
    try {
        const [tables] = await db.query("SHOW TABLES");
        console.log("TABLES:", JSON.stringify(tables));

        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [columns] = await db.query(`DESCRIBE ${tableName}`);
            console.log(`COLUMNS FOR ${tableName}:`, JSON.stringify(columns));
        }
    } catch (err) {
        console.error("DEBUG ERROR:", err.message);
    } finally {
        process.exit();
    }
}

checkDb();
