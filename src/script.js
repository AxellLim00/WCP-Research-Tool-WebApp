import $ from "jquery";
import socket from "./utils/socket-utils.js";

import {
  showLoadingScreen,
  hideLoadingScreen,
  selectTab,
  showAlert,
} from "./utils/html-utils.js";
import {
  fetchSupplierFromDatabase,
  fetchProductDataFromDatabase,
} from "./utils/fetchSQL-utils.js";
import {
  updateDataOnDatabase,
  updateProductRequestHistory,
  generateProductID,
  findMatchingProductDetail,
} from "./utils/tab-utils.js";
import { ProductDto } from "./utils/class/dataTableDto.js";
import { updateChanges, saveChanges } from "./utils/tab-utils.js";
import { ProductRequestHistoryDto } from "./utils/class/apiDto.js";

$(async function () {
  const token = sessionStorage.getItem("token");
  const productJsonString = sessionStorage.getItem("productRequestHistory");
  var tabChosen = "";
  var menuToggle = true;

  if (token === undefined || token === null) {
    location.href = location.origin;
    return;
  }
  sessionStorage.setItem("hasChanges", false);
  sessionStorage.removeItem("productIDSelected");

  showLoadingScreen("Loading Products from system");
  let productReqHistArray = JSON.parse(productJsonString);
  if (productReqHistArray === null || productReqHistArray.length === 0) {
    productReqHistArray = [];

    try {
      socket.on("loading progress", (data) => {
        console.log(
          `Loaded page ${data.page} of ${data.totalPages} with ${data.productsLoaded} of ${data.totalProducts} products`
        );
        $(".loading p").html(
          `Loading Products from system</br>~~ ${data.productsLoaded}/${data.totalProducts} products loaded ~~`
        );
      });

      await handleSocketResponse(socket, token, productReqHistArray);
      sessionStorage.setItem(
        "productRequestHistory",
        JSON.stringify(productReqHistArray)
      );
    } catch (error) {
      console.error("An error occurred:", error);
      return;
    }
    // Sync with database
    await syncWorkflowDatabaseData();

    // Get unique Supplier Set Array and insert them to the database
    let isSuccessful = await updateSuppliers(socket, productReqHistArray);
    console.log("isSuccessful", isSuccessful);
    // if updateSuppliers is not successful, do not continue
    if (!isSuccessful) return;
  }

  hideLoadingScreen();
  selectTab("tab0");

  $("#menu").on("click", function () {
    if (menuToggle) {
      menuExtend();
      contentDisable();
    } else {
      menuCollapse();
      contentEnable();
    }
    menuToggle = !menuToggle;
  });

  $(".tab").on("click", function () {
    tabChosen = $(this).attr("id");
    var hasChanges = sessionStorage.getItem("hasChanges") == "true";
    if (hasChanges) {
      $("#switchConfirmation.confirmation").show();
      $("#darkLayer").show();
      $("#darkLayer").css("position", "fixed");
    } else {
      selectTab(tabChosen);
      tabChosen = "";
    }
  });

  //#region Confirmation Button Events

  // Switch Tab confirmation
  $('#switchConfirmation button[name="yes"]').on("click", function () {
    sessionStorage.setItem("hasChanges", false);
    $("#switchConfirmation.confirmation").hide();
    $("#darkLayer").hide();
    $("#darkLayer").css("position", "absolute");
    selectTab($(`#${tabChosen}`).attr("id"));
    tabChosen = "";
  });

  $('#switchConfirmation button[name="no"]').on("click", function () {
    $("#switchConfirmation.confirmation").hide();
    $("#darkLayer").hide();
    $("#darkLayer").css("position", "absolute");
  });

  //Switch Product Confirmation
  $('#searchConfirmation button[name="yes"]').on("click", function () {
    sessionStorage.setItem("hasChanges", false);
    $("#searchConfirmation.confirmation").hide();
    $("#darkLayer").hide();
    $("#darkLayer").css("position", "absolute");
    selectTab($(".tab-selected").attr("id"));
    sessionStorage.setItem("productIDSelected", $("#productSelected").val());
  });

  $('#searchConfirmation button[name="no"]').on("click", function () {
    $("#searchConfirmation.confirmation").hide();
    $("#darkLayer").hide();
    $("#darkLayer").css("position", "absolute");
    $("#productSelected").val($("#productSelected").attr("oldValue"));
  });

  //#endregion
});

/**
 * Disable the dark layer, enabling content UI elements
 */
function contentEnable() {
  $("#darkLayer").hide();
}

/**
 * Enable the dark layer, disabling content UI elements
 */
