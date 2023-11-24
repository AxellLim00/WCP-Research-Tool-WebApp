import $ from "jquery";
import io from "socket.io-client";
const socket = io();

import {
  showLoadingScreen,
  hideLoadingScreen,
  selectTab,
  showAlert,
} from "./utils/html-utils.js";

$(async function () {
  const token = sessionStorage.getItem("token");
  const productJsonString = sessionStorage.getItem("productRequestHistory");
  var tabChosen = "";
  var menuToggle = true;

  if (token === undefined || token === null) {
    location.href = location.origin;
    return;
  }
  sessionStorage.clear();
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("productRequestHistory", productJsonString);
  sessionStorage.setItem("hasChanges", false);

  let jsonArray = JSON.parse(productJsonString);
  if (jsonArray === null) {
    showLoadingScreen("Loading Products from system");
    const socketPromise = new Promise((resolve) => {
      console.log("Getting Product from system");
      socket.emit("get all products", token, resolve);
    });

    socketPromise.then((response) => {
      switch (response.status) {
        case 200:
          sessionStorage.setItem(
            "productRequestHistory",
            JSON.stringify(response.data)
          );
          hideLoadingScreen();
          selectTab("tab0");
          break;
        case 401:
          console.log(response.message);
          this.location.href -= "research-tool";
          break;
        default:
          showAlert(response.message);
          console.error(response.message);
          console.error(response.error);
          break;
      }
    });

    socket.on("loading progress", (data) => {
      console.log(
        `Loaded page ${data.page} of ${data.totalPages} with ${data.productsLoaded} of ${data.totalProducts} products`
      );
      $(".loading p").html(
        `Loading Products from system</br>~~ ${data.productsLoaded}/${data.totalProducts} products loaded ~~`
      );
    });
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

  //#region Comfirmation Button Events

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
    $("#productSelected").val($("#productSelected").attr("oldvalue"));
    // $("#productSelected").attr("oldvalue", "");
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
