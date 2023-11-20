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

//#endregion

//#region API Class

class TimeTracker {
  constructor() {
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = performance.now();
  }

  end() {
    this.endTime = performance.now();
    var timeDiff = this.endTime - this.startTime; //in ms
    // strip the ms
    timeDiff /= 1000;

    // get seconds
    var seconds = Math.round(timeDiff);
    console.log(seconds + " seconds");
  }
}

//#endregion
