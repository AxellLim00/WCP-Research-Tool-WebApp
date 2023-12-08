import { showAlert, selectTab } from "./html-utils.js";
import $ from "jquery";

/**
 * Refresh tab when product is updated
 * @param {String} newId Product ID on search bar
 * @param {String[]} idList Complete list of all products to compare against
 * @param {String} currentId Current product ID selected
 * @param {String} tabId Current tab ID selected
 * @param {Boolean} showError Show Alert error message when true
 */
export function productSelectedChanged(
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
}

/**
 * Convert local currency to AUD currency
 * @param {String} costCurrency currency name
 * @param {Number} amount Amount in local currency
 * @returns {number} Amount converted to AUD
 */
export function calculateAUD(costCurrency, amount) {
  const rates = JSON.parse(localStorage.getItem("currencyRate"))["data"];
  if (!rates.hasOwnProperty(costCurrency))
    // when currency not Found
    return `<i>Cost Currency ${costCurrency}</i> not found and cannot be converted.\n`;

  return parseFloat(((amount * 1) / rates[costCurrency]).toFixed(2));
}

/**
 * Check if value in row is float and adds error to the error list
 * @param {Dictionary} row each dictionary object from json
 * @param {String} key name of the key to check
 * @param {String[]} errorMessageList error message list to add if there is error
 */
export function isFloatValue(row, key, errorMessageList) {
  if (!isFloat(row[key])) {
    errorMessageList.push(
      `Header ${key} - value ${row[key]} has a wrong format`
    );
  }
}

/**
 * To check if string value(s) is a valid float.
 * @param {String} args string values to be validated
 * @returns {Boolean} True if the string is only a float, false otherwise
 */
export function isFloat() {
  let isAllFloat = true;
  const args = Array.prototype.slice.call(arguments);
  args.forEach((str) => {
    isAllFloat &&= /^\s*[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\s*$/.test(str);
  });
  return isAllFloat;
}

/**
 * For a given date, get the ISO week number
 * @param {Date} date Date object to get the week number from
 * @returns the ISO week number
 */
export function getWeekNumber(date) {
  date.setMilliseconds(0);
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

/**
 *
 * @param {str} str string to capitalize in title format
 * @returns
 */
export function toTitleCase(str) {
  return (str ?? "").replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Get Unique list of all researchIdentifier and productStockNumber
 * @param {ProductRequestHistoryDto[]} productDtoArray Array of ProductRequestHistoryDto as source of data
 * @returns {String[]} Unique list of all researchIdentifier and productStockNumber
 */
export function getProductIdentifier(productDtoArray) {
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
 * Get Alternate Index Dictiornary for their ID and Name
 * @param {ProductRequestHistoryDto[]} productDtoArray Array of ProductRequestHistoryDto as source of data
 * @return { Dictionary} Dictionary containing Alt Index Number as Keys and Name as Values
 */
export function getAltIndexValueDictionary(productDtoArray) {
  return productDtoArray.reduce((result, product) => {
    if (product.altIndexNumber !== null && product.vendorName !== null) {
      result[product.altIndexNumber] = product.vendorName;
    }
    return result;
  }, {});
}

/**
 * Update object's values with the given updates's key value pair
 * @param {Object} object object to be updated
 * @param {Object} updates key value pair to update with
 * @returns {Object} new object with updated values
 */
export function updateObject(object, updates) {
  Object.entries(updates).forEach(([key, value]) => {
    object[key] = value;
  });
  return object;
}

/**
 * Set Session Storage's "hasChanges" to hasChange parameter
 * @param {Boolean} hasChange Tab's ID to switch
 * @returns {}
 */
export function updateHasChanges(hasChange) {
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
 * Save changes made to Session Storage's "savedChanges" in JSON Format
 * @param {Map[]} change Map Array of changes to be saved
 * @returns
 */
export function updateChanges(change) {
  let storedChanges = sessionStorage.getItem("savedChanges");
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
 * @param {Socket<DefaultEventsMap, DefaultEventsMap>} socket
 * @returns {Boolean} true if successful, false otherwise
 */
export async function saveChanges(socket) {
  // TO DO: translate Map changes in Server-side
  const storedChanges = sessionStorage.getItem("savedChanges");
  const savedChanges = JSON.parse(storedChanges).map((array) => new Map(array));
  // If savedChanges is empty or Array is empty
  if (!storedChanges || savedChanges.size == 0) {
    showAlert(
      "<strong>FATAL Error!</strong> No changes was found, please contact administrator"
    );
    return false;
  }

  const result = await updateDataOnDatabase(socket, savedChanges).catch(
    (error) => console.error(error)
  );
  // IF there is error message
  if (!result) return false;
  sessionStorage.removeItem("savedChanges");
  return true;
}

/**
 * Call emit function to update database
 * @param {*} changes array of changes to update
 * @returns {Promise<boolean>} True if all works well, False when there is an error
 */
async function updateDataOnDatabase(socket, changes) {
  changes = changes.map((Map) => JSON.stringify(Array.from(Map.entries())));
  return new Promise((resolve, reject) => {
    socket.emit("update database", changes, (ackData) => {
      if (ackData.status === "ERROR") {
        showAlert(
          `<strong>FATAL Error!</strong> Fail to save to database, please contact administrator --><br>${ackData.errors
            .map((err) => `${err.name}: ${err.message}`)
            .join("<br>")}`
        );
        reject(false);
      } else resolve(true);
    });
  });
}
