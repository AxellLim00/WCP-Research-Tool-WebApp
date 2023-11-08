/**
 * Swithces tab on the layout.html level by loading HTML into #content
 * @param {String} tabIdSelected Tab's ID to switch to
 * @returns {void}
 */
function selectTab(tabIdSelected) {
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
  $(`#${type}Form input[type="text"]`).val("");
  $(`#${type}Form select`).val("");
  $(`#${type}Form input[type="checkbox"]`).prop("checked", false);
}

/**
 * Show loading screen when method is called
 * @param {String} loadingMessage Message to display when loading
 */
function showLoadingScreen(loadingMessage) {
  $("#darkLayer").css("position", "fixed");
  $("#darkLayer").show();
  $(".loading").show();
  $(".loading p").text(loadingMessage);
}

/**
 * Hides loading screen, use this after showLoadingScreen is called
 */
function hideLoadingScreen() {
  $("#darkLayer").hide();
  $("#darkLayer").css("position", "absolute");
  $(".loading").hide();
}

/**
 * Save changes made to Session Storage's "savedChanges" in JSON Format
 * @param {Map[]} change Map Array of changes to be saved
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
 * Save changes made to Server-side
 * Session Storage's "savedChanges" will be cleared
 * @returns {Boolean} true if successful, false otherwise
 */
