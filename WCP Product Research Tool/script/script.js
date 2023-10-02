$(function () {
  var tabIdChosen = "";
  var tabIdCurrent = "tab4";
  var menuToggle = true;
  var tempTab;

  selectTab(tabIdCurrent, null);
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
    tabIdChosen = $(this).attr("id");
    var hasChanges = sessionStorage.getItem("hasChanges") == "true";
    if (hasChanges) {
      $(".confirmation").show();
      $("#darkLayer").show();
      $("#darkLayer").css("position", "fixed");
    } else {
      selectTab(tabIdChosen, tabIdCurrent);
      tabIdCurrent = tabIdChosen;
      tabIdChosen = "";
    }
  });

  $('button[name="yes"]').on("click", function () {
    sessionStorage.setItem("hasChanges", false);
    $(".confirmation").hide();
    $("#darkLayer").hide();
    $("#darkLayer").css("position", "absolute");
    selectTab($(`#${tabIdChosen}`).attr("id"), tabIdCurrent);
    tabIdCurrent = tabIdChosen;
    tabIdChosen = "";
  });

  $('button[name="no"]').on("click", function () {
    $(".confirmation").hide();
    $("#darkLayer").hide();
    $("#darkLayer").css("position", "absolute");
  });
});

function contentEnable() {
  $("#darkLayer").hide();
}
function contentDisable() {
  $("#darkLayer").show();
}

function menuExtend() {
  $("#sidebar").addClass("side-extended");
  $(".tab-layout").addClass("tab-layout-extended");
  $(".tab-name").addClass("tab-name-extended");
}

function menuCollapse() {
  $(".tab-layout").removeClass("tab-layout-extended");
  $(".tab-name").removeClass("tab-name-extended");
  $("#sidebar").removeClass("side-extended");
}

function selectTab(tabIdSelected, tabIdCurrently) {
  if (tabIdCurrently) {
    $("#" + tabIdCurrently + "-name").removeClass("tab-name-selected");
    $("#" + tabIdCurrently + "-icon").removeClass("tab-icon-selected");
  }

  $("#" + tabIdSelected + "-name").addClass("tab-name-selected");
  $("#" + tabIdSelected + "-icon").addClass("tab-icon-selected");

  // remove any saved changes on sessionStorage
  sessionStorage.removeItem("tableChanges");

  const content = $("#content");
  switch (tabIdSelected) {
    case "tab0":
      $("#content").load("../html/dashboard.html");
      break;
    case "tab1":
      $("#content").load("../html/product.html");
      break;
    case "tab2":
      $("#content").load("../html/stats.html");
      break;
    case "tab3":
      $("#content").load("../html/cost&Vol.html");
      break;
    case "tab4":
      $("#content").load("../html/altIndex.html");
      break;
    case "tab5":
      $("#content").load("../html/ebay.html");
      break;
    default:
      content.html(`
            <h1>Welcome to Empty Tab</h1>
            <p>This is the content of current Empty Tab with the wrong tab ID.</p>
          `);
      break;
  }
}
