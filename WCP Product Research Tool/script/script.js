$(async function () {
  var tabChosen = "";
  var menuToggle = true;

  const TOKEN = sessionStorage.getItem("token");
  if (TOKEN === undefined || TOKEN == "null")
    this.location.href = "../html/login.html";
  sessionStorage.clear();
  sessionStorage.setItem("token", TOKEN);

  sessionStorage.setItem("currentTab", "tab0");
  selectTab("tab0");
  sessionStorage.setItem("hasChanges", false);

  // TO DO: make loading screen to wait for this to finish
  // TO DO: store products in session storage and prevent it from loading again unless session restarts
  const WORKFLOW_API = new WorkFlowAPI();
  const products = await WORKFLOW_API.searchProductRequestHistory();
  console.log(products);

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
