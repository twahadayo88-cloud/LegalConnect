const db = require("./config/db");
async function run() {
    const [cols] = await db.query("DESCRIBE users");
    console.log(cols.map(c => c.Field).join(", "));
    process.exit();
}
run();
