import mysql from "mysql";
import config from "./Server.config.json" assert { type: "json" };

console.clear();

console.log(config);
// Connect to your database
var pool = mysql.createPool(config);
pool.getConnection(function (err, connection) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  // do whatever you want with your connection here
  console.log("connected");
  connection.release();
});
