const $ = require("jquery");
const DataTable = require("datatables.net-dt");

/**
 * Shows Alert message by appending or unhiding div with alert class
 * @param {String} message Alert message shown (can have html inside)
 * @returns {void}
 */
module.exports.showAlert = function (message) {
  // Check if alert has been made before
  if (!$(".alert").length) {
    $("body").append(`
          <div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
            <div id=AlertMessage>${message}</div>
          </div>`);
  }
  // Show previously made alert
  else if ($(".alert").is(":hidden")) {
    $("#AlertMessage").html(message);
    $(".alert").show();
  } else {
    $("#AlertMessage").html(message);
  }
};

/**
 * Shows or unhides Pop-up form, disable screen besides form
 * @param {String} type Type of form to show
 * @param {String} title Title of the form
 * @returns {void}
 */
module.exports.showPopUpForm = function (type, title) {
  $('h2[name="formTitle"]').text(title);
  $("#popupForm").show();
  $(`#${type}Form`).show();
  $("#darkLayer").css("position", "fixed");
  $("#darkLayer").show();
};

/**
 * Hides Pop-up form, enable screen besides form
 * @param {String} type Type of form to show
 * @returns
 */
module.exports.hidePopUpForm = function (type) {
  // Finally hide Form from user
  $("#popupForm").hide();
  $(`#${type}Form`).hide();
  $(".alert").hide();
  $("#darkLayer").hide();
  $("#darkLayer").css("position", "absolute");
};

/**
 * Exits pop-up form and resets all input in form
 * @param {String} type Type of form to exit
 * @returns
 */
module.exports.exitPopUpForm = function (type) {
  hidePopUpForm(type);

  // Reset textboxes' and selectboxes' values
  $(`#${type}Form input[type="text"]`).val("");
  $(`#${type}Form select`).val("");
  $(`#${type}Form input[type="checkbox"]`).prop("checked", false);
};

/**
 * Show loading screen when method is called
 * @param {String} loadingMessage Message to display when loading
 */
module.exports.showLoadingScreen = function (loadingMessage) {
  $("#darkLayer").css("position", "fixed");
  $("#darkLayer").show();
  $(".loading").show();
  $(".loading p").text(loadingMessage);
};

/**
 * Hides loading screen, use this after showLoadingScreen is called
 */
module.exports.hideLoadingScreen = function () {
  $("#darkLayer").hide();
  $("#darkLayer").css("position", "absolute");
  $(".loading").hide();
};

/**
 * Swithces tab on the layout.html level by loading HTML into #content
 * @param {String} tabIdSelected Tab's ID to switch to
 * @returns {void}
 */
module.exports.selectTab = function (tabIdSelected) {
  currentTab = $(".tab-selected").attr("id");
  if (currentTab) {
    $("#" + currentTab + "-name").removeClass("tab-name-selected");
    $("#" + currentTab + "-icon").removeClass("tab-icon-selected");
    $("#" + currentTab).removeClass("tab-selected");
  }

  $("#" + tabIdSelected + "-name").addClass("tab-name-selected");
  $("#" + tabIdSelected + "-icon").addClass("tab-icon-selected");
  $("#" + tabIdSelected).addClass("tab-selected");
  // remove any saved changes on Session Storage
  sessionStorage.removeItem("savedChanges");

  // Clear all search function in DataTable
  $.fn.dataTable.ext.search.length = 0;

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
};
