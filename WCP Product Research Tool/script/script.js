$(function () {
  var tabChosen = "";
  var menuToggle = true;

  sessionStorage.clear();

  sessionStorage.setItem("currentTab", "tab1");
  selectTab("tab1");
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
      $(".confirmation").show();
      $("#darkLayer").show();
      $("#darkLayer").css("position", "fixed");
    } else {
      selectTab(tabChosen);
      tabChosen = "";
    }
  });

  $('button[name="yes"]').on("click", function () {
    sessionStorage.setItem("hasChanges", false);
    $(".confirmation").hide();
    $("#darkLayer").hide();
    $("#darkLayer").css("position", "absolute");
    selectTab($(`#${tabChosen}`).attr("id"));
    tabChosen = "";
  });

  $('button[name="no"]').on("click", function () {
    $(".confirmation").hide();
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
