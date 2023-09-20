$(document).ready(function () {
  var tabIdSelected = "tab2";
  var menuToggle = true;

  selectTab(tabIdSelected, null);

  $("#menu").click(function () {
    if (menuToggle) {
      menuExtend();
      contentDisable();
    } else {
      menuCollapse();
      contentEnable();
    }
    menuToggle = !menuToggle;
  });

  $(".tab").click(function () {
    selectTab($(this).attr("id"), tabIdSelected);
    tabIdSelected = $(this).attr("id");
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

function selectTab(tabIdSelected, tabIdPrevious) {
  if (tabIdPrevious) {
    $("#" + tabIdPrevious + "-name").removeClass("tab-name-selected");
    $("#" + tabIdPrevious + "-icon").removeClass("tab-icon-selected");
  }

  $("#" + tabIdSelected + "-name").addClass("tab-name-selected");
  $("#" + tabIdSelected + "-icon").addClass("tab-icon-selected");

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
            <p>This is the content of current Empty Tab.</p>
          `);
      break;
  }
}
