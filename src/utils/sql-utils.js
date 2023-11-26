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

export async function getNewProduct() {
  try {
    console.log("Connecting to SQL...");
    let pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Unsaved Product...");
    let result = await pool.query(
      `SELECT *
      FROM NewProduct`
    );
    console.log("Got Unsaved Product");
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

/**
 * Insert User data into the database
 * @param {Object[]} userObject list of user object
 * @returns {String | Error} returns status, and message of success with numbers of successful row inserts, or an error when it fails
 */
export async function insertUser(userObjects) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new user...");
    let result = await pool.query(
      `INSERT INTO Users (UserID, Team)
      VALUES
        ${userObjects
          .map((user) => `('${user.UserID}', '${user.Team}')`)
          .join(",\n")};`
    );
    console.log("Inserted new user");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected} supplier.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "error",
      error: err,
    };
  } finally {
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert Supplier data into the database
 * @param {Object[]} supplierObject list of supplier object
 * @returns {int[] | Error} returns status, and message of success with numbers of successful row inserts OR an error when it fails
 */
export async function insertSupplier(supplierObjects) {
  try {
    console.log("Connecting to SQL...");
    let pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new supplier...");
    let result = await pool.query(
      `INSERT INTO Supplier (SupplierNumber, SupplierName, Currency)
      VALUES (${supplierObject.SupplierNumber}, ${supplierObject.SupplierName}, ${supplierObject.Currency})`
    );
    console.log("Inserted new supplier");
    pool.close();
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected} supplier.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "error",
      error: err,
    };
  }
}

/**
 * Insert Oem data into the database based on the Product ID specified
 * @param {string} productID product's id (SKU or Research ID) selected
 * @param {Object[]} oemSupplierPairs list of oem-supplier pair object
 * @returns {Object} returns status, and message of success with number of successful row inserts OR an error when it fails
 */
export async function InsertOemByProduct(productID, oemSupplierPairs) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new supplier...");
    let query = `DECLARE @productKey uniqueidentifier
      SET @productKey =
        (SELECT TOP 1 ID
          FROM Product
          WHERE Product.ResearchID = ${productID} OR Product.SKU = ${productID});
      
      INSERT INTO Oem (SupplierName, OEM, productID)
        VALUES
          ${oemSupplierPairs
            .map((pair) => `('${pair.supplier}', '${pair.oem}', @productKey)`)
            .join(",\n")};`;
    debugger;
    let result = await pool.query(query);
    console.log("Inserted new supplier");
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
  } finally {
    pool.close();
    console.log("Connection closed.");
  }
}

insertUser([
  { UserID: "Research User Test 1", Team: "Team Trial" },
  { UserID: "Research User Test 2", Team: "Team Trial" },
  { UserID: "Research User Test 3", Team: "Team Test" },
]);

// insertProduct([
//   {
//     UserID: "Research User Test 1",
//     ResearchID: "TEST-RID-0001",
//     SKU: "SKU-001",
//     Status: 0,
//     OemType: 0,
//     EstSales: 0,
//     Note: "This is a test note for a product.",
//     CostUsd: 9.99,
//     EstCostAud: 9.99,
//     EstSell: 9.99,
//     Postage: 9.99,
//     ExtGp: 5.0,
//     ePID: null,
//     LastUpdate: Date.now().toString(),
//   },
//   {
//     UserID: "Research User Test 2",
//     ResearchID: "TEST-RID-0002",
//     SKU: "SKU-002",
//     Status: 0,
//     OemType: 0,
//     EstSales: 0,
//     Note: "This is a test note for a product.",
//     CostUsd: 9.99,
//     EstCostAud: 9.99,
//     EstSell: 9.99,
//     Postage: 9.99,
//     ExtGp: 5.0,
//     ePID: null,
//     LastUpdate: Date.now().toString(),
//   },
//   {
//     UserID: "Research User Test 3",
//     ResearchID: "TEST-RID-0003",
//     SKU: "SKU-003",
//     Status: 0,
//     OemType: 0,
//     EstSales: 0,
//     Note: "This is a test note for a product.",
//     CostUsd: 9.99,
//     EstCostAud: 9.99,
//     EstSell: 9.99,
//     Postage: 9.99,
//     ExtGp: 5.0,
//     ePID: null,
//     LastUpdate: Date.now().toString(),
//   },
//   {
//     UserID: "Research User Test 1",
//     ResearchID: "TEST-RID-0004",
//     SKU: null,
//     Status: 0,
//     OemType: 0,
//     EstSales: 0,
//     Note: "This is a test note for a product.",
//     CostUsd: 9.99,
//     EstCostAud: 9.99,
//     EstSell: 9.99,
//     Postage: 9.99,
//     ExtGp: 5.0,
//     ePID: null,
//     LastUpdate: Date.now().toString(),
//   },
//   {
//     UserID: "Research User Test 3",
//     ResearchID: null,
//     SKU: "SKU-005",
//     Status: 0,
//     OemType: 0,
//     EstSales: 0,
//     Note: "This is a test note for a product.",
//     CostUsd: 9.99,
//     EstCostAud: 9.99,
//     EstSell: 9.99,
//     Postage: 9.99,
//     ExtGp: 5.0,
//     ePID: null,
//     LastUpdate: Date.now().toString(),
//   },
// ]);
