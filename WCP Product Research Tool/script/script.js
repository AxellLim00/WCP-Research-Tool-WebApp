$(async function () {
  var tabChosen = "";
  var menuToggle = true;

  const TOKEN = sessionStorage.getItem("token");
  const PRODUCT_REQUEST_HISTORY_JSON_STRING = sessionStorage.getItem(
    "productRequestHistory"
  );

  if (TOKEN === undefined || TOKEN === null) {
    this.location.href = "../html/login.html";
    return;
  }
  sessionStorage.clear();
  sessionStorage.setItem("token", TOKEN);
  sessionStorage.setItem(
    "productRequestHistory",
    PRODUCT_REQUEST_HISTORY_JSON_STRING
  );

  let jsonArray = JSON.parse(PRODUCT_REQUEST_HISTORY_JSON_STRING);
  if (jsonArray === null) {
    showLoadingScreen("Loading Products from system");
    const WORKFLOW_API = new WorkFlowAPI();

    jsonArray = await WORKFLOW_API.searchProductRequestHistory();
    sessionStorage.setItem("productRequestHistory", JSON.stringify(jsonArray));
    hideLoadingScreen();
  }
  const PRODUCTS = jsonArray.map((object) =>
    Object.assign(new ProductRequestHistoryDto(), object)
  );

  selectTab("tab0");
  sessionStorage.setItem("hasChanges", false);

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