function saveChanges() {
  // TO DO: translate Map changes to Server-side
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
 * @param {String[] | String[String[]]} columnHeader List of Column Header names or List of Worksheet's List of header (when located in different worksheet)
 * @param {Boolean} worksheetSeperated Defaults to false
 * @param {String[]} worksheetName  Defaults to empty list
 * @returns {Promise<Map> | undefined} Excel Worksheet data in JSON format when resolved, if fail to read or rejects returns undefined
 */
async function readFileToJson(
  filenameInput,
  columnHeader,
  worksheetSeperated = false,
  worksheetName = []
) {
  // TO DO: solve when excel file is not formatted correctly (i.e. it has headers and not centered)
  // https://stackoverflow.com/questions/55805851/while-using-header-option-with-xlsx-utils-json-to-sheet-headers-not-overriding
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
        debugger;
        // Get all header cell location
        let headerCell = [];
        // const SHEET_ARRAY = XLSX.utils.sheet_to_json(SHEET);
        for (let cellAddress in SHEET)
          if (columnHeader.includes(String(SHEET[cellAddress].v))) {
            headerCell.push(cellAddress);
          }
        // sort for index 0 to be the most top left cell
        headerCell.sort();
        if (headerCell.length == 0) {
          resolve([{ no_header_found: true }]);
          return;
        }

        //encode range
        let range = XLSX.utils.decode_range(SHEET["!ref"]);
        range.s = XLSX.utils.decode_cell(headerCell[0]);
        let new_range = XLSX.utils.encode_range(range);
        // Fix with this solution https://github.com/SheetJS/sheetjs/issues/728
        resolve(
          XLSX.utils.sheet_to_json(SHEET, {
            range: new_range,
          })
        );
      } else {
        let jsonData = [];
        let errorMessage = [];

        worksheetName.forEach((sheetName, index) => {
          if (!WORKBOOK.SheetNames.includes(sheetName)) {
            errorMessage.push(`Worksheet "${sheetName}" not found.`);
            return;
          }

          let worksheet = WORKBOOK.Sheets[sheetName];
          let worksheetData = XLSX.utils.sheet_to_json(worksheet, {
            header: columnHeader[index],
          });

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
 * Export all rows in DataTable to Xlsx file ~ more rows make take more time
 * @param {String} tableID HTML Table ID to export
 * @param {String} dataTableOptions DataTable options parameters
 * @param {String} fileName File name to export
 * @param {Boolean} isEmptyData Defaults to False ~ Flag indicating whether table is empty
 * @param {String[]}
 */
function exportDataTable(
  tableID,
  fileName,
  isEmptyData = false,
  worksheetNames = []
) {
  if (isEmptyData) {
    showAlert("<strong>Error!</strong> No data found in table.");
  } else {
    let previousPageLength = $(tableID).DataTable().page.len();
    // redraw table with all row showm
    $(tableID).DataTable().page.len(-1).draw(false);
    let exportData = {
      type: "excel",
      fileName: fileName,
      mso: {
        fileFormat: "xlsx",
      },
      ignoreRow: ["#searchRow"],
    };
    if (worksheetNames.length > 0)
      exportData.mso["worksheetName"] = worksheetNames;
    // Export HTML table not Datatable
    $(tableID).tableExport(exportData);
    $(tableID).DataTable().page.len(previousPageLength).draw(false);
  }
}

/**
 * Get Alternate Index Dictiornary for their ID and Name
 * @param {ProductRequestHistoryDto[]} productDtoArray Array of ProductRequestHistoryDto as source of data
 * @return { Dictionary} Dictionary containing Alt Index Number as Keys and Name as Values
 */
function getAltIndexValueDictionary(productDtoArray) {
  return productDtoArray.reduce((result, product) => {
    if (product.altIndexNumber !== null && product.vendorName !== null) {
      result[product.altIndexNumber] = product.vendorName;
    }
    return result;
  }, {});
}

/**
 * Get Unique list of all researchIdentifier and productStockNumber
 * @param {ProductRequestHistoryDto[]} productDtoArray Array of ProductRequestHistoryDto as source of data
 * @returns {String[]} Unique list of all researchIdentifier and productStockNumber
 */
function getProductIdentifier(productDtoArray) {
  let researchIdentifiers = [
    ...productDtoArray.map((product) => product.researchIdentifier),
  ];
  let productStockNumbers = [
    ...productDtoArray.map((product) => product.productStockNumber),
  ];

  return [...new Set([...researchIdentifiers, ...productStockNumbers])].filter(
    (str) => str != null && str.trim() !== ""
  );
}

/**
 * Refresh tab when product is updated
 * @param {String} newId Product ID on search bar
 * @param {String[]} idList Complete list of all products to compare against
 * @param {String} currentId Current product ID selected
 * @param {String} tabId Current tab ID selected
 * @param {Boolean} showError Show Alert error message when true
 */
function productSelectedChanged(
  newId,
  idList,
  currentId,
  tabId,
  showError = false
) {
  var hasChanges = sessionStorage.getItem("hasChanges") == "true";
  $("#productSelected").attr("oldvalue", currentId);
  if (!idList.includes(newId) || newId == currentId) {
    if (!showError) return;
    showAlert(`Error: Product ID ${newId} not found`);
    $("#productSelected").val($("#productSelected").attr("oldvalue"));
    // $("#productSelected").attr("oldvalue", "");
    return;
  }
  if (hasChanges) {
    $("#searchConfirmation.confirmation").show();
    $("#darkLayer").show();
    $("#darkLayer").css("position", "fixed");
    return;
  }
  sessionStorage.setItem("productIDSelected", newId);
  selectTab(tabId);
  // $("#productSelected").attr("oldvalue", "");
}

//#region variable tool methods

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
  return (str ?? "").replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

//#endregion

//#region Table Class

class Product {
  /**
   *
   * @param {String} id Research ID
   * @param {String} sku SKU
   * @param {String} make Product's Make
   * @param {String} model Product's Model
   * @param {String} type Product's Part type
   * @param {String} num IC Number
   * @param {String} desc IC Description
   * @param {String} status Product Research Status
   * @param {String} oem OEM Type
   * @param {String[]} suppList Supplier Number List
   * @param {String[]} oemList OEM Number List
   */
  constructor(
    id,
    sku,
    make,
    model,
    type,
    num,
    desc,
    status,
    oem,
    suppList,
    oemList
  ) {
    this.Id = id;
    this.Sku = sku;
    this.Make = make;
    this.Model = model;
    this.Type = type;
    this.Num = num;
    this.Desc = desc;
    status = String(status);
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
      case "catalogue":
      case "inpinnaclecatalogue":
        this.Status = "catalogue";
        break;
      default:
        this.Status = null;
    }
    oem = String(oem);
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

    this.SuppList = suppList ?? [];
    this.OemList = oemList ?? [];
  }
}

class AlternateIndex {
  /**
   *
   * @param {String} name
   * @param {String} number
   * @param {String} moq
   * @param {String} costCurrency
   * @param {Number} costAud
   * @param {Date} lastUpdated
   * @param {String} quality
   * @param {String} supplierPartType
   * @param {String} wcpPartType
   * @param {Boolean} isMain
   */
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
    this.Number = String(number);
    this.Moq = moq ?? "";
    this.CostCurrency = costCurrency ?? "";
    this.CostAud =
      typeof costAud == String ? parseFloat(costAud) : costAud ?? "";
    this.LastUpdated = lastUpdated ?? "";
    quality = String(quality);
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
    this.SupplierPartType = supplierPartType ?? "";
    this.WcpPartType = wcpPartType ?? "";
    this.IsMain = isMain ?? false;
  }
}

class CostVolume {
  /**
   *
   * @param {String} id
   * @param {Number} costUsd
   * @param {Number} costAud
   * @param {Number} estCostAud
   * @param {Number} estSell
   * @param {Number} postage
   * @param {Number} extGP
   */
  constructor(id, costUsd, costAud, estCostAud, estSell, postage, extGP) {
    this.Id = id ?? "-";
    this.CostUSD = costUsd ?? 0;
    this.CostAUD = costAud ?? 0;
    this.EstimateCostAUD = estCostAud ?? 0;
    this.EstimateSell = estSell ?? 0;
    this.Postage = postage ?? 0;
    this.ExtGP = extGP ?? 0;
  }
}

//#endregion

//#region API Class

class FreeCurrencyAPI {
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

class WorkFlowAPI {
  baseUrl = "https://workflow.wholesalecarparts.com.au/api";

  async authenticate(applicationName, applicationSecret) {
    const requestBody = {
      ApplicationName: applicationName,
      ApplicationSecret: applicationSecret,
    };

    return await axios
      .post(`${this.baseUrl}/auth/authenticate`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then(function (response) {
        // When successful login, save JWT Token
        sessionStorage.setItem("token", response.data.token);
        return response;
      })
      .catch(function (error) {
        console.error("Auth error", error);
        return {
          status: "error",
          error: error,
        };
      });
  }

  /**
   * Get Search Product Request History from Workflow API
   * @param {Number} pageNo Defaults to 1 ~ Page number for search page request history
   * @param {Number} pageSize Defaults to 5000 ~ Number of Product for each page
   * @param {String} partTypeCode (optional) Type of part requested to filter products
   * @param {String} interchangeNumber (optional) interchangeNumber to filter products
   * @param {String} interchangeVersion (optional) interchangeVersion to filter products
   * @param {Boolean} isGetAll Flag to get all product requests
   * @returns List of ProductRequestHistoryDto
   */
  async searchProductRequestHistory(
    pageNo = 1,
    pageSize = 5000,
    partTypeCode = null,
    interchangeNumber = null,
    interchangeVersion = null,
    isGetAll = true
  ) {
    const requestBody = {
      InterchangeNumber: interchangeNumber,
      InterchangeVersion: interchangeVersion,
      PartTypeCode: partTypeCode,
      PageNo: pageNo,
      PageSize: pageSize,
    };
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          let response = await axios.post(
            `${this.baseUrl}/request-history/search`,
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          let jsonArray = response.data.records;
          // Get all products
          if (
            isGetAll &&
            response.data.currentPage === 1 &&
            response.data.pageSize < response.data.recordCount
          ) {
            let loopsToGetTotal = Math.ceil(
              response.data.recordCount / response.data.pageSize
            );
            // skip first iteration
            for (let i = 1; i < loopsToGetTotal; i++) {
              await new Promise((resolve) => setTimeout(resolve, 25000)); // Simulate a 1-second delay
              let toAdd = searchProductRequestHistory(
                interchangeNumber,
                interchangeVersion,
                partTypeCode,
                pageNo,
                pageSize
              );
              jsonArray.push(...toAdd);
            }
          }
          // return list of
          resolve(jsonArray);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.log(
              "Token has expired or invalidated. Bring user back to login page."
            );
            location.href = "../html/login.html";
          }
          console.error(
            "Error searching product request history:",
            error.message
          );
          showAlert("Error searching product request history:", error);
          reject(error);
        }
      }, 25000); // Simulate a 25-second delay
    });
  }
}

