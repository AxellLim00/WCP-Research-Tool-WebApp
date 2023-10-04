/**
 * Swithces tab on the layout.html level by loading HTML into #content
 * @param {String} tabIdSelected Tab's ID to switch to
 * @returns {void}
 */
function selectTab(tabIdSelected) {
  currentTab = sessionStorage.getItem("currentTab");
  if (currentTab) {
    $("#" + currentTab + "-name").removeClass("tab-name-selected");
    $("#" + currentTab + "-icon").removeClass("tab-icon-selected");
  }

  $("#" + tabIdSelected + "-name").addClass("tab-name-selected");
  $("#" + tabIdSelected + "-icon").addClass("tab-icon-selected");
  // remove any saved changes on Session Storage
  sessionStorage.removeItem("tableChanges");
  sessionStorage.setItem("currentTab", tabIdSelected);

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

/**
 * Gets empty rows for a html table based on rows and columns
 * @param {Number} rowQuantity How many empty rows to create
 * @param {Number} [columnQuantity=1] How many column are there in the table, default is 1
 * @returns {String} html \<tr\> rows
 */
function getEmptyRow(rowQuantity, columnQuantity = 1) {
  return ("<tr>" + "<td></td>".repeat(columnQuantity) + "</tr>").repeat(
    rowQuantity
  );
}

/**
 * Shows Alert message by appending or unhiding div with alert class
 * @param {String} message Alert message shown (can have html inside)
 * @returns {void}
 */
function showAlert(message) {
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
  }
}

//TO DO: check whether hasChange is grabbed from Session Storage correctly
/**
 * Set Session Storage's "hasChanges" to hasChange parameter
 * @param {Boolean} hasChange Tab's ID to switch
 * @returns {}
 */
function updateHasChanges(hasChange) {
  // change hasChanges value in session storage
  sessionStorage.setItem("hasChanges", hasChange);
  // Change save button to warning color (yellow) when true
  if (hasChange) {
    $("button[name=saveBtn]").css("background-color", "#ffc205");
    // Apply hover effect
    $("button[name=saveBtn]")
      .on("mouseenter", function () {
        $(this).css("background-color", "#ffda69");
      })
      .on("mouseleave", function () {
        $(this).css("background-color", "#ffc205");
      });
    // Change save button back to normal when false
  } else {
    $("button[name=saveBtn]").removeAttr("style");
    $("button[name=saveBtn]").off("mouseenter mouseleave");
  }
}

/**
 * Find first missing header inside JSON Sheet
 * @param {Dictionary} rowObject First instance/element of JSON sheet (needs to contain headers)
 * @param {String[]} arrayHeader Array of header names to check
 * @returns {String} missing header name when found, otherwise empty string
 */
function findMissingColumnHeader(rowObject, arrayHeader) {
  for (let header of arrayHeader) {
    if (header == null) {
      continue;
    }
    if (!rowObject.hasOwnProperty(header)) {
      return header;
    }
  }
  return "";
}

/**
 * Shows or unhides Pop-up form, disable screen besides form
 * @param {String} type Type of form to show
 * @param {String} title Title of the form
 * @returns {void}
 */
function showPopUpForm(type, title) {
  $('h2[name="formTitle"]').text(title);
  $("#popupForm").show();
  $(`#${type}Form`).show();
  $("#darkLayer").css("position", "fixed");
  $("#darkLayer").show();
}

/**
 * Hides Pop-up form, enable screen besides form
 * @param {String} type Type of form to show
 * @returns
 */
function hidePopUpForm(type) {
  // Finally hide Form from user
  $("#popupForm").hide();
  $(`#${type}Form`).hide();
  $(".alert").hide();
  $("#darkLayer").hide();
  $("#darkLayer").css("position", "absolute");
}

/**
 * Exits pop-up form and resets all input in form
 * @param {String} type Type of form to exit
 * @returns
 */
function exitPopUpForm(type) {
  hidePopUpForm(type);

  // Reset textboxes' and selectboxes' values
  $(`#${type}Form input`).val("");
  $(`#${type}Form select`).val("");
  $(`#${type}Form input`).prop("checked", false);
}

/**
 * Save changes made to sessionStorage's "savedChanges" in JSON Format
 * @param {Map} change Map of changes to be saved
 * @returns 
 */
function updateChanges(change) {
  storedChanges = sessionStorage.getItem("savedChanges");
  if (storedChanges === null) {
    sessionStorage.setItem("savedChanges", JSON.stringify(change));
    return;
  }
  storedChanges.push(...change);
  sessionStorage.setItem("savedChanges", JSON.stringify(storedChanges));
}

