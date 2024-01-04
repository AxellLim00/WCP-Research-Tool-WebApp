import sql from "mssql";
import config from "../../Server.config.json" assert { type: "json" };
const sqlConfig = config.sql;
const ValueDictionary = {
  Status: {
    0: "research",
    research: 0,
    1: "waiting",
    waiting: 1,
    2: "costDone",
    costDone: 2,
    3: "approval",
    approval: 3,
    4: "pinnacle",
    pinnacle: 4,
    5: "peach",
    peach: 5,
    6: "catalogue",
    catalogue: 6,
    "": "NULL",
    NULL: "",
  },
  OemType: {
    0: "aftermarket",
    aftermarket: 0,
    1: "genuine",
    genuine: 1,
    "": "NULL",
    NULL: "",
  },
  Quality: {
    0: "good",
    good: 0,
    1: "normal",
    normal: 1,
    2: "bad",
    bad: 2,
    "": "NULL",
    NULL: "",
  },
};

/**
 * Get all Users and their Product Counts saved in the SQL Database.
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of {UserID, Team, Count} object OR Error Object.
 */
export async function getUsersProduct() {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    console.log("Getting Users...");
    let query = `SELECT Users.*,COUNT(Product.ID) AS 'ProductCount' 
      FROM Users 
      LEFT JOIN Product ON Users.UserID = Product.UserID 
      GROUP BY Users.UserID, Users.Team;`;
    let result = await pool.query(query);
    console.log("Got Users");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all Products saved in the SQL Database.
 * @returns {Object | } Status ("OK" or "ERROR"), and List of Product object according to Product Table Columns OR Error Object.
 */
export async function getProduct(productID) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Product...");
    let query = "SELECT * FROM Product";
    if (productID) {
      query += ` WHERE ResearchID = '${productID}' OR SKU = '${productID}'`;
    }
    const result = await pool.query(query);
    console.log("Got Product");
    console.log("Result: ", result.rowsAffected);
    // Translate SQL int to DataTable Value
    result.recordset.forEach((row, idx) => {
      result.recordset[idx].OemType = ValueDictionary.OemType[row.OemType];
      result.recordset[idx].Status = ValueDictionary.Status[row.Status];
    });
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all New Product Information saved in the SQL Database (These are Product info that has not been saved to Pinnacle yet).
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of NewProduct object according to NewProduct Table Columns OR Error Object.
 */
export async function getNewProduct() {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Unsaved Product...");
    let result = await pool.query(`SELECT * FROM NewProduct`);
    console.log("Got Unsaved Product");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all Oems saved in the SQL Database based on a product.
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of Oem object according to Oem Table Columns OR Error Object.
 */
export async function getOem(productID) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Oems...");
    let query = `SELECT Oem, SupplierNumber, Product.ResearchID, Product.SKU 
      FROM Oem 
      JOIN Product on Oem.ProductID = Product.ID
      WHERE Product.ResearchID = '${productID}' 
        OR Product.SKU = '${productID}'`;
    if (productID === "All")
      query = `SELECT Oem, SupplierNumber, Product.ResearchID, Product.SKU 
        FROM Oem
        JOIN Product on Oem.ProductID = Product.ID`;
    const result = await pool.query(query);
    console.log("Got Oem");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all Supplier saved in the SQL Database.
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of Oem object according to Oem Table Columns OR Error Object.
 */
export async function getSupplier() {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Supplier...");
    let result = await pool.query(`SELECT * FROM Supplier;`);
    console.log("Got Supplier");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Retrieves alternate indexes from the database based on the provided product ID and optional supplier number.
 * @param {string} productID - The ID or SKU of the product.
 * @param {string} supplierNumber - The supplier number (optional).
 * @returns {Promise<{status: string, result: Array}>} - The status and result of the query.
 */
export async function getAltIndex(productID, supplierNumber = "") {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Alt Indexes...");
    let query = `SELECT AlternateIndex.*, Supplier.SupplierName, Supplier.Currency, Product.ResearchID, Product.SKU 
      FROM AlternateIndex 
      JOIN Product ON AlternateIndex.ProductID = Product.ID 
      JOIN Supplier ON AlternateIndex.SupplierNumber = Supplier.SupplierNumber`;
    if (productID !== "All")
      query += ` WHERE Product.ResearchID = '${productID}' OR Product.SKU = '${productID}'`;
    if (supplierNumber) {
      query +=
        productID === "All"
          ? ` WHERE AlternateIndex.SupplierNumber = '${supplierNumber}'`
          : ` AND AlternateIndex.SupplierNumber = '${supplierNumber}'`;
    }
    const result = await pool.query(query);
    console.log("Got Alt Index");
    console.log("Result: ", result.rowsAffected);
    result.recordset.forEach(
      (row, idx) =>
        (result.recordset[idx].Quality = ValueDictionary.Quality[row.Quality])
    );
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all Key Type (KType) saved in the SQL Database based on a product.
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of KType object according to KeyType Table Columns OR Error Object.
 */
export async function getKeyType(productID) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    const query = `SELECT KeyType
      FROM KeyType 
      JOIN Product ON KeyType.ProductID = Product.ID 
      WHERE Product.ResearchID = '${productID}' OR Product.SKU = '${productID}'`;
    console.log("Getting KTypes...");
    const result = await pool.query(query);
    console.log("Got KType");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all EPID (eBay Product ID) saved in the SQL Database based on a product.
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of KType object according to KeyType Table Columns OR Error Object.
 */
export async function getEpid(productID) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    const query = `SELECT EPID
      FROM EPID 
      JOIN Product ON EPID.ProductID = Product.ID 
      WHERE Product.ResearchID = '${productID}' OR Product.SKU = '${productID}'`;
    console.log("Getting ePID...");
    const result = await pool.query(query);
    console.log("Got ePID");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      result: result.recordset,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts new Users into the database.
 * @param {Array} changeObjArray - An array of objects containing Changes to be made.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function insertUser(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new user...");
    let result = await pool.query(
      `INSERT INTO Users (UserID, Team)
      VALUES
        ${changeObjArray
          .map((changeObj) =>
            changeObj.Changes.map(
              (user) => `('${user.UserID}', '${user.Team}')`
            )
          )
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
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts product details into the database.
 * @param {Array} changeObjArray - An array of objects containing Changes to be made.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function insertProduct(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `INSERT INTO Product (ID, UserID, ResearchID, SKU, Status, OemType, LastUpdate)
      VALUES
        ${changeObjArray
          .map((changeObj) =>
            changeObj.Changes.map(
              (product) =>
                `(NEWID(), '${changeObj.User}', 
              ${product.Id ? "'" + product.Id + "'" : "NULL"}, 
              ${product.Sku ? "'" + product.Sku + "'" : "NULL"}, 
              ${ValueDictionary.Status[product.Status]}, 
              ${ValueDictionary.OemType[product.Oem]}, 
              '${product.LastUpdate}')`
            )
          )
          .join(",\n")};`;

    console.log("Inserting product details...");
    const result = await pool.query(query);
    console.log("Inserted product details");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected} product.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts new product information into the database.
 * @param {Array} changeObjArray - An array of objects containing the Changes to be made.
 * @returns {Object} - An object containing the status and message of the operation.
 */
export async function insertNewProduct(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `INSERT INTO Product (ID, UserID, ResearchID, SKU, Status, OemType, LastUpdate)
      VALUES
        ${changeObjArray
          .map((changeObj) =>
            changeObj.Changes.map(
              (product) =>
                `(NEWID(), '${changeObj.User}', 
                '${product.Id}', 
              ${product.Sku ? "'" + product.Sku + "'" : "NULL"}, 
              ${ValueDictionary.Status[product.Status]}, 
              ${ValueDictionary.OemType[product.Oem]}, 
              '${new Date().toISOString().slice(0, 19).replace("T", " ")}')`
            )
          )
          .join(",\n")};
      INSERT INTO NewProduct (ResearchID, Make, Model, PartType, IcNumber, IcDescription, ProductID, PartTypeCode, Request, RequestNF, UnitSold, AveragePrice)
      VALUES
        ${changeObjArray
          .map((changeMap) =>
            changeMap.Changes.map(
              (product) =>
                `('${product.Id}', 
                '${product.Make}', '${product.Model}', 
                '${product.Type}', 
              '${product.Num}', '${product.Desc}', 
              (SELECT TOP 1 ID 
                FROM Product 
                WHERE ResearchID = '${product.Id}'),
              '${product.TypeCode}', 0, 0, 0, 0)`
            )
          )
          .join(",\n")};`;
    // console.log(query);
    // debugger;

    console.log("Inserting new product information...");
    const result = await pool.query(query);
    console.log("Inserted new product information");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected[0]} product.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts a new supplier into the database.
 * @param {Array} changeObjArray - An array of objects representing the Changes to be made.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function insertSupplier(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new supplier...");
    const query = `INSERT INTO Supplier (SupplierNumber, SupplierName, Currency)
      VALUES 
      ${changeObjArray
        .map((changeObj) =>
          changeObj.Changes.map(
            (supplier) =>
              `('${supplier.SupplierNumber}', '${supplier.SupplierName}', '${supplier.Currency}')`
          )
        )
        .join(",\n")};`;
    const result = await pool.query(query);
    console.log("Inserted new supplier");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected} supplier.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts OEMs by product into the database.
 * @param {Array<Object>} changeObjArray - An array of objects representing the Changes to be made.
 * Each object should have the following properties:
 *   - Id: The ID of the product.
 *   - Changes: An array of objects representing the Changes to be made for the product.
 *     Each object should have the following properties:
 *       - Supplier: The supplier number.
 *       - Oem: The OEM value.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function insertOemByProduct(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new Oem...");
    const query = `DECLARE @productKey uniqueidentifier;
    ${changeObjArray
      .map(
        (changeObj) =>
          `SET @productKey =
        (SELECT TOP 1 ID
          FROM Product
          WHERE Product.ResearchID = '${changeObj.Id}' 
          OR Product.SKU = '${changeObj.Id}');
        INSERT INTO Oem (OemKey, SupplierNumber, OEM, productID)
        VALUES
          ${changeObj.Changes.map(
            (pair) =>
              `(NEWID(), '${pair.Supplier}', '${pair.Oem}', @productKey)`
          ).join(",\n")};`
      )
      .join("\n")}`;
    const result = await pool.query(query);
    console.log("Inserted new Oem");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected[1]} Oem.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts OEMs by supplier into the database.
 * @param {Array} changeObjArray - An array of objects containing the Changes to be made.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function insertOemBySupplier(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    console.log("Inserting new Oem...");
    const query = `${changeObjArray
      .map(
        (changeObj) =>
          `INSERT INTO Oem (OemKey, SupplierNumber, OEM, productID) VALUES
            ${changeObj.Changes.map(
              (pair) =>
                `(NEWID(), '${changeObj.Supplier}', '${pair.Oem}', 
                  (SELECT TOP 1 ID FROM Product
                  WHERE SKU = '${pair.ProductID}' 
                  OR ResearchID = '${pair.ProductID}'))`
            ).join(",\n")};`
      )
      .join("\n")}`;
    const result = await pool.query(query);
    console.log("Inserted new Oem");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected} Oem.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts an array of change objects into the KeyType table in the SQL database.
 * @param {Array} changeObjArray - The array of change objects to be inserted.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function insertKType(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    const query = `INSERT INTO KeyType (KTypeKey, KeyType, ProductID)
      VALUES 
      ${changeObjArray
        .map(
          (changeObj) =>
            `(NEWID(), '${changeObj.Changes.KType}', 
            (SELECT TOP 1 ID FROM Product
              WHERE Product.ResearchID = '${changeObj.Id}' 
              OR Product.SKU = '${changeObj.Id}'))`
        )
        .join()}`;
    // console.log(query);
    // debugger;
    console.log("Inserting new KType...");
    const result = await pool.query(query);
    console.log("Inserted new KType");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected} KType.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts an array of change objects into the EPID table in the SQL database.
 * Each change object contains an EPID value and an ID value that corresponds to a Product in the Product table.
 * The ID value can be either a ResearchID or a SKU.
 *
 * @param {Array<Object>} changeObjArray - The array of change objects to be inserted.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function insertEpid(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    const query = `INSERT INTO EPID (EPID, ProductID)
      VALUES ${changeObjArray
        .map(
          (changeObj) =>
            `('${changeObj.Changes.EPID}', 
          (SELECT TOP 1 ID FROM Product
            WHERE Product.ResearchID = '${changeObj.Id}' 
            OR Product.SKU = '${changeObj.Id}'))`
        )
        .join()}`;
    // console.log(query);
    // debugger;
    console.log("Inserting new ePID...");
    const result = await pool.query(query);
    console.log("Inserted new ePID");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected} ePID.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts alternate index records into the database by supplier.
 * @param {Array} changeObjArray - An array of change objects containing the alternate index data.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function insertAltIndexBySupplier(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `${changeObjArray
      .map(
        (changeObj) =>
          `INSERT INTO AlternateIndex (AltIndexKey, MOQ, CostAud, LastUpdate, Quality, SupplierPartType, WCPPartType, ProductID, SupplierNumber, AltIndexNumber, CostCurrency)
        VALUES ${changeObj.Changes.map(
          (altIndex) => `(NEWID(), ${altIndex.Moq}, ${
            altIndex.CostAud ? altIndex.CostAud : -1
          },
            '${new Date().toISOString().slice(0, 19).replace("T", " ")}',
            ${ValueDictionary.Quality[altIndex.Quality]}, '${
            altIndex.SupplierPartType
          }', 
            '${altIndex.WcpPartType}', 
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = '${altIndex.ProductID}' 
              OR ResearchID = '${altIndex.ProductID}'), 
            '${changeObj.Supplier}',
            '${altIndex.Index}',
            ${altIndex.CostCurrency})`
        ).join()};`
      )
      .join("\n")}`;
    console.log("Inserting new AltIndex...");
    const result = await pool.query(query);
    console.log("Inserted new AltIndex");

    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected} Alternate Index.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Inserts alternate indexes for products into the database.
 * @param {Array<Object>} changeObjArray - An array of objects representing the Changes to be made.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function insertAltIndexByProduct(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new AltIndex...");
    const query = `DECLARE @productKey uniqueidentifier
    ${changeObjArray
      .map(
        (changeObj) =>
          `SET @productKey = (SELECT TOP 1 ID FROM Product
          WHERE Product.ResearchID = '${changeObj.Id}' 
            OR Product.SKU = '${changeObj.Id}');
          INSERT INTO AlternateIndex (AltIndexKey, MOQ, CostAud, LastUpdate, Quality, SupplierPartType, WCPPartType, ProductID, SupplierNumber, AltIndexNumber, CostCurrency)
          VALUES ${changeObj.Changes.map(
            (altIndex) =>
              `(NEWID(), ${altIndex.Moq}, ${altIndex.CostAud ?? -1}, 
                '${new Date().toISOString().slice(0, 19).replace("T", " ")}',
                ${ValueDictionary.Quality[altIndex.Quality]}, '${
                altIndex.SupplierPartType
              }', 
                '${altIndex.WcpPartType}', @productKey, 
                '${altIndex.Number}',
                '${altIndex.Index}',
                ${altIndex.CostCurrency})`
          ).join()};`
      )
      .join("\n")}`;
    const result = await pool.query(query);
    console.log("Inserted new AltIndex");
    console.log("Result: ", result.rowsAffected);
    return {
      status: "OK",
      message: `Successfully created ${result.rowsAffected[1]} Alternate Index.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Updates the product in the SQL database based on the provided change objects.
 * @param {Array} changeObjArray - An array of change objects containing the Changes to be made to the product.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function updateProduct(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const updateQueries = [];
    changeObjArray.forEach((changeObj) => {
      let Changes = changeObj.Changes;
      let productID = changeObj.Id;
      let setUpdates = [];
      // Translate DataTable value to SQL int value
      if ("Status" in Changes)
        setUpdates.push(`Status = ${ValueDictionary.Status[Changes.Status]}`);

      if ("Oem" in Changes)
        setUpdates.push(`OemType = ${ValueDictionary.OemType[Changes.Oem]}`);

      if ("EstSaleVol" in Changes)
        setUpdates.push(`EstSales = ${Changes.EstSaleVol}`);

      if ("Note" in Changes) setUpdates.push(`Note = '${Changes.Note}'`);

      if ("CostUSD" in Changes) setUpdates.push(`CostUSD = ${Changes.CostUSD}`);

      if ("EstimateCostAUD" in Changes)
        setUpdates.push(`EstCostAud = ${Changes.EstimateCostAUD}`);

      if ("EstimateSell" in Changes)
        setUpdates.push(`EstSell = ${Changes.EstimateSell}`);

      if ("Postage" in Changes) setUpdates.push(`Postage = ${Changes.Postage}`);

      if ("ExtGP" in Changes) setUpdates.push(`ExtGp = ${Changes.ExtGP}`);

      updateQueries.push(`UPDATE Product
      SET ${setUpdates.join()}, LastUpdate = '${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}'
      WHERE SKU = '${productID}' OR ResearchID = '${productID}';`);
    });
    const query = updateQueries.join("\n");
    // console.log(query);
    // debugger;
    console.log("Updating Product...");
    let result = await pool.query(query);
    console.log("Updated Product");

    console.log("Result: ", result.rowsAffected);
    console.log(
      `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} Product.`
    );
    return {
      status: "OK",
      message: `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} Product.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Updates the NewProduct table in the SQL database with the provided Changes.
 * @param {Array} changeObjArray - An array of objects representing the Changes to be made.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function updateNewProduct(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const updateQueries = [];
    changeObjArray.forEach((changeObj) => {
      let Changes = changeObj.Changes;
      let productID = changeObj.Id;
      const setUpdates = [];
      const setProductUpdates = [];
      // Translate DataTable value to SQL int value
      if ("Status" in Changes && Changes.Status != "")
        setProductUpdates.push(
          `Status = ${ValueDictionary.Status[Changes.Status]}`
        );

      if ("Oem" in Changes && Changes.Oem != "")
        setProductUpdates.push(
          `OemType = ${ValueDictionary.OemType[Changes.Oem]}`
        );
      if ("Make" in Changes) setUpdates.push(`Make = '${Changes.Make}'`);
      if ("Model" in Changes) setUpdates.push(`Model = '${Changes.Model}'`);
      if ("Type" in Changes) setUpdates.push(`PartType = '${Changes.Type}'`);
      if ("Desc" in Changes)
        setUpdates.push(`IcDescription = '${Changes.Desc}'`);
      if ("Request" in Changes) setUpdates.push(`Request = ${Changes.Request}`);
      if ("RequestNF" in Changes)
        setUpdates.push(`RequestNF = ${Changes.RequestNF}`);
      if ("UnitSold" in Changes)
        setUpdates.push(`UnitSold = ${Changes.UnitSold}`);
      if ("AveragePrice" in Changes)
        setUpdates.push(`AveragePrice = ${Changes.AveragePrice}`);

      updateQueries.push(`UPDATE NewProduct
        SET ${setUpdates.join()} 
        FROM NewProduct
        JOIN Product ON NewProduct.ProductID = Product.ID
        WHERE Product.ResearchID = '${productID}';`);

      updateQueries.push(`UPDATE Product
        SET ${
          setProductUpdates.length > 0 ? setProductUpdates.join() + "," : ""
        } LastUpdate = '${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}'
        WHERE SKU = '${productID}' OR ResearchID = '${productID}';`);
    });
    const query = updateQueries.join("\n");
    // console.log(query);
    // debugger;
    // console.log("Updating NewProduct...");
    let result = await pool.query(query);
    console.log("Updated NewProduct");

    console.log("Result: ", result.rowsAffected);
    console.log(
      `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} NewProduct.`
    );
    return {
      status: "OK",
      message: `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} NewProduct.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Updates the OEM value in the database for the given change objects.
 * @param {Array<Object>} changeObjArray - An array of change objects containing the old and new values.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function updateOem(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const updateQueries = [];
    changeObjArray.forEach((changeObj) => {
      const productID = changeObj.Id;

      updateQueries.push(`UPDATE Oem
      SET OEM = '${changeObj.NewValue}'
      WHERE OEM = '${changeObj.OldValue}'}' 
        AND ProductID =
          (SELECT TOP 1 ID
          FROM Product
          WHERE SKU = '${productID}' 
            OR ResearchID = '${productID}');
      UPDATE Product
      SET LastUpdate = '${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}'
      WHERE SKU = '${productID}' OR ResearchID = '${productID}'`);
    });
    const query = updateQueries.join("\n");
    // console.log(query);
    // debugger;

    console.log("Updating Oem...");
    const result = await pool.query(query);
    console.log("Updated Oem");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} OEM.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Updates the KeyType in the SQL database based on the provided change objects.
 * @param {Array<Object>} changeObjArray - An array of change objects containing the ID, oldValue, and newValue.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function updateKType(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const updateQueries = [];
    changeObjArray.forEach((changeObj) => {
      const productID = changeObj.Id;

      updateQueries.push(`UPDATE KeyType
      SET KeyType = '${changeObj.NewValue}'
      WHERE KeyType = '${changeObj.OldValue}' 
        AND ProductID =
          (SELECT TOP 1 ID
          FROM Product
          WHERE SKU = '${productID}' 
            OR ResearchID = '${productID}');
      UPDATE Product
      SET LastUpdate = '${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}'
      WHERE SKU = '${productID}' OR ResearchID = '${productID}'`);
    });

    console.log("Updating KType...");
    const result = await pool.query(updateQueries.join("\n"));
    console.log("Updated KType");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} KType.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Updates the EPID values in the database based on the provided change objects.
 * @param {Array<Object>} changeObjArray - An array of change objects containing the old and new EPID values.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function updateEpid(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const updateQueries = [];
    changeObjArray.forEach((changeObj) => {
      const productID = changeObj.Id;

      updateQueries.push(`UPDATE EPID
      SET EPID = '${changeObj.NewValue}'
      WHERE EPID = '${changeObj.OldValue}' 
        AND ProductID =
          (SELECT TOP 1 ID
          FROM Product
          WHERE SKU = '${productID}' 
            OR ResearchID = '${productID}');
      UPDATE Product
      SET LastUpdate = '${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}'
      WHERE SKU = '${productID}' OR ResearchID = '${productID}'`);
    });

    console.log("Updating ePID...");
    const result = await pool.query(updateQueries.join("\n"));
    console.log("Updated ePID");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} ePID.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Updates the alternate index in the SQL database based on the provided change objects.
 * @param {Array} changeObjArray - An array of change objects containing the updates to be made.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function updateAltIndex(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    let updateQueries = [];
    changeObjArray.forEach((changeObj) => {
      const Changes = changeObj.Changes;
      const productID = changeObj.Id;
      const setUpdates = [];
      // Translate DataTable value to SQL int value
      if ("Index" in Changes && Changes.Index)
        setUpdates.push(`AltIndexNumber = '${Changes.Index}'`);

      if ("Number" in Changes && Changes.Number)
        setUpdates.push(`SupplierNumber = '${Changes.Number}'`);

      if ("CostAud" in Changes && typeof Changes.CostAud === "number")
        setUpdates.push(`CostAud = ${Changes.CostAud}`);

      if ("Quality" in Changes && typeof Changes.Quality)
        setUpdates.push(
          `Quality = ${ValueDictionary.Quality[Changes.Quality]}`
        );

      if ("Moq" in Changes && typeof Changes.Moq === "number") {
        setUpdates.push(`MOQ = ${Changes.Moq}`);
      }

      if ("SupplierPartType" in Changes && Changes.SupplierPartType) {
        setUpdates.push(`SupplierPartType = '${Changes.SupplierPartType}'`);
      }

      if ("WcpPartType" in Changes && Changes.WcpPartType) {
        setUpdates.push(`WCPPartType = '${Changes.WcpPartType}'`);
      }

      if (
        "CostCurrency" in Changes &&
        typeof Changes.CostCurrency === "number"
      ) {
        setUpdates.push(`CostCurrency = ${Changes.CostCurrency}`);
      }

      if ("IsMain" in Changes && typeof Changes.IsMain === "boolean") {
        setUpdates.push(`IsMain = ${Number(Changes.IsMain)}`);
        if (Changes.IsMain) {
          updateQueries.push(`UPDATE AlternateIndex
          SET IsMain = 0, LastUpdate = '${new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")}'
          WHERE ProductID =
            (SELECT TOP 1 ID
              FROM Product
              WHERE SKU = '${productID}' OR ResearchID = '${productID}')
            AND IsMain = 1;`);
        }
      }

      updateQueries.push(`UPDATE AlternateIndex
      SET ${setUpdates.join()}, LastUpdate = '${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}'
      WHERE ProductID =
        (SELECT TOP 1 ID
          FROM Product
          WHERE SKU = '${productID}' OR ResearchID = '${productID}')
        AND SupplierNumber = '${changeObj.Supplier}';`);
    });
    const query = updateQueries.join("\n");
    // console.log(query);
    // debugger;

    console.log("Updating Alternate Index...");
    const result = await pool.query(query);
    console.log("Updated Alternate Index");

    console.log("Result: ", result.rowsAffected);
    console.log(
      `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} Alternate Indexes.`
    );
    return {
      status: "OK",
      message: `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} Alternate Indexes.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Updates the Supplier table in the SQL database with the provided Changes.
 * @param {Array} changeObjArray - An array of objects containing the Changes to be made.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function updateSupplier(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    let updateQueries = [];
    changeObjArray.forEach((changeObj) => {
      const Changes = changeObj.Changes;
      const productID = changeObj.Id;
      const setUpdates = [];
      // Translate DataTable value to SQL int value

      if ("Currency" in Changes)
        setUpdates.push(`Currency = '${Changes.Currency}'`);

      updateQueries.push(`UPDATE Supplier
      SET ${setUpdates.join()}
      WHERE SupplierNumber = '${changeObj.Supplier}';`);
    });
    const query = updateQueries.join("\n");
    // console.log(query);

    console.log("Updating Supplier...");
    const result = await pool.query(query);
    console.log("Updated Supplier");

    console.log("Result: ", result.rowsAffected);
    console.log(
      `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} Supplier.`
    );
    return {
      status: "OK",
      message: `Successfully updated ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} Supplier.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Deletes new products from the database based on the provided change object array.
 * @param {Array<Object>} changeObjArray - The array of change objects containing the IDs of the products to be deleted.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function deleteNewProduct(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `DELETE FROM NewProduct 
    WHERE ResearchID in (${changeObjArray
      .map((changeObj) => {
        return `'${changeObj.Id}'`;
      })
      .join()})`;

    console.log("Deleting New Product...");
    const result = await pool.query(query);
    console.log("Deleted New Product");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully deleted ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} Product.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Deletes products from the database based on the provided change objects.
 * @param {Array<Object>} changeObjArray - An array of change objects containing the IDs of the products to be deleted.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function deleteProduct(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `DELETE FROM Product 
    WHERE ResearchID in (${changeObjArray
      .map((changeObj) => {
        return `'${changeObj.Id}'`;
      })
      .join()}) OR SKU in (${changeObjArray
      .map((changeObj) => {
        return `'${changeObj.Id}'`;
      })
      .join()})`;

    console.log("Deleting Product...");
    const result = await pool.query(query);
    console.log("Deleted Product");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully deleted ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} Product.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Deletes users from the database.
 * @param {Array} changeObjArray - An array of objects containing Changes to be made.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR"). */
export async function deleteUser(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `DELETE FROM Users 
    WHERE UserID IN (${changeObjArray
      .map((changeObj) => changeObj.Changes.map((user) => `'${user}'`))
      .join()});`;

    console.log("Deleting User...");
    const result = await pool.query(query);
    console.log("Deleted User");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully deleted ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} User.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Deletes suppliers from the database based on the provided change objects.
 * @param {Array<Object>} changeObjArray - An array of change objects containing the supplier numbers to be deleted.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function deleteSupplier(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `DELETE FROM Supplier 
    WHERE SupplierNumber IN (${changeObjArray
      .map((changeObj) =>
        changeObj.Changes.map((supplierNumber) => `'${supplierNumber}'`)
      )
      .join()});`;

    console.log("Deleting Supplier...");
    const result = await pool.query(query);
    console.log("Deleted Supplier");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully deleted ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} Supplier.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Deletes KeyType from the SQL database based on the provided change objects.
 * @param {Array<Object>} changeObjArray - An array of change objects containing the necessary information for deletion.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function deleteKType(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `${changeObjArray
      .map(
        (changeObj) =>
          `DELETE FROM KeyType 
              WHERE KeyType = '${changeObj.Changes.KType}'
              AND ProductID = 
              (SELECT TOP 1 ID FROM Product
                WHERE Product.ResearchID = '${changeObj.Id}'
                OR Product.SKU = '${changeObj.Id}');`
      )
      .join("\n")}`;

    console.log("Deleting KeyType...");
    const result = await pool.query(query);
    console.log("Deleted KeyType");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully deleted ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} KeyType.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Deletes ePID records from the EPID table based on the provided change objects.
 * @param {Array<Map>} changeObjArray - An array of change objects containing the necessary information for deletion.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function deleteEpid(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Deleting ePID...");
    const result = await pool.query(
      `${changeObjArray
        .map(
          (changeObj) =>
            `DELETE FROM EPID 
              WHERE EPID = '${changeObj.Changes.EPID}'
              AND ProductID = 
              (SELECT TOP 1 ID FROM Product
                WHERE Product.ResearchID = '${changeObj.Id}'
                OR Product.SKU = '${changeObj.Id}');`
        )
        .join("\n")}`
    );
    console.log("Deleted ePID");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully deleted ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} ePID.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Deletes OEM records from the database based on the provided change objects.
 * @param {Array} changeObjArray - An array of change objects containing the necessary information for deletion.
 * @returns {Promise<Object>} A promise that resolves to an object with the following properties:
 *   - status: The status of the operation ("OK" or "ERROR").
 *   - message: A message indicating the result of the operation.
 *   - error: The error object (if status is "ERROR").
 */
export async function deleteOem(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `${changeObjArray
      .map(
        (changeObj) =>
          `DELETE FROM Oem 
              WHERE OEM = '${changeObj.Changes.Oem}'
              AND SupplierNumber = '${changeObj.Changes.Supplier}'
              AND ProductID = 
              (SELECT TOP 1 ID FROM Product
                WHERE Product.ResearchID = '${changeObj.Id}'
                OR Product.SKU = '${changeObj.Id}');`
      )
      .join("\n")}`;

    console.log("Deleting OEM...");
    let result = await pool.query(query);
    console.log("Deleted OEM");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully deleted ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} ePID.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Delete Alternate Index from AlternateIndex Table
 * @param {Map} changeObjArray The mapping of Changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function deleteAltIndex(changeObjArray) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Deleting AltIndex...");
    let query = `${changeObjArray
      .map(
        (changeObj) =>
          `DELETE FROM AlternateIndex 
              WHERE SupplierNumber = '${changeObj.Changes.Supplier}'
              AND ProductID = 
              (SELECT TOP 1 ID FROM Product
                WHERE Product.ResearchID = '${changeObj.Id}'
                OR Product.SKU = '${changeObj.Id}');`
      )
      .join("\n")}`;
    let result = await pool.query(query);
    console.log("Deleted AltIndex");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully deleted ${result.rowsAffected.reduce(
        (sum, count) => sum + count,
        0
      )} AltIndex.`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    if (pool) pool.close();
    console.log("Connection closed.");
  }
}
