import { showAlert, selectTab } from "./html-utils.js";
import { ProductRequestHistoryDto } from "./class/apiDto.js";
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
  $("#productSelected").attr("oldValue", currentId);
  if (!idList.includes(newId) || newId == currentId) {
    if (!showError) return;
    showAlert(`Error: Product ID ${newId} not found`);
    $("#productSelected").val($("#productSelected").attr("oldValue"));
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
 * Update "currencyRate" in Session Storage to have currency rates to AUD
 * and get conversion rates from API
 * @param {SocketIO.Socket} socket SocketIO socket
 * @returns {Map} of currencies to its currency rates
 */
export async function getCurrencyRates(socket) {
  try {
    const currencyRate = JSON.parse(localStorage.getItem("currencyRate"));
    const lastUpdate = new Date(currencyRate?.last_updated_at);
    const Rates = new Date(currencyRate?.data);
    const currentDate = new Date();
    // If currencyRate is not null and last updated is within 7 days
    if (
      currencyRate &&
      Rates &&
      lastUpdate &&
      lastUpdate.getTime() > currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
    ) {
      return currencyRate;
    }

    const response = await new Promise((resolve) => {
      console.log("Getting Currencies from system");
      socket.emit("get all currency", resolve);
    });

    const updatedCurrencyRate = {
      data: response.data,
      last_updated_at: currentDate.toString(),
    };
    // Save to local storage
    localStorage.setItem("currencyRate", JSON.stringify(updatedCurrencyRate));

    return updatedCurrencyRate;
  } catch (error) {
    console.error("Error retrieving currency rates:", error);
    throw error;
  }
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
  // Change hasChanges value in session storage
  sessionStorage.setItem("hasChanges", hasChange);

  // Enable or disable the save button based on hasChange value
  $("button[name=saveBtn]").prop("disabled", !hasChange);
}

/**
 * Save changes made to Session Storage's "savedChanges" in JSON Format
 * @param {Map[]} change Map Array of changes to be saved
 */
export function updateChanges(change) {
  let storedChanges = sessionStorage.getItem("savedChanges") || "[]";
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
 * @returns {Promise<boolean>} true if successful, false otherwise
 */
export async function saveChanges(socket) {
  const storedChanges = sessionStorage.getItem("savedChanges");
  const savedChanges = JSON.parse(storedChanges).map((array) => new Map(array));

  if (!storedChanges || savedChanges.size === 0) {
    showAlert(
      "<strong>FATAL Error!</strong> No changes were found, please contact the administrator"
    );
    return false;
  }

  try {
    const result = await updateDataOnDatabase(socket, savedChanges);
    sessionStorage.removeItem("savedChanges");
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Call emit function to update the database
 * @param {Socket<DefaultEventsMap, DefaultEventsMap>} socket
 * @param {Map[]} changes array of changes to update
 * @returns {Promise<boolean>} true if all works well, false when there is an error
 */
export async function updateDataOnDatabase(socket, changes) {
  const serializedChanges = changes.map((map) =>
    JSON.stringify(Array.from(map.entries()))
  );

  return new Promise((resolve, reject) => {
    socket.emit("update database", serializedChanges, (ackData) => {
      if (ackData.status === "ERROR") {
        showAlert(
          `<strong>FATAL Error!</strong> Failed to save to the database, please contact the administrator:<br>${ackData.errors
            .map((err) => `${err.name}: ${err.message}`)
            .join("<br>")}`
        );
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Update product request history with new products
 * @param {Object[]} newProductArray - Array of New Product from Database
 * @param {Object[]} productArray - Array of Product from Database
 */
export function updateProductRequestHistory(newProductArray, productArray) {
  let productRequestHistoryArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );

  newProductArray.forEach((product) => {
    if (
      !productRequestHistoryArray.find(
        (p) => p.researchIdentifier === product.ResearchID
      )
    ) {
      let productDetailMatch = productArray.find(
        (p) => p.ResearchID === product.ResearchID
      );
      let newProduct = new ProductRequestHistoryDto(
        null,
        product.PartTypeCode,
        product.PartType,
        product.IcNumber,
        "",
        product.Request,
        product.RequestNF,
        product.UnitSold,
        product.Make,
        product.Model,
        "",
        product.IcDescription,
        productDetailMatch ? productDetailMatch.SKU : "",
        "",
        "",
        product.AveragePrice,
        0
      );
      newProduct.researchIdentifier = product.ResearchID;
      productRequestHistoryArray.push({ ...newProduct });
    }
  });

  sessionStorage.setItem(
    "productRequestHistory",
    JSON.stringify(productRequestHistoryArray)
  );
}

export function addNewProductRequestHistory(newProduct) {
  let productRequestHistoryArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );

  let productToAdd = new ProductRequestHistoryDto(
    "",
    newProduct.TypeCode,
    newProduct.Type,
    newProduct.Num,
    "",
    0,
    0,
    0,
    newProduct.Make,
    newProduct.Model,
    "",
    newProduct.Desc,
    newProduct.Sku,
    "",
    "",
    0,
    0
  );
  productToAdd.researchIdentifier = newProduct.ResearchID;
  productRequestHistoryArray.push({ ...productToAdd });

  sessionStorage.setItem(
    "productRequestHistory",
    JSON.stringify(productRequestHistoryArray)
  );
}
