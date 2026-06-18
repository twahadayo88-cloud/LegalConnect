const db = require("./config/db");
async function run() {
    const [tables] = await db.query("SHOW TABLES");
    console.log(tables.map(t => Object.values(t)[0]).join(", "));
    process.exit();
}
run();