/**
 * Save changes made to SQL
 * SessionStorage "savedChanges" will be cleared
 * @returns {boolean} true if successful, false otherwise
 */
function saveChangesToSQL() {
  // TO DO: translate Map changes to SQL
  // TO DO: translate JSON from sessionstorage to Map
  changesInJSON = sessionStorage.getItem("savedChanges");
  savedChanges = new Map(JSON.parse(changesInJSON));
  // translate
  savedChanges.forEach(function (changes) {
    let type = changes.get("type");
    let id = changes.get("id");
    let table = changes.get("table");
    let changedValues = changes.get("changes");
  });
  errorMessage = "";
  // IF there is error message
  if (errorMessage.length > 0) {
    showAlert(
      `<strong>FATAL Error!</strong> Fail to save to database, please contact administrator --> ${errorMessage}`
    );
    return false;
  }

  sessionStorage.clearItem("savedChanges");
  return true;
}

/**
 * Read XLSX and XLS file to JSON representation format
 * @param {String} filenameInput
 * @returns {Promise<Map> | undefined} Excel Worksheet data in JSON format when resolved, if fail to read or rejects returns undefined
 */
async function readExcelFileToJson(filenameInput) {
  // Read file
  const FILE = $(filenameInput).prop("files");
  const READER = new FileReader();
  return new Promise((resolve, reject) => {
    READER.onloadend = function () {
      console.log("here");
      const FILE_DATA = new Uint8Array(READER.result);
      const WORKBOOK = XLSX.read(FILE_DATA, { type: "array" });

      // Assuming the first sheet of the workbook is the relevant one
      const SHEET_NAME = WORKBOOK.SheetNames[0];
      const SHEET = WORKBOOK.Sheets[SHEET_NAME];
      resolve(XLSX.utils.sheet_to_json(SHEET));
    };
    READER.onerror = function () {
      showAlert(
        `<strong>Error!</strong> File fail to load: ${fileReader.error}`
      );
      reject(undefined);
    };
    READER.readAsArrayBuffer(FILE[0]);
  });
}

class Product {
  constructor(id, sku, make, model, type, num, desc, status, oem) {
    this.Id = id;
    if (String(sku).trim().length > 0) {
      this.Sku = sku;
    } else {
      this.Sku = "<i>Not set</i>";
    }
    this.Make = make;
    this.Model = model;
    this.Type = type;
    this.Num = num;
    this.Desc = desc;
    if (status.trim().length <= 0) {
      this.Status = "Research OEM";
    } else {
      switch (status.toLowerCase().replace(" ", "")) {
        case "research" || "researchoem":
          this.Status = "Research OEM";
          break;
        case "waiting" || "waitingonvendorquote":
          this.Status = "Waiting on Vendor Quote";
          break;
        case "costdone" || "costingcompleted":
          this.Status = "Costing Completed";
          break;
        case "approval" || "waitingapproval":
          this.Status = "Waiting Approval";
          break;
        case "pinnacle" || "addedtopinnacle":
          this.Status = "Added to Pinnacle";
          break;
        case "peach" || "addedtopeach":
          this.Status = "Added to Peach";
          break;
        default:
          this.Status = status;
      }
    }
    if (oem.trim().length <= 0) {
      this.Oem = "Aftermarket OEM";
    } else {
      switch (oem.toLowerCase().replace(" ", "")) {
        case "aftermarket" || "aftermarketoem":
          this.Oem = "Aftermarket OEM";
          break;
        case "genuine" || "genuineoem":
          this.Oem = "Genuine OEM";
          break;
        default:
          this.Oem = oem;
      }
    }
  }
}

class AlternateIndex {
  constructor(
    name,
    number,
    moq,
    costCurrency,
    costAud,
    lastUpdated,
    quality,
    supplierPartType,
    wcpPartType,
    isMain
  ) {
    this.Name = name;
    this.Number = number;
    this.Moq = moq;
    this.CostCurrency = costCurrency;
    this.CostAud = costAud;
    this.LastUpdated = lastUpdated;
    if (quality.trim().length <= 0) {
      this.Oem = "Good";
    } else {
      switch (quality.toLowerCase().replace(" ", " ")) {
        case "good" || "goodquality":
          this.Quality = "Good";
        case "normal" || "normalquality":
          this.Quality = "Normal";
        case "bad" || "badquality":
          this.Quality = "Bad";
        default:
          this.Quality = quality;
      }
    }
    this.SupplierPartType = supplierPartType;
    this.WcpPartType = wcpPartType;
    this.IsMain = isMain ? "MAIN" : "";
  }
}