class ProductRequestHistoryDto {
  /**
   *
   * @param {Number} pinnacleItemTypeId
   * @param {String} partTypeCode
   * @param {String} partTypeFriendlyName
   * @param {String} interchangeNumber
   * @param {String} interchangeVersion
   * @param {Number} totalNumberOfRequests
   * @param {Number} totalNumberOfNotFoundRequests
   * @param {Number} totalNumberOfUnitsSold
   * @param {String} vehicleManufacturers
   * @param {String} vehicleModels
   * @param {String} vehicleIdentificationNumbers
   * @param {String} interchangeDescriptions
   * @param {String} productStockNumber
   * @param {String} altIndexNumber
   * @param {String} vendorName
   * @param {Number} averageConditionPrice
   * @param {Number} costPrice
   */
  constructor(
    pinnacleItemTypeId,
    partTypeCode,
    partTypeFriendlyName,
    interchangeNumber,
    interchangeVersion,
    totalNumberOfRequests,
    totalNumberOfNotFoundRequests,
    totalNumberOfUnitsSold,
    vehicleManufacturers,
    vehicleModels,
    vehicleIdentificationNumbers,
    interchangeDescriptions,
    productStockNumber,
    altIndexNumber,
    vendorName,
    averageConditionPrice,
    costPrice
  ) {
    this.pinnacleItemTypeId = pinnacleItemTypeId;
    this.partTypeCode = partTypeCode;
    this.partTypeFriendlyName = partTypeFriendlyName;
    this.interchangeNumber = interchangeNumber;
    this.interchangeVersion = interchangeVersion;
    this.totalNumberOfRequests = totalNumberOfRequests;
    this.totalNumberOfNotFoundRequests = totalNumberOfNotFoundRequests;
    this.totalNumberOfUnitsSold = totalNumberOfUnitsSold;
    this.vehicleManufacturers = vehicleManufacturers;
    this.vehicleModels = vehicleModels;
    this.vehicleIdentificationNumbers = vehicleIdentificationNumbers;
    this.interchangeDescriptions = interchangeDescriptions;
    this.productStockNumber = productStockNumber;
    this.altIndexNumber = altIndexNumber;
    this.vendorName = vendorName;
    this.averageConditionPrice = averageConditionPrice;
    this.costPrice = costPrice;
    this.researchIdentifier = "";
  }
}

//#endregion
