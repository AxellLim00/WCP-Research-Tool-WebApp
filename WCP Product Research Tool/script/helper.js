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
  sessionStorage.removeItem("savedChanges");
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
  } else {
    $("#AlertMessage").html(message);
  }
}

/**
 * Set Session Storage's "hasChanges" to hasChange parameter
 * @param {Boolean} hasChange Tab's ID to switch
 * @returns {}
 */
function updateHasChanges(hasChange) {
  // change hasChanges value in session storage
  sessionStorage.setItem("hasChanges", hasChange);
  if (hasChange) {
    $("button[name=saveBtn]").prop("disabled", false);
    // Change save button back to normal when false
  } else {
    $("button[name=saveBtn]").prop("disabled", true);
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
 * Save changes made to Session Storage's "savedChanges" in JSON Format
 * @param {Map[]} change Map of changes to be saved
 * @returns
 */
function updateChanges(change) {
  storedChanges = sessionStorage.getItem("savedChanges");
  // If savedChanges is empty
  if (!storedChanges) {
    sessionStorage.setItem(
      "savedChanges",
      JSON.stringify(change.map((map) => Array.from(map.entries())))
    );
    return;
  }
  storedChanges = JSON.parse(storedChanges).map((array) => new Map(array));
  storedChanges.push(...change);
  sessionStorage.setItem(
    "savedChanges",
    JSON.stringify(storedChanges.map((map) => Array.from(map.entries())))
  );
}

/**
 * Save changes made to SQL
 * Session Storage's "savedChanges" will be cleared
 * @returns {Boolean} true if successful, false otherwise
 */
function saveChangesToSQL() {
  // TO DO: translate Map changes to SQL
  let storedChanges = sessionStorage.getItem("savedChanges");
  let savedChanges = JSON.parse(storedChanges).map((array) => new Map(array));
  // If savedChanges is empty or Array is empty
  if (!storedChanges || savedChanges.size == 0) {
    showAlert(
      "<strong>FATAL Error!</strong> No changes was found, please contact administrator"
    );
    return false;
  }
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

  sessionStorage.removeItem("savedChanges");
  return true;
}

/**
 * Read XLSX and XLS file to JSON representation format/
 * @param {String} filenameInput HTML file input Id
 * @param {Boolean} worksheetSeperated
 * @param {String[]} worksheetName
 * @returns {Promise<Map> | undefined} Excel Worksheet data in JSON format when resolved, if fail to read or rejects returns undefined
 */
async function readFileToJson(
  filenameInput,
  worksheetSeperated = false,
  worksheetName = [],
  header = []
) {
  // Read file
  const FILE = $(filenameInput).prop("files");
  const READER = new FileReader();
  return new Promise((resolve, reject) => {
    READER.onloadend = function () {
      const FILE_DATA = new Uint8Array(READER.result);
      const WORKBOOK = XLSX.read(FILE_DATA, { type: "array" });
      // Assuming the first sheet of the workbook is the relevant one
      if (!worksheetSeperated) {
        const SHEET_NAME = WORKBOOK.SheetNames[0];
        const SHEET = WORKBOOK.Sheets[SHEET_NAME];
        resolve(XLSX.utils.sheet_to_json(SHEET));
      } else {
        let jsonData = [];
        let errorMessage = [];
        worksheetName.forEach((sheetName, index) => {
          if (!WORKBOOK.SheetNames.includes(sheetName)) {
            errorMessage.push(`Worksheet "${sheetName}" not found.`);
            return;
          }
          let worksheet = WORKBOOK.Sheets[sheetName];
          let worksheetData = XLSX.utils.sheet_to_json(worksheet);
          jsonData[sheetName] = worksheetData;
        });
        // If there is one or more error messages
        if (errorMessage.length) {
          showAlert(`<strong>ERROR!</strong> ${errorMessage.join(".\n")}`);
          resolve(undefined);
          return;
        }
        // Combine all worksheet data into one JSON object
        // Initialize an empty array to store the combined rows
        combinedData = [];

        // Iterate through the properties of the object, and find max row in object's property
        let properties = Object.keys(jsonData);
        let maxRows = Math.max(
          ...properties.map((prop) => jsonData[prop].length)
        );
        // Combine all properties into one JSON object
        for (let i = 0; i < maxRows; i++) {
          let combinedRow = {};

          for (const prop of properties) {
            let propArray = jsonData[prop];
            // Use an empty object if the property array is shorter
            let propObj = propArray[i] || {};
            combinedRow[prop] = propObj[prop];
          }

          combinedData.push(combinedRow);
        }
        // Clean up combinedData
        combinedData.forEach((obj) => {
          // Delete properties that are undefined
          Object.keys(obj).forEach(
            (key) => obj[key] === undefined && delete obj[key]
          );
        });
        resolve(combinedData);
      }
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

/**
 * Convert local currency to AUD currency
 * @param {String} costCurrency currency name
 * @param {Number} amount Amount in local currency
 * @returns {number} Amount converted to AUD
 */
function calculateAUD(costCurrency, amount) {
  let rates = JSON.parse(localStorage.getItem("currencyRate"))["data"];
  if (!rates.hasOwnProperty(costCurrency))
    // when currency not Found
    return `<i>Cost Currency ${costCurrency}</i> not found and cannot be converted.\n`;

  return parseFloat(((amount * 1) / rates[costCurrency]).toFixed(2));
}

/**
 * To check if string value(s) is a valid float.
 * @param {String} args string values to be validated
 * @returns {Boolean} True if the string is only a float, false otherwise
 */
function isFloat() {
  let isAllFloat = true;
  let args = Array.prototype.slice.call(arguments);
  args.forEach((str) => {
    isAllFloat &&= /^\s*[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\s*$/.test(str);
  });
  return isAllFloat;
}

/**
 * Check if value in row is float and adds error to the error list
 * @param {Dictionary} row each dictionary object from json
 * @param {String} key name of the key to check
 * @param {String[]} errorMessageList erroe message list to add if there is error
 */
function checkAndPushFloatError(row, key, errorMessageList) {
  if (!isFloat(row[key])) {
    errorMessageList.push(
      `Header ${key} - value ${row[key]} has a wrong format`
    );
  }
}

/**
 * Update object's values with the given updates's key value pair
 * @param {Object} object object to be updated
 * @param {Object} updates key value pair to update with
 * @returns {Object} new object with updated values
 */
function updateObject(object, updates) {
  Object.entries(updates).forEach(([key, value]) => {
    object[key] = value;
  });
  return object;
}

/**
 * For a given date, get the ISO week number
 * @returns the ISO week number
 */
Date.prototype.getWeekNumber = function () {
  var d = new Date(
    Date.UTC(this.getFullYear(), this.getMonth(), this.getDate())
  );
  d.setMilliseconds(0);
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};
/**
 *
 * @param {str} str string to capitalize in title format
 * @returns
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
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
    if (status)
      switch (status.toLowerCase().replace(/[_.-\s]/g, "")) {
        case "research":
        case "researchoem":
        case "":
          this.Status = "research";
          break;
        case "waiting":
        case "waitingonvendor":
        case "waitingonvendorquote":
          this.Status = "waiting";
          break;
        case "costdone":
        case "costingcompleted":
          this.Status = "costDone";
          break;
        case "approval":
        case "waitingapproval":
          this.Status = "approval";
          break;
        case "pinnacle":
        case "addedtopinnacle":
          this.Status = "pinnacle";
          break;
        case "peach":
        case "addedtopeach":
          this.Status = "peach";
          break;
        default:
          this.Status = null;
      }
    else this.Status = null;
    if (oem)
      switch (oem.toLowerCase().replace(/[_.-\s]/g, "")) {
        case "aftermarket":
        case "aftermarketoem":
        case "":
          this.Oem = "aftermarket";
          break;
        case "genuine":
        case "genuineoem":
          this.Oem = "genuine";
          break;
        default:
          this.Oem = null;
      }
    else this.Oem = null;
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
    if (quality)
      switch (quality.toLowerCase().replace(" ", "")) {
        case "good":
        case "goodquality":
        case "g":
          this.Quality = "good";
          break;
        case "normal":
        case "normalquality":
        case "n":
        case "":
          this.Quality = "normal";
          break;
        case "bad":
        case "badquality":
        case "b":
          this.Quality = "bad";
          break;
        default:
          this.Quality = null;
      }
    else this.Quality = null;
    this.SupplierPartType = supplierPartType;
    this.WcpPartType = wcpPartType;
    this.IsMain = isMain ? "MAIN" : "";
  }
}

class Freecurrencyapi {
  baseUrl = "https://api.freecurrencyapi.com/v1/";

  // temporary API_KEY using Axell's account from https://freecurrencyapi.com
  constructor(apiKey = "fca_live_9rGbrfYBHZF87MKp6NT4CdrsTChb2rPy2bdD9lfw") {
    this.headers = {
      apikey: apiKey,
    };
  }

  call(endpoint, params = {}) {
    const paramString = new URLSearchParams({
      ...params,
    }).toString();

    return fetch(`${this.baseUrl}${endpoint}?${paramString}`, {
      headers: this.headers,
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  }

  status() {
    return this.call("status");
  }

  currencies(params) {
    return this.call("currencies", params);
  }

  latest(params) {
    return this.call("latest", params);
  }

  historical(params) {
    return this.call("historical", params);
  }
}

class CostVolume {
  constructor(id, costUsd, costAud, estCostAud, estSell, postage, extGP) {
    this.Id = id;
    this.CostUSD = costUsd;
    this.CostAUD = costAud;
    this.EstimateCostAUD = estCostAud ?? 0;
    this.EstimateSell = estSell ?? 0;
    this.Postage = postage ?? 0;
    this.ExtGP = extGP ?? 0;
  }
}
