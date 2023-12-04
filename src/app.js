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
        result = {};
        result.Product = await getProduct();
        result.NewProduct = await getNewProduct();
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
    // Use reduce to split the list based on tablename and action
    const separatedLists = updateList.reduce((acc, item) => {
      const key = `${item.tablename}_${item.action}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    let resultArray = [];
    if (seperatedLists["Users_new"])
      resultArray.push(await insertUser(seperatedLists["Users_new"]));

    if (seperatedLists["Product_new"])
      resultArray.push(await insertProduct(seperatedLists["Product_new"]));

    if (seperatedLists["Product_edit"])
      resultArray.push(await updateProduct(seperatedLists["Product_edit"]));

    if (seperatedLists["NewProduct_new"])
      resultArray.push(
        await insertNewProduct(seperatedLists["NewProduct_new"])
      );

    if (seperatedLists["NewProduct_delete"])
      resultArray.push(
        await deleteNewProduct(seperatedLists["NewProduct_delete"])
      );

    if (seperatedLists["KeyType_new"])
      resultArray.push(await insertKType(seperatedLists["KeyType_new"]));

    if (seperatedLists["KeyType_edit"])
      resultArray.push(await updateKType(seperatedLists["KeyType_edit"]));

    if (seperatedLists["KeyType_delete"])
      resultArray.push(await deleteKType(seperatedLists["KeyType_delete"]));

    if (seperatedLists["EPID_new"])
      resultArray.push(await insertEpid(seperatedLists["EPID_new"]));

    if (seperatedLists["EPID_edit"])
      resultArray.push(await updateEpid(seperatedLists["EPID_edit"]));

    if (seperatedLists["EPID_delete"])
      resultArray.push(await deleteEpid(seperatedLists["EPID_delete"]));

    if (seperatedLists["Supplier_new"])
      resultArray.push(await insertSupplier(seperatedLists["Supplier_new"]));

    if (seperatedLists["Supplier_delete"])
      resultArray.push(await deleteSupplier(seperatedLists["Supplier_delete"]));

    if (seperatedLists["AlternateIndex_newProduct"])
      resultArray.push(
        await insertAltIndexByProduct(
          seperatedLists["AlternateIndex_newProduct"]
        )
      );

    if (seperatedLists["AlternateIndex_newSupplier"])
      resultArray.push(
        await insertAltIndexBySupplier(
          seperatedLists["AlternateIndex_newSupplier"]
        )
      );

    if (seperatedLists["AlternateIndex_edit"])
      resultArray.push(
        await updateAltIndex(seperatedLists["AlternateIndex_edit"])
      );

    if (seperatedLists["AlternateIndex_delete"])
      resultArray.push(
        await deleteAltIndex(seperatedLists["AlternateIndex_delete"])
      );

    if (seperatedLists["Oem_newProduct"])
      resultArray.push(
        await insertOemByProduct(seperatedLists["Oem_newProduct"])
      );

    if (seperatedLists["Oem_newSupplier"])
      resultArray.push(
        await insertOemBySupplier(seperatedLists["Oem_newSupplier"])
      );

    if (seperatedLists["Oem_edit"])
      resultArray.push(await updateOem(seperatedLists["Oem_edit"]));

    if (seperatedLists["Oem_delete"])
      resultArray.push(await deleteOem(seperatedLists["Oem_delete"]));

    errors = resultArray.filter((result) => result.status == "ERROR");
    successes = resultArray.filter((result) => result.status == "OK");

    let status = errors ? "ERROR" : "OK";
    if (errors) errors.forEach((err) => console.error(err.error));

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
