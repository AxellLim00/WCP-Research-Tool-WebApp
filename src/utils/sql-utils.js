import sql from "mssql";
import config from "../../Server.config.json" assert { type: "json" };
const sqlConfig = config.sql;
const ValueDicionary = {
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
  },
  OemType: {
    0: "aftermarket",
    aftermarket: 0,
    1: "genuine",
    genuine: 1,
  },
};

/**
 * Get all Users and their Product Counts saved in the SQL Database.
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of {UserID, Team, Count} object OR Error Object.
 */
export async function getUsersProduct() {
  try {
    console.log("Connecting to SQL...");
    const pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Users...");
    let result = await pool.query(
      `SELECT Users.*,COUNT(Product.ID) AS 'ProductCount' 
      FROM Users 
      JOIN Product ON Users.UserID = Product.UserID 
      GROUP BY Users.UserID, Users.Team;`
    );
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all Products saved in the SQL Database.
 * @returns {Object | } Status ("OK" or "ERROR"), and List of Product object according to Product Table Columns OR Error Object.
 */
export async function getProduct() {
  try {
    console.log("Connecting to SQL...");
    const pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Product...");
    let result = await pool.query("SELECT * FROM Product");
    console.log("Got Product");
    console.log("Result: ", result.rowsAffected);
    // TO DO: replace OEM Type and Status int to words
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all Oems saved in the SQL Database.
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of Oem object according to Oem Table Columns OR Error Object.
 */
export async function getOem(productID) {
  try {
    console.log("Connecting to SQL...");
    const pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Oems...");
    let result = await pool.query(
      `SELECT OEM FROM Oem 
      JOIN Product on Oem.ProductID = Product.ID
      WHERE Product.ResearchID = ${productID} 
        OR Product.SKU = ${productID}`
    );
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all Alternate Indexes saved in the SQL Database.
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of Alternate Index object according to AlternateIndex Table Columns OR Error Object.
 */
export async function getAltIndex(productID) {
  try {
    console.log("Connecting to SQL...");
    const pool = await sql.connect(sqlConfig);
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Get all Key Type (KType) saved in the SQL Database.
 * @returns {Object[]} Status ("OK" or "ERROR"), and List of KType object according to KeyType Table Columns OR Error Object.
 */
export async function getKeyType(productID) {
  try {
    console.log("Connecting to SQL...");
    const pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting KTypes...");
    let result = await pool.query(
      `SELECT KeyType
      FROM KeyType 
      JOIN Product ON KeyType.ProductID = Product.ID 
      WHERE Product.ResearchID = ${productID} OR Product.SKU = ${productID}`
    );
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
    pool.close();
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
    const pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Getting Unsaved Product...");
    let result = await pool.query(
      `SELECT *
      FROM NewProduct`
    );
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert User data into the SQL Database.
 * @param {Object[]} userObject list of user object.
 * @returns {String | Error} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
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
      status: "ERROR",
      error: err,
    };
  } finally {
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert Product data into the SQL Database that already exists from the Workflow API.
 * @param {Object[]} productObjects list of product object.
 * @returns {String | Error} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertProduct(productObjects) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new product...");
    let result = await pool.query(
      `INSERT INTO Product (ID, UserID, ResearchID, SKU, Status, OemType, LastUpdate)
      VALUES
        ${productObjects
          .map(
            (product) =>
              `(NEWID(), '${product.UserID}', 
              ${product.ResearchID ? "'" + product.ResearchID + "'" : "NULL"}, 
              ${product.SKU ? "'" + product.SKU + "'" : "NULL"}, 
              ${product.Status}, ${product.OemType}, 
              '${new Date().toISOString().slice(0, 19).replace("T", " ")}')`
          )
          .join(",\n")};`
    );
    console.log("Inserted new product");
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert Product data into the database that does not exist in the workflow API.
 * @param {Object[]} productObjects list of product object with complete product information.
 * @returns {String | Error} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertNewProduct(productObjects) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new product...");
    let result = await pool.query(
      `INSERT INTO Product (ID, UserID, ResearchID, SKU, Status, OemType, LastUpdate)
      VALUES
        ${productObjects
          .map(
            (product) =>
              `(NEWID(), '${product.UserID}', '${product.ResearchID}', 
              ${product.SKU ? "'" + product.SKU + "'" : "NULL"}, 
              ${product.Status}, ${product.OemType}, 
              '${new Date().toISOString().slice(0, 19).replace("T", " ")}')`
          )
          .join(",\n")};
      INSERT INTO NewProduct (ResearchID, Make, Model, PartType, IcNumber, IcDescription, ProductID)
      VALUES
        ${productObjects
          .map(
            (product) =>
              `('${product.ResearchID}', '${product.Make}', '${product.Model}', '${product.PartType}', 
              '${product.IcNumber}', '${product.IcDescription}', 
              (SELECT TOP 1 ID FROM Product WHERE ResearchID = '${pair.ResearchID}'))`
          )
          .join(",\n")};`
    );
    console.log("Inserted new product");
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert Supplier data into the database.
 * @param {Object[]} supplierObject list of supplier object.
 * @returns {int[] | Error} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertSupplier(supplierObjects) {
  try {
    console.log("Connecting to SQL...");
    const pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new supplier...");
    let result = await pool.query(
      `INSERT INTO Supplier (SupplierNumber, SupplierName, Currency)
      VALUES 
      ${supplierObject
        .map(
          (supplier) =>
            `('${supplier.SupplierNumber}', '${supplier.SupplierName}', '${supplier.Currency}')`
        )
        .join(",\n")};`
    );
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert Oem data into the SQL Database based on the Product ID specified.
 * @param {string} productID product's id (SKU or Research ID) selected.
 * @param {Object[]} oemSupplierPairs list of oem-supplierNumber pair object.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with number of successful row inserts OR an Error Object.
 */
export async function InsertOemByProduct(productID, oemSupplierPairs) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new Oem...");
    let result = await pool.query(`DECLARE @productKey uniqueidentifier
      SET @productKey =
        (SELECT TOP 1 ID
          FROM Product
          WHERE Product.ResearchID = '${productID}' OR Product.SKU = '${productID}');
      
      INSERT INTO Oem (SupplierNumber, OEM, productID)
        VALUES
          ${oemSupplierPairs
            .map((pair) => `('${pair.Supplier}', '${pair.Oem}', @productKey)`)
            .join(",\n")};`);
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert Oem data into the SQL Database based on the Supplier Number specified.
 * @param {string} supplierNumber Supplier's Number or Identification.
 * @param {Object[]} oemProductPairs list of oem-productID (SKU or Research ID) pair object.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with number of successful row inserts OR an Error Object.
 */
export async function InsertOemBySupplier(supplierNumber, oemProductPairs) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new Oem...");
    let result =
      await pool.query(`INSERT INTO Oem (SupplierNumber, OEM, productID)
        VALUES
          ${oemProductPairs
            .map(
              (pair) =>
                `('${supplierNumber}', '${pair.Oem}', (SELECT TOP 1 ID FROM Product WHERE SKU = '${pair.ProductID}' OR ResearchID = '${pair.ProductID}'))`
            )
            .join(",\n")};`);
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert KType (Key Type) data into the SQL Database.
 * @param {Object} kTypeObjects {KType, ProductID} object.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertKType(kTypeObject) {
  try {
    console.log("Connecting to SQL...");
    const pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new KType...");
    let result = await pool.query(
      `INSERT INTO KeyType (KeyType, ProductID)
      VALUES 
      ('${kTypeObject.KType}', (SELECT TOP 1 ID FROM Product WHERE Product.ResearchID = '${kTypeObject.ProductID}' OR Product.SKU = '${kTypeObject.ProductID}'));`
    );
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert Alternate Index data into the SQL Database based on the Supplier.
 * @param {String} supplierNumber Supplier's Number.
 * @param {Object[]} altIndexObjects List of Alternate Index object.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertAltIndexBySupplier(
  supplierNumber,
  altIndexObjects
) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new AltIndex...");
    let result = await pool.query(
      `INSERT INTO AlternateIndex (AltIndexKey, MOQ, CostAud, LastUpdate, Quality, SupplierPartType, WCPPartType, ProductID, SupplierNumber)
      VALUES 
      ${altIndexObjects
        .map(
          (altIndex) =>
            `(NEWID(), ${altIndex.MOQ}, ${altIndex.CostAud},
            '${new Date().toISOString().slice(0, 19).replace("T", " ")}',
            ${altIndex.Quality}, '${altIndex.SupplierPartType}', 
            '${altIndex.WCPPartType}', 
            (SELECT TOP 1 ID FROM Product
              WHERE SKU = '${altIndex.ProductID}' 
              OR ResearchID = '${altIndex.ProductID}'), 
            '${supplierNumber}')`
        )
        .join(",\n")};`
    );
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Insert Alternate Index data into the SQL Database based on the Product.
 * @param {String} ProductID Product's id (SKU or Research ID) selected.
 * @param {Object[]} altIndexObjects List of Alternate Index object.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row inserts OR an Error Object.
 */
export async function insertAltIndexByProduct(productID, altIndexObjects) {
  try {
    console.log("Connecting to SQL...");
    var pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");
    console.log("Inserting new AltIndex...");
    let result = await pool.query(`DECLARE @productKey uniqueidentifier
      SET @productKey =
        (SELECT TOP 1 ID
          FROM Product
          WHERE Product.ResearchID = '${productID}' OR Product.SKU = '${productID}');
      
      INSERT INTO AlternateIndex (AltIndexKey, MOQ, CostAud, LastUpdate, Quality, SupplierPartType, WCPPartType, ProductID, SupplierNumber)
      VALUES 
      ${altIndexObjects
        .map(
          (altIndex) =>
            `(NEWID(), ${altIndex.MOQ}, ${altIndex.CostAud}, 
            '${new Date().toISOString().slice(0, 19).replace("T", " ")}',
            ${altIndex.Quality}, '${altIndex.SupplierPartType}', 
            '${altIndex.WCPPartType}', @productKey, 
            '${altIndex.Supplier}')`
        )
        .join(",\n")};`);
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
    pool.close();
    console.log("Connection closed.");
  }
}

/**
 * Updates Product value based on the new changes' mapping key-values to the SQL Database.
 * @param {Map} changesMapping The mapping of changes made to the DataTable on the client side.
 * @returns {Object} Status ("OK" or "ERROR"), with Message of success with numbers of successful row updated OR an Error Object.
 */
export async function updateProduct(changesMapping) {
  try {
    console.log("Connecting to SQL...");
    const pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL");

    console.log("Updating Product...");
    const changes = changesMapping.get("changes");
    const productID = changesMapping.get("id");
    let setUpdates = [];
    if ("Status" in changes) {
      setUpdates.push(`Status = '${ValueDicionary.Status[changes.Status]}'`);
    }
    if ("Oem" in changes) {
      setUpdates.push(`OemType = '${ValueDicionary.OemType[changes.Oem]}'`);
    }
    let result = await pool.query(`UPDATE Product
      SET ${setUpdates.join()}, LastUpdate = '${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")}'
      WHERE SKU = '${productID} OR ResearchID = '${productID}';`);
    console.log("Updated Product");

    console.log("Result: ", result.rowsAffected);

    return {
      status: "OK",
      message: `Successfully updated ${result.rowsAffected[1]} Product.`,
    };
  } catch (err) {
    console.log(err);

    return {
      status: "ERROR",
      error: err,
    };
  } finally {
    pool.close();
    console.log("Connection closed.");
  }
}

// insertUser([
//   { UserID: "Research User Test 1", Team: "Team Trial" },
//   { UserID: "Research User Test 2", Team: "Team Trial" },
//   { UserID: "Research User Test 3", Team: "Team Test" },
// ]);

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
//   },
// ]);

// InsertOemByProduct("123-456", [
//   {
//     Supplier: "123-456",
//     Oem: "1234567890",
//   },
//   {
//     Supplier: "123-450",
//     Oem: "9876543210",
//   },
// ]);

// InsertOemBySupplier("123-456", [
//   {
//     ProductID: "TEST-RID-0003",
//     Oem: "1357911131",
//   },
//   {
//     ProductID: "TEST-RID-0001",
//     Oem: "8642086420",
//   },
//   {
//     ProductID: "TEST-RID-0004",
//     Oem: "2468101214",
//   },
//   {
//     ProductID: "TEST-RID-0002",
//     Oem: "4682468246:",
//   },
// ]);

// insertKType({ KType: "Test-KType2", ProductID: "SKU-002" });

// insertAltIndexBySupplier("123-456", [
//   {
//     MOQ: 10,
//     CostAud: 9.99,
//     Quality: 0,
//     SupplierPartType: "Engine",
//     WCPPartType: "ENG",
//     ProductID: "TEST-RID-0002",
//   },
//   {
//     MOQ: 10,
//     CostAud: 9.99,
//     Quality: 0,
//     SupplierPartType: "Engine",
//     WCPPartType: "ENG",
//     ProductID: "TEST-RID-0004",
//   },
//   {
//     MOQ: 10,
//     CostAud: 9.99,
//     Quality: 0,
//     SupplierPartType: "Engine",
//     WCPPartType: "ENG",
//     ProductID: "TEST-RID-0003",
//   },
//   {
//     MOQ: 10,
//     CostAud: 9.99,
//     Quality: 0,
//     SupplierPartType: "Engine",
//     WCPPartType: "ENG",
//     ProductID: "TEST-RID-0001",
//   },
// ]);

// insertAltIndexByProduct("SKU-005", [
//   {
//     MOQ: 10,
//     CostAud: 9.99,
//     Quality: 0,
//     SupplierPartType: "Engine",
//     WCPPartType: "ENG",
//     Supplier: "123-450",
//   },
//   {
//     MOQ: 10,
//     CostAud: 9.99,
//     Quality: 0,
//     SupplierPartType: "Engine",
//     WCPPartType: "ENG",
//     Supplier: "123-456",
//   },
// ]);
