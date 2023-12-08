import express from "express";
const app = express();
import { createServer } from "http";
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server);
const PORT = process.env.PORT || 5000;
import path from "path";
import { fileURLToPath } from "url";
import { authenticate, getAllProduct } from "./utils/workflow.js";
import { FreeCurrencyAPI } from "./utils/class/freeCurrencyAPI.js";
const freeCurrencyAPI = new FreeCurrencyAPI();
import {
  getUsersProduct,
  getProduct,
  getNewProduct,
  getKeyType,
  getEpid,
  getSupplier,
  getAltIndex,
  getOem,
  insertUser,
  insertProduct,
  updateProduct,
  deleteNewProduct,
  insertKType,
  updateKType,
  deleteKType,
  insertEpid,
  updateEpid,
  deleteEpid,
  insertSupplier,
  deleteSupplier,
  insertAltIndexByProduct,
  insertAltIndexBySupplier,
  updateAltIndex,
  deleteAltIndex,
  insertOemByProduct,
  insertOemBySupplier,
  updateOem,
  deleteOem,
} from "./utils/sql-utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// run server using "npm run dev"
app.use(express.static(path.join(__dirname + "/../public")));

app.get("/", (_, res) => {
  res.sendFile("public/html/login.html");
});

app.get("/research-tool", (_, res) => {
  res.sendFile(path.join(__dirname + "/../public/html/layout.html"));
});