function contentDisable() {
  $("#darkLayer").show();
}

/**
 * Extends the Tab Panel
 */
function menuExtend() {
  $("#sidebar").addClass("side-extended");
  $(".tab-layout").addClass("tab-layout-extended");
  $(".tab-name").addClass("tab-name-extended");
}

/**
 * Collapse the Tab Panel
 */
function menuCollapse() {
  $(".tab-layout").removeClass("tab-layout-extended");
  $(".tab-name").removeClass("tab-name-extended");
  $("#sidebar").removeClass("side-extended");
}

/**
 * Get all products from the system
 * @param {SocketIO.Socket} socket SocketIO socket
 * @param {String} token User token
 * @param {Array} jsonArray Array to push all products to
 */
async function handleSocketResponse(socket, token, jsonArray) {
  return new Promise((resolve) => {
    console.log("Getting Product from system");
    socket.emit("get all products", token, (response) => {
      switch (response.status) {
        case 200:
          jsonArray.push(...response.data);
          resolve();
          break;
        case 401:
          console.log(response.message);
          this.location.href -= "research-tool";
          resolve();
          break;
        default:
          showAlert(response.message);
          console.error(response.message);
          console.error(response.error);
          resolve();
          break;
      }
    });
  });
}

/**
 * Update the suppliers in the database
 * @param {SocketIO.Socket} socket SocketIO socket
 * @param {Array} jsonArray Array of products
 * @returns {Promise<Boolean>} Return true if successful, false otherwise
 */
async function updateSuppliers(socket, jsonArray) {
  try {
    let supplierList = await fetchSupplierFromDatabase(socket);
    let uniqueSuppliers = new Map();
    let filteredNewSupplier = jsonArray
      .filter(
        (product) =>
          product.vendorId &&
          !supplierList.some(
            (supplier) => supplier.SupplierNumber == product.vendorId
          )
      )
      .map((product) => ({
        SupplierNumber: product.vendorId,
        SupplierName: product.vendorName,
        Currency: "AUD",
      }))
      .filter((supplier) => {
        const key = `${supplier.SupplierNumber}-${supplier.SupplierName}`;
        if (!uniqueSuppliers.has(key)) {
          uniqueSuppliers.set(key, true);
          return true;
        }
        return false;
      });
    // Insert new suppliers into database if there is any
    if (filteredNewSupplier.length > 0) {
      console.log("Inserting new suppliers into database");
      let changes = [
        new Map([
          ["table", "Supplier"],
          ["type", "new"],
          ["changes", filteredNewSupplier],
        ]),
      ];
      let isSuccessful = await updateDataOnDatabase(socket, changes);
      return isSuccessful;
    }
    console.log("No new supplier found");
    return true;
  } catch (error) {
    // Error already handled in fetchAltIndexFromDatabase
    console.error(error);
    return false;
  }
}

async function syncWorkflowDatabaseData() {
  // Update productRequestHistory in StorageSession with new Product-Details from the New Product Table (Database)
  // As well as fetching the ProductDetails from the database
  const { Product: productDetailsFromDatabase, NewProduct: _ } =
    await updateProductRequestsWithDatabase(socket);
  const productAddingToDatabase = [];
  const productObjectList = [];

  const productReqHistArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  ).map((object) => Object.assign(new ProductRequestHistoryDto(), object));

  productReqHistArray.forEach((currProdHistReq, idx, array) => {
    // If productStockNumber is not empty and exist in productObjectList, skip this iteration
    if (
      currProdHistReq.productStockNumber &&
      productObjectList.find((x) => x.Sku == currProdHistReq.productStockNumber)
    )
      return;

    // If current product's SKU is empty, generate a Research ID
    if (!currProdHistReq.productStockNumber) {
      currProdHistReq.researchIdentifier = generateProductID(
        `${currProdHistReq.interchangeNumber.trim()}${
          currProdHistReq.interchangeVersion
        }`,
        currProdHistReq.partTypeCode
      );
    }

    // Find productDetail Match in database
    let productDetailMatch = findMatchingProductDetail(
      productDetailsFromDatabase,
      currProdHistReq
    );
    // Assign ResearchID to currObject if productDetailMatch exist else assign New ResearchID
    let researchId = productDetailMatch
      ? productDetailMatch.ResearchID
      : currProdHistReq.researchIdentifier;

    // FOR DEBUG
    // if (researchId && researchId.includes("TEST")) console.log(researchId);

    // Update productDtoArray researchIdentifier here based on productDetailMatch's Values
    array[idx].researchIdentifier = researchId;
    productObjectList.push({
      Id: researchId,
      Sku: currProdHistReq.productStockNumber,
      Status: productDetailMatch
        ? productDetailMatch.Status
        : currProdHistReq.productStockNumber &&
          currProdHistReq.productStockNumber.includes("P-")
        ? "catalogue"
        : "research",
      Oem: productDetailMatch
        ? productDetailMatch.OemType
        : currProdHistReq.productStockNumber
        ? ""
        : "aftermarket",
      LastUpdate: "1900-01-01",
    });

    // If product is not in database, add to database
    if (!productDetailMatch) {
      productAddingToDatabase.push(
        productObjectList[productObjectList.length - 1]
      );
    }
  });

  // Insert all product in productDtoArray that has no productDetailMatch to the database
  await insertNewWorkflowProductToDatabase(socket, productAddingToDatabase);

  // Delete all productDetails that is not in productRequestHistory anymore
  const productDetailsToDelete = findProductDetailsToDelete(
    productDetailsFromDatabase,
    productReqHistArray
  );

  if (productDetailsToDelete.length > 0) {
    updateChanges(productDetailsToDelete);
    await saveChanges(socket);
  }

  // Update product with new Generated Research ID
  sessionStorage.setItem(
    "productRequestHistory",
    JSON.stringify(productReqHistArray)
  );
}

