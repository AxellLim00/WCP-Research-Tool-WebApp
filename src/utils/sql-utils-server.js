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
 * Insert User data into the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {String | Error} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertUser(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new user...");
    let result = await pool.query(
      `INSERT INTO Users (UserID, Team)
      VALUES
        ${mapChange
          .map((changeMap) =>
            changeMap
              .get("changes")
              .map((user) => `('${user.UserID}', '${user.Team}')`)
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
 * Insert Product data into the SQL Database that already exists from the Workflow API.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {String | Error} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertProduct(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `INSERT INTO Product (ID, UserID, ResearchID, SKU, Status, OemType, LastUpdate)
      VALUES
        ${mapChange
          .map((changeMap) =>
            changeMap.get("changes").map(
              (product) =>
                `(NEWID(), '${changeMap.get("user")}', 
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
 * Insert Product data into the database that does not exist in the workflow API.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {String | Error} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertNewProduct(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    console.log("Inserting new product information...");
    const query = `INSERT INTO Product (ID, UserID, ResearchID, SKU, Status, OemType, LastUpdate)
      VALUES
        ${mapChange
          .map((changeMap) =>
            changeMap.get("changes").map(
              (product) =>
                `(NEWID(), '${changeMap.get("user")}', 
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
        ${mapChange
          .map((changeMap) =>
            changeMap.get("changes").map(
              (product) =>
                `('${changeMap.get("id")}', 
                '${product.Make}', '${product.Model}', 
                '${product.Type}', 
              '${product.Num}', '${product.Desc}', 
              (SELECT TOP 1 ID 
                FROM Product 
                WHERE ResearchID = '${changeMap.get("id")}'),
              '${product.TypeCode}', 0, 0, 0, 0)`
            )
          )
          .join(",\n")};`;
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
 * Insert Supplier data into the database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {int[] | Error} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertSupplier(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new supplier...");
    const query = `INSERT INTO Supplier (SupplierNumber, SupplierName, Currency)
      VALUES 
      ${mapChange
        .map((changeMap) =>
          changeMap
            .get("changes")
            .map(
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
 * Insert Oem data into the SQL Database based on the Product ID specified.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with number of successful row inserts OR an Error Object.
 */
export async function insertOemByProduct(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new Oem...");
    const query = `DECLARE @productKey uniqueidentifier;
    ${mapChange
      .map(
        (Map) =>
          `SET @productKey =
        (SELECT TOP 1 ID
          FROM Product
          WHERE Product.ResearchID = '${Map.get("id")}' 
          OR Product.SKU = '${Map.get("id")}');
        INSERT INTO Oem (OemKey, SupplierNumber, OEM, productID)
        VALUES
          ${Map.get("changes")
            .map(
              (pair) =>
                `(NEWID(), '${pair.Supplier}', '${pair.Oem}', @productKey)`
            )
            .join(",\n")};`
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
 * Insert Oem data into the SQL Database based on the Supplier Number specified.
 * @param {string} supplierNumber Supplier's Number or Identification.
 * @param {Object[]} oemProductPairs list of oem-productID (SKU or Research ID) pair object.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with number of successful row inserts OR an Error Object.
 */
export async function insertOemBySupplier(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    console.log("Inserting new Oem...");
    const query = `${mapChange
      .map(
        (Map) =>
          `INSERT INTO Oem (OemKey, SupplierNumber, OEM, productID) VALUES
            ${Map.get("changes")
              .map(
                (pair) =>
                  `(NEWID(), '${Map.get("Supplier")}', '${pair.Oem}', 
                  (SELECT TOP 1 ID FROM Product
                  WHERE SKU = '${pair.ProductID}' 
                  OR ResearchID = '${pair.ProductID}'))`
              )
              .join(",\n")};`
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
 * Insert KType (Key Type) data into the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertKType(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new KType...");
    const query = `INSERT INTO KeyType (KTypeKey, KeyType, ProductID)
      VALUES 
      ${mapChange.map(
        (Map) =>
          `(NEWID(), '${Map.get("changes").KType}', 
            (SELECT TOP 1 ID FROM Product
              WHERE Product.ResearchID = '${Map.get("id")}' 
              OR Product.SKU = '${Map.get("id")}'));`
      )}`;
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
 * Insert EPID (eBay Product ID) data into the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertEpid(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new ePID...");
    let result = await pool.query(`INSERT INTO EPID (EPID, ProductID)
      VALUES ${mapChange.map(
        (Map) =>
          `('${Map.get("changes").EPID}', 
          (SELECT TOP 1 ID FROM Product
            WHERE Product.ResearchID = '${Map.get("id")}' 
            OR Product.SKU = '${Map.get("id")}'))`
      )}`);
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
 * Insert Alternate Index data into the SQL Database based on the Supplier.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertAltIndexBySupplier(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `${mapChange
      .map(
        (Map) =>
          `INSERT INTO AlternateIndex (AltIndexKey, MOQ, CostAud, LastUpdate, Quality, SupplierPartType, WCPPartType, ProductID, SupplierNumber, AltIndexNumber, CostCurrency)
        VALUES ${Map.get("changes")
          .map(
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
            '${Map.get("supplier")}',
            '${altIndex.Index}',
            ${altIndex.CostCurrency})`
          )
          .join()};`
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
 * Insert Alternate Index data into the SQL Database based on the Product.
 * @param {String} ProductID Product's id (SKU or Research ID) selected.
 * @param {Object[]} altIndexObjects List of Alternate Index object.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertAltIndexByProduct(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new AltIndex...");
    const query = `DECLARE @productKey uniqueidentifier
    ${mapChange
      .map(
        (Map) =>
          `SET @productKey = (SELECT TOP 1 ID FROM Product
          WHERE Product.ResearchID = '${Map.get("id")}' 
            OR Product.SKU = '${Map.get("id")}');
          INSERT INTO AlternateIndex (AltIndexKey, MOQ, CostAud, LastUpdate, Quality, SupplierPartType, WCPPartType, ProductID, SupplierNumber, AltIndexNumber, CostCurrency)
          VALUES ${Map.get("changes")
            .map(
              (altIndex) =>
                `(NEWID(), ${altIndex.Moq}, ${altIndex.CostAud ?? -1}, 
                '${new Date().toISOString().slice(0, 19).replace("T", " ")}',
                ${altIndex.Quality}, '${altIndex.SupplierPartType}', 
                '${altIndex.WcpPartType}', @productKey, 
                '${altIndex.Number}',
                '${altIndex.Index}',
                ${altIndex.CostCurrency})`
            )
            .join()};`
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
 * Updates Product value based on the new changes' mapping key-values to the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function updateProduct(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const updateQueries = [];
    mapChange.forEach((item) => {
      let changes = item.get("changes");
      let productID = item.get("id");
      let setUpdates = [];
      // Translate DataTable value to SQL int value
      if ("Status" in changes)
        setUpdates.push(`Status = ${ValueDictionary.Status[changes.Status]}`);

      if ("Oem" in changes)
        setUpdates.push(`OemType = ${ValueDictionary.OemType[changes.Oem]}`);

      if ("EstSaleVol" in changes)
        setUpdates.push(`EstSales = ${changes.EstSaleVol}`);

      if ("Note" in changes) setUpdates.push(`Note = '${changes.Note}'`);

      if ("CostUSD" in changes) setUpdates.push(`CostUSD = ${changes.CostUSD}`);

      if ("EstimateCostAUD" in changes)
        setUpdates.push(`EstCostAud = ${changes.EstimateCostAUD}`);

      if ("EstimateSell" in changes)
        setUpdates.push(`EstSell = ${changes.EstimateSell}`);

      if ("Postage" in changes) setUpdates.push(`Postage = ${changes.Postage}`);

      if ("ExtGP" in changes) setUpdates.push(`ExtGp = ${changes.ExtGP}`);

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
 * Updates New Product value based on the new changes' mapping key-values to the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function updateNewProduct(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const updateQueries = [];
    mapChange.forEach((item) => {
      let changes = item.get("changes");
      let productID = item.get("id");
      const setUpdates = [];
      const setProductUpdates = [];
      // Translate DataTable value to SQL int value
      if ("Status" in changes && changes.Status != "")
        setProductUpdates.push(
          `Status = ${ValueDictionary.Status[changes.Status]}`
        );

      if ("Oem" in changes && changes.Oem != "")
        setProductUpdates.push(
          `OemType = ${ValueDictionary.OemType[changes.Oem]}`
        );
      if ("Make" in changes) setUpdates.push(`Make = '${changes.Make}'`);
      if ("Model" in changes) setUpdates.push(`Model = '${changes.Model}'`);
      if ("Type" in changes) setUpdates.push(`PartType = '${changes.Type}'`);
      if ("Desc" in changes)
        setUpdates.push(`IcDescription = '${changes.Desc}'`);
      if ("Request" in changes) setUpdates.push(`Request = ${changes.Request}`);
      if ("RequestNF" in changes)
        setUpdates.push(`RequestNF = ${changes.RequestNF}`);
      if ("UnitSold" in changes)
        setUpdates.push(`UnitSold = ${changes.UnitSold}`);
      if ("AveragePrice" in changes)
        setUpdates.push(`AveragePrice = ${changes.AveragePrice}`);

      updateQueries.push(`UPDATE NewProduct
        JOIN Product ON NewProduct.ProductID = Product.ID
        SET ${setUpdates.join()} 
        WHERE Product.ResearchID = '${productID}';`);

      updateQueries.push(`UPDATE Product
        SET ${
          setUpdates.length > 0 ? setUpdates.join() + "," : ""
        } LastUpdate = '${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}'
        WHERE SKU = '${productID}' OR ResearchID = '${productID}';`);
    });
    const query = updateQueries.join("\n");
    // console.log(query);
    // debugger;
    console.log("Updating NewProduct...");
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
 * Updates Oem value based on the new changes' mapping key-values to the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function updateOem(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    var updateQueries = [];
    mapChange.forEach((item) => {
      let productID = item.get("id");

      updateQueries.push(`UPDATE Oem
      SET OEM = '${item.get("newValue")}'
      WHERE OEM = '${item.get("oldValue")}' 
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
    console.log(query);

    console.log("Updating Oem...");
    let result = await pool.query(query);
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
 * Updates KType value based on the new changes' mapping key-values to the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function updateKType(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    var updateQueries = [];
    mapChange.forEach((item) => {
      let productID = item.get("id");

      updateQueries.push(`UPDATE KeyType
      SET KeyType = '${item.get("newValue")}'
      WHERE KeyType = '${item.get("oldValue")}' 
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
    let result = await pool.query(updateQueries.join("\n"));
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
 * Updates ePID value based on the new changes' mapping key-values to the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function updateEpid(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    var updateQueries = [];
    mapChange.forEach((item) => {
      let productID = item.get("id");

      updateQueries.push(`UPDATE EPID
      SET EPID = '${item.get("newValue")}'
      WHERE EPID = '${item.get("oldValue")}' 
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
    let result = await pool.query(updateQueries.join("\n"));
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
 * Updates Alternate Index value based on the new changes' mapping key-values to the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function updateAltIndex(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    let updateQueries = [];
    mapChange.forEach((item) => {
      const changes = item.get("changes");
      const productID = item.get("id");
      const setUpdates = [];
      // Translate DataTable value to SQL int value
      if ("Index" in changes)
        setUpdates.push(`AltIndexNumber = '${changes.Index}'`);

      if ("Number" in changes)
        setUpdates.push(`SupplierNumber = '${changes.Number}'`);

      if ("CostAud" in changes) setUpdates.push(`CostAud = ${changes.CostAud}`);

      if ("Quality" in changes)
        setUpdates.push(
          `Quality = ${ValueDictionary.Quality[changes.Quality]}`
        );

      if ("IsMain" in changes && typeof changes.IsMain === "boolean") {
        setUpdates.push(`IsMain = ${Number(changes.IsMain)}`);
        if (changes.IsMain) {
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
        AND SupplierNumber = '${item.get("number")}';`);
    });
    const query = updateQueries.join("\n");
    // console.log(query);

    console.log("Updating Alternate Index...");
    let result = await pool.query(query);
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
 * Updates Supplier value based on the new changes' mapping key-values to the SQL Database.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function updateSupplier(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    let updateQueries = [];
    mapChange.forEach((item) => {
      const changes = item.get("changes");
      const productID = item.get("id");
      const setUpdates = [];
      // Translate DataTable value to SQL int value

      if ("Currency" in changes)
        setUpdates.push(`Currency = '${changes.Currency}'`);

      updateQueries.push(`UPDATE Supplier
      SET ${setUpdates.join()}
      WHERE SupplierNumber = '${item.get("supplier")}';`);
    });
    const query = updateQueries.join("\n");
    // console.log(query);

    console.log("Updating Supplier...");
    let result = await pool.query(query);
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
 * Delete Product from NewProduct Table based on the ResearchID given.
 * @param {Map} mapChange The mapping of changes synced with the Workflow API.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function deleteNewProduct(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    console.log("Deleting New Product...");
    let result = await pool.query(`DELETE FROM NewProduct 
    WHERE ResearchID in (${mapChange
      .map((item) => {
        return `'${item.get("id")}'`;
      })
      .join()})`);
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
 * Delete Product from Product Table based on the ResearchID OR SKU given.
 * @param {Map} mapChange The mapping of changes synced with the Workflow API.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function deleteProduct(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    const query = `DELETE FROM Product 
    WHERE ResearchID in (${mapChange
      .map((Map) => {
        return `'${Map.get("id")}'`;
      })
      .join()}) OR SKU in (${mapChange
      .map((Map) => {
        return `'${Map.get("id")}'`;
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
 * Delete User from Users Table based on the UserID.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function deleteUser(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Deleting User...");
    let result = await pool.query(`DELETE FROM Users 
    WHERE UserID IN (${mapChange
      .map((changeMap) => changeMap.get("changes").map((user) => `'${user}'`))
      .join()});`);
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
 * Delete User from Users Table.
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function deleteSupplier(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Deleting Supplier...");
    let result = await pool.query(`DELETE FROM Supplier 
    WHERE SupplierNumber IN (${mapChange
      .map((changeMap) =>
        changeMap.get("changes").map((supplierNumber) => `'${supplierNumber}'`)
      )
      .join()});`);
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
 * Delete KeyType from KeyType Table
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function deleteKType(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Deleting KeyType...");
    let result = await pool.query(
      `${mapChange
        .map(
          (Map) =>
            `DELETE FROM KeyType 
              WHERE KeyType = '${Map.get("changes").KType}'
              AND ProductID = 
              (SELECT TOP 1 ID FROM Product
                WHERE Product.ResearchID = '${Map.get("id")}'
                OR Product.SKU = '${Map.get("id")}');`
        )
        .join("\n")}`
    );
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
 * Delete EPID from EPID Table
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function deleteEpid(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Deleting ePID...");
    let result = await pool.query(
      `${mapChange
        .map(
          (Map) =>
            `DELETE FROM EPID 
              WHERE EPID = '${Map.get("changes").EPID}'
              AND ProductID = 
              (SELECT TOP 1 ID FROM Product
                WHERE Product.ResearchID = '${Map.get("id")}'
                OR Product.SKU = '${Map.get("id")}');`
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
 * Delete OEM from Oem Table
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function deleteOem(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Deleting OEM...");
    let query = `${mapChange
      .map(
        (Map) =>
          `DELETE FROM Oem 
              WHERE OEM = '${Map.get("changes").Oem}'
              AND SupplierNumber = '${Map.get("changes").Supplier}'
              AND ProductID = 
              (SELECT TOP 1 ID FROM Product
                WHERE Product.ResearchID = '${Map.get("id")}'
                OR Product.SKU = '${Map.get("id")}');`
      )
      .join("\n")}`;
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
 * @param {Map} mapChange The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function deleteAltIndex(mapChange) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Deleting AltIndex...");
    let query = `${mapChange
      .map(
        (Map) =>
          `DELETE FROM AlternateIndex 
              WHERE SupplierNumber = '${Map.get("changes").Supplier}'
              AND ProductID = 
              (SELECT TOP 1 ID FROM Product
                WHERE Product.ResearchID = '${Map.get("id")}'
                OR Product.SKU = '${Map.get("id")}');`
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