io.on("connect", async function (socket) {
  console.log("A user has connected.");
  const credentials = socket.handshake.auth;
  if (Object.keys(credentials).length) {
    const response = await authenticate(
      credentials.username,
      credentials.password
    );
    if (response.status == "authenticated") {
      console.log(`User ${credentials.username} has been Authenticated`);
      socket.emit("authenticated", response.token);
    } else {
      console.log(`User ${credentials.username} has Fail to be Authenticated`);
      socket.emit("fail authenticated", response.error);
    }
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected.");
  });

  socket.on("get all products", async (token, callback) => {
    console.log("Fetching products...");
    try {
      const result = await getAllProduct(socket, token);
      console.log("Fetching successful");
      const data = {
        status: 200,
        data: result,
      };
      callback(data);
    } catch (error) {
      console.log("Fetching Failed", error.status);
      let errorData;
      if (error.status === 401) {
        errorData = {
          status: 401,
          message:
            "Token has expired or invalidated. Bring user back to login page.",
        };
      } else {
        console.error(
          "Error searching product request history:",
          error.status,
          error.message
        );
        errorData = {
          status: error.status,
          message: `Error searching product request history: ${error.status} ${error.message}`,
          error: error,
        };
      }
      callback(errorData);
    }
  });

  socket.on("get all currency", async (callback) => {
    var responseJSON;
    await freeCurrencyAPI
      .latest({
        base_currency: "AUD",
      })
      .then((response) => {
        responseJSON = response;
      });
    callback(responseJSON);
  });

  socket.on("get object database", async (table, productID, callback) => {
    let result;
    switch (table) {
      case "Users":
        result = await getUsersProduct();
        break;
      case "Product":
        let product = await getProduct();
        let newProduct = await getNewProduct();
        if (product.status == "OK" && newProduct.status == "OK")
          result = {
            status: "OK",
            result: { Product: product.result, NewProduct: newProduct.result },
          };
        else {
          result = { status: "ERROR", error: [] };
          if (product.status == "ERROR") result.error.push(product.error);
          if (newProduct.status == "ERROR") result.error.push(newProduct.error);
        }
        break;
      case "KeyType":
        result = await getKeyType(productID);
        break;
      case "EPID":
        result = await getEpid(productID);
        break;
      case "Supplier":
        result = await getSupplier();
        break;
      case "AlternateIndex":
        result = await getAltIndex(productID);
        break;
      case "Oem":
        result = await getOem(productID);
        break;
      default:
        result = {
          status: "ERROR",
          error: `There is no table with the name ${table} in the database`,
        };
        break;
    }
    callback(result);
  });

  socket.on("update database", async (updateList, callback) => {
    // TO DO: Change from using map to just Objects
    // Use reduce to split the list based on tablename and action
    updateList = updateList.map((obj) => new Map(JSON.parse(obj)));
    const separatedLists = updateList.reduce((acc, item) => {
      const key = `${item.get("table")}_${item.get("type")}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    let resultArray = [];
    if (separatedLists["Users_new"])
      resultArray.push(await insertUser(separatedLists["Users_new"]));

    if (separatedLists["Product_new"])
      resultArray.push(await insertProduct(separatedLists["Product_new"]));

    if (separatedLists["Product_edit"])
      resultArray.push(await updateProduct(separatedLists["Product_edit"]));

    if (separatedLists["NewProduct_new"])
      resultArray.push(
        await insertNewProduct(separatedLists["NewProduct_new"])
      );

    if (separatedLists["NewProduct_delete"])
      resultArray.push(
        await deleteNewProduct(separatedLists["NewProduct_delete"])
      );

    if (separatedLists["KeyType_new"])
      resultArray.push(await insertKType(separatedLists["KeyType_new"]));

    if (separatedLists["KeyType_edit"])
      resultArray.push(await updateKType(separatedLists["KeyType_edit"]));

    if (separatedLists["KeyType_delete"])
      resultArray.push(await deleteKType(separatedLists["KeyType_delete"]));

    if (separatedLists["EPID_new"])
      resultArray.push(await insertEpid(separatedLists["EPID_new"]));

    if (separatedLists["EPID_edit"])
      resultArray.push(await updateEpid(separatedLists["EPID_edit"]));

    if (separatedLists["EPID_delete"])
      resultArray.push(await deleteEpid(separatedLists["EPID_delete"]));

    if (separatedLists["Supplier_new"])
      resultArray.push(await insertSupplier(separatedLists["Supplier_new"]));

    if (separatedLists["Supplier_delete"])
      resultArray.push(await deleteSupplier(separatedLists["Supplier_delete"]));

    if (separatedLists["AlternateIndex_newProduct"])
      resultArray.push(
        await insertAltIndexByProduct(
          separatedLists["AlternateIndex_newProduct"]
        )
      );

    if (separatedLists["AlternateIndex_newSupplier"])
      resultArray.push(
        await insertAltIndexBySupplier(
          separatedLists["AlternateIndex_newSupplier"]
        )
      );

    if (separatedLists["AlternateIndex_edit"])
      resultArray.push(
        await updateAltIndex(separatedLists["AlternateIndex_edit"])
      );

    if (separatedLists["AlternateIndex_delete"])
      resultArray.push(
        await deleteAltIndex(separatedLists["AlternateIndex_delete"])
      );

    if (separatedLists["Oem_newProduct"])
      resultArray.push(
        await insertOemByProduct(separatedLists["Oem_newProduct"])
      );

    if (separatedLists["Oem_newSupplier"])
      resultArray.push(
        await insertOemBySupplier(separatedLists["Oem_newSupplier"])
      );

    if (separatedLists["Oem_edit"])
      resultArray.push(await updateOem(separatedLists["Oem_edit"]));

    if (separatedLists["Oem_delete"])
      resultArray.push(await deleteOem(separatedLists["Oem_delete"]));

    let errors = resultArray.filter((result) => result.status == "ERROR");
    let successes = resultArray.filter((result) => result.status == "OK");
    let status = "OK";
    if (errors.length > 0) {
      errors.forEach((err) => console.error(err.error));
      status = "ERROR";
    }

    callback({
      status: status,
      errors: errors,
      success: successes.map((suc) => suc.message).join(",\n"),
    });
  });
});

server.listen(PORT, () => {
  console.log(`Listen on *:${PORT} for http://localhost:5000`);
});
