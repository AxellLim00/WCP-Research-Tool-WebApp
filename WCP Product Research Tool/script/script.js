$(document).ready(function () {
  productChosen = "Test product1";
  var tabIdSelected = "tab0";
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
      content.html(`
            <h1>Welcome to Tab 1</h1>
            <p>This is the content of Tab 1.</p>
          `);
      break;
    case "tab2":
      content.html(`
            <h1>Welcome to Tab 2</h1>
            <p>This is the content of Tab 2.</p>
          `);
      break;
    case "tab3":
      content.html(`
            <h1>Welcome to Tab 3</h1>
            <p>This is the content of Tab 3.</p>
          `);
      break;
    case "tab4":
      content.html(`
            <h1>Welcome to Tab 4</h1>
            <p>This is the content of Tab 4.</p>
          `);
      break;
    case "tab5":
      content.html(`
            <h1>Welcome to Tab 5</h1>
            <p>This is the content of Tab 5.</p>
          `);
      break;
    default:
      content.html(`
            <h1>Welcome to Empty Tab</h1>
            <p>This is the content of current Empty Tab.</p>
          `);
      break;
  }
}