/**
 * Find ProductDetails with minimal date that is not in productRequestHistory anymore
 * @param {ProductDetail[]} productDetailsFromDatabase Array of ProductDetails from the database
 * @param {ProductRequestHistoryDto[]} productReqHistArray Array of ProductRequestHistoryDto objects
 * @returns {ProductDetail[]} Array of ProductDetails to delete
 */
function findProductDetailsToDelete(
  productDetailsFromDatabase,
  productReqHistArray
) {
  const productDetailsToDelete = [];

  productDetailsFromDatabase.forEach((productDetail) => {
    const isProductInHistory = productReqHistArray.some((productReqHist) => {
      return (
        // Check if they have the same ResearchID
        (productReqHist.researchIdentifier !== null &&
          productDetail.ResearchID !== null &&
          productReqHist.researchIdentifier === productDetail.ResearchID) ||
        // Check if they have the same SKU
        (productReqHist.productStockNumber !== null &&
          productDetail.SKU !== null &&
          productReqHist.productStockNumber === productDetail.SKU)
      );
    });

    // Check if LastUpdate is equal to "1900-01-01"
    const isLastUpdateEqual = productDetail.LastUpdate === "1900-01-01";

    if (!isProductInHistory && isLastUpdateEqual) {
      const id =
        productDetail.SKU !== null
          ? productDetail.SKU
          : productDetail.ResearchID;
      const map = new Map([
        ["type", "delete"],
        ["table", "Product"],
        ["id", id],
      ]);
      productDetailsToDelete.push(map);
    }
  });

  return productDetailsToDelete;
}

/**
 * Insert New Product in Workflow to the SQL Database
 * @param {Socket<DefaultEventsMap, DefaultEventsMap>} socket
 * @param {ProductDto[]} productAddingToDatabase Array of new Products
 * @returns {Promise<void>}
 */
async function insertNewWorkflowProductToDatabase(
  socket,
  productAddingToDatabase
) {
  const sqlInsertLimit = 1000;
  const totalProducts = productAddingToDatabase.length;

  if (totalProducts === 0) return;

  const updateLoops = Math.ceil(totalProducts / sqlInsertLimit);

  for (let i = 0; i < updateLoops; i++) {
    const startIndex = i * sqlInsertLimit;
    const endIndex = startIndex + sqlInsertLimit;
    const productsToInsert = productAddingToDatabase.slice(
      startIndex,
      endIndex
    );

    const changes = new Map([
      ["type", "new"],
      ["table", "Product"],
      ["user", "product-research-tool"],
      ["changes", productsToInsert],
    ]);

    updateChanges([changes]);
    await saveChanges(socket);
  }
}

/**
 * Update product request history with new products
 * @returns {Promise<Object>} Return Array of Product and NewProduct data from database
 */

async function updateProductRequestsWithDatabase(socket) {
  //Load Product from Database
  const { Product: productDetails, NewProduct: newProductSaved } =
    await fetchProductDataFromDatabase(socket).catch((error) =>
      console.error(error)
    );

  // Update productRequestHistory in StorageSession with new Product-Details from the New Product Table (Database)
  updateProductRequestHistory(newProductSaved, productDetails);
  return { Product: productDetails, NewProduct: newProductSaved };
}
