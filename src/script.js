import $ from "jquery";
import socket from "./utils/socket-utils.js";

import {
  showLoadingScreen,
  hideLoadingScreen,
  selectTab,
  showAlert,
} from "./utils/html-utils.js";
import { fetchSupplierFromDatabase } from "./utils/fetchSQL-utils.js";
import { updateDataOnDatabase } from "./utils/tab-utils.js";

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

  let jsonArray = JSON.parse(productJsonString);
  if (jsonArray === null || jsonArray.length === 0) {
    showLoadingScreen("Loading Products from system");
    jsonArray = [];

    socket.on("loading progress", (data) => {
      console.log(
        `Loaded page ${data.page} of ${data.totalPages} with ${data.productsLoaded} of ${data.totalProducts} products`
      );
      $(".loading p").html(
        `Loading Products from system</br>~~ ${data.productsLoaded}/${data.totalProducts} products loaded ~~`
      );
    });

    await handleSocketResponse(socket, token, jsonArray);
    sessionStorage.setItem("productRequestHistory", JSON.stringify(jsonArray));
    // TODO: (Level 5) Get unique Supplier Set Array and insert them to the database
    // let isSuccessful = await updateSuppliers(socket, jsonArray);
    // console.log("isSuccessful", isSuccessful);
    // if (!isSuccessful) {
    //   return;
    // }
  } else {
    selectTab("tab0");
  }

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
          hideLoadingScreen();
          selectTab("tab0");
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
    let filteredNewSupplier = Array.from(
      new Set(
        jsonArray
          .filter(
            (product) =>
              product.altIndexNumber &&
              !supplierList.some(
                (supplier) => supplier.SupplierNumber === product.altIndexNumber
              )
          )
          .map((product) => ({
            SupplierNumber: product.altIndexNumber,
            SupplierName: product.vendorName,
            Currency: "AUD",
          }))
      )
    );
    if (filteredNewSupplier.length > 0) {
      console.log("Inserting new suppliers into database");
      let changes = [
        new Map([
          ["table", "Supplier"],
          ["type", "new"],
          ["changes", filteredNewSupplier],
        ]),
      ];
      debugger;
      let isSuccessful = await updateDataOnDatabase(socket, changes);
      return isSuccessful;
    }
    return true;
  } catch (error) {
    // Error already handled in fetchAltIndexFromDatabase
    console.error(error);
    return false;
  }
}
