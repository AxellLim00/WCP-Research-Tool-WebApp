import sql from "mssql";
import config from "../../Server.config.json" assert { type: "json" };
const sqlConfig = config.sql;

export async function getUsersProduct() {
  try {
    console.log("Connecting to SQL...");
    let pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Users...");
    let result = await pool.query(
      `SELECT Users.*,COUNT(Product.ID) AS 'ProductCount' 
      FROM Users 
      JOIN Product ON Users.UserID = Product.UserID 
      GROUP BY Users.UserID, Users.Team;`
    );
    console.log("Got Users");
    pool.close();
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "error",
      error: err,
    };
  }
}

export async function getProduct() {
  try {
    console.log("Connecting to SQL...");
    let pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Product...");
    let result = await pool.query("SELECT * FROM Product");
    console.log("Got Product");
    pool.close();
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "error",
      error: err,
    };
  }
}

export async function getOem(productID) {
  try {
    console.log("Connecting to SQL...");
    let pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Oems...");
    let result = await pool.query(
      `SELECT OEM FROM Oem 
      JOIN Product on Oem.ProductID = Product.ID
      WHERE Product.ResearchID = ${productID} 
        OR Product.SKU = ${productID}`
    );
    console.log("Got Oem");
    pool.close();
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "error",
      error: err,
    };
  }
}

export async function getAltIndex(productID) {
  try {
    console.log("Connecting to SQL...");
    let pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Alt Indexes...");
    let result = await pool.query(
      `SELECT AlternateIndex.*, Supplier.SupplierName, Supplier.Currency 
      FROM AlternateIndex 
      JOIN Product ON AlternateIndex.ProductID = Product.ID 
      JOIN Supplier ON AlternateIndex.SupplierNumber = Supplier.SupplierNumber 
      WHERE Product.ResearchID = ${productID} OR Product.SKU = ${productID}`
    );
    console.log("Got Alt Index");
    pool.close();
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "error",
      error: err,
    };
  }
}

export async function getKeyType(productID) {
  try {
    console.log("Connecting to SQL...");
    let pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting KTypes...");
    let result = await pool.query(
      `SELECT KeyType
      FROM KeyType 
      JOIN Product ON KeyType.ProductID = Product.ID 
      WHERE Product.ResearchID = ${productID} OR Product.SKU = ${productID}`
    );
    console.log("Got KType");
    pool.close();
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "error",
      error: err,
    };
  }
}
