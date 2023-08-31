$(document).ready(function () {
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
  document.getElementById("darkLayer").style.display = "none";
}
function contentDisable() {
  document.getElementById("darkLayer").style.display = "";
}

function menuExtend() {
  const tabs = document.querySelectorAll(".tab-layout");
  const tabNames = document.querySelectorAll(".tab-name");
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("side-extended");
  tabs.forEach((tab) => {
    tab.classList.add("tab-layout-extended");
  });
  tabNames.forEach((tabName) => {
    tabName.classList.add("tab-name-extended");
  });
}

function menuCollapse() {
  const tabs = document.querySelectorAll(".tab-layout");
  const tabNames = document.querySelectorAll(".tab-name");
  const sidebar = document.getElementById("sidebar");
  tabs.forEach((tab) => {
    tab.classList.remove("tab-layout-extended");
  });
  tabNames.forEach((tabName) => {
    tabName.classList.remove("tab-name-extended");
  });
  sidebar.classList.remove("side-extended");
}

function selectTab(tabIdSelected, tabIdPrevious) {
  const tabNameSelected = $("#" + tabIdSelected + "-name");
  const tabIconSelected = $("#" + tabIdSelected + "-icon");
  const content = $("#content");

  if (tabIdPrevious) {
    const tabNamePrevious = $("#" + tabIdPrevious + "-name");
    const tabIconPrevious = $("#" + tabIdPrevious + "-icon");
    tabNamePrevious.classList.remove("tab-name-selected");
    tabIconPrevious.classList.remove("tab-icon-selected");
  }

  tabNameSelected.classList.add("tab-name-selected");
  tabIconSelected.classList.add("tab-icon-selected");

  switch (tabIdSelected) {
    case "tab0":
      content.innerHTML = `
            <h1>Welcome to Tab 0</h1>
            <p>This is the content of Tab 0.</p>
            `;
      break;
    case "tab1":
      content.innerHTML = `
            <h1>Welcome to Tab 1</h1>
            <p>This is the content of Tab 1.</p>
          `;
      break;
    case "tab2":
      content.innerHTML = `
            <h1>Welcome to Tab 2</h1>
            <p>This is the content of Tab 2.</p>
          `;
      break;
    case "tab3":
      content.innerHTML = `
            <h1>Welcome to Tab 3</h1>
            <p>This is the content of Tab 3.</p>
          `;
      break;
    case "tab4":
      content.innerHTML = `
            <h1>Welcome to Tab 4</h1>
            <p>This is the content of Tab 4.</p>
          `;
      break;
    case "tab5":
      content.innerHTML = `
            <h1>Welcome to Tab 5</h1>
            <p>This is the content of Tab 5.</p>
          `;
      break;
    default:
      content.innerHTML = `
            <h1>Welcome to Empty Tab</h1>
            <p>This is the content of current Empty Tab.</p>
          `;
      break;
  }
}
