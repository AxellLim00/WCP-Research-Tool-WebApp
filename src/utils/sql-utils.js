import sql from "mssql/msnodesqlv8.js";
import config from "./Server.config.json" assert { type: "json" };

const sqlConfig = config.sql;
console.log(sqlConfig);

sql.on("error", (err) => {
  console.log("Error in SQL*:", err);
});

// Connect to your database
(async () => {
  try {
    console.log("Connecting to Server...");
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().query("select * from Product");
    console.log(result);
    pool.close();
  } catch (error) {
    console.log("Error in SQL request:", error);
  }
})();
