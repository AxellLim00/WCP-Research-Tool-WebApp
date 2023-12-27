/**
 * This file contains the code for the alternate index functionality in the web application.
 * It imports various modules and defines functions for handling events and manipulating data.
 * The code initializes the table, sets up search bar logic, and handles button clicks.
 * It also includes form validation and data retrieval from the server.
 */
import DataTable from "datatables.net-dt";
import "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";
import "datatables.net-datetime";
import "multiple-select";
import "../../node_modules/multiple-select/dist/multiple-select.min.css";
// import socket from "../utils/socket-utils.js";

import { AlternateIndexDto } from "../utils/class/dataTableDto.js";
import {
  productSelectedChanged,
  calculateAUD,
  isFloat,
  toTitleCase,
  getProductIdentifier,
  updateObject,
  updateHasChanges,
  updateChanges,
  saveChanges,
  getCurrencyRates,
  getProductFromID,
  getProductIDAlias,
} from "../utils/tab-utils.js";
import {
  createEmptyRow,
  findMissingColumnHeader,
  exportDataTable,
  readFileToJson,
} from "../utils/table-utils.js";
import {
  showAlert,
  showPopUpForm,
  hidePopUpForm,
  exitPopUpForm,
  showLoadingScreen,
  hideLoadingScreen,
} from "../utils/html-utils.js";
import {
  fetchSupplierFromDatabase,
  fetchAltIndexFromDatabase,
} from "../utils/fetchSQL-utils.js";

$(async function () {
  const socket = window.socket;
  const columnDefaultAmount = 11;
  const rowDefaultAmount = 10;
  const tableName = "#altIndexTable";
  const $dateFromFilter = $('input[type="date"][name="from"]');
  const $dateToFilter = $('input[type="date"][name="to"]');
  const productRequestArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );
  const supplierArray = [];
  const altIndexObjectArray = [];
  const currencySupplierMap = new Map();
  const productIdArray = getProductIdentifier(productRequestArray);
  const productIdSelected = sessionStorage.getItem("productIDSelected");

  let isTableEmpty = true;
  let formSelected;
  let altIndexSelected = new AlternateIndexDto();
  let mainSupplier = null;
  let rowIndexSelected = -1;
  // temporary variable to store previous values
  let prevMainSupplier = null;
  let productIdAlias;
  let currencyRates;

  //#region Initialization

  showLoadingScreen("Loading Alternate Index Table...");

  // Fill in Currency Rates from API if not already filled and get currency rates
  try {
    currencyRates = await fillCurrencyRates();
  } catch (error) {
    console.log(error);
    return;
  }

  // Fill in ID search box
  $.each(productIdArray, function (_, item) {
    $("#productList").append($("<option>").attr("value", item).text(item));
  });

  if (productIdSelected) {
    let productData = getProductFromID(productIdSelected, productRequestArray);
    productIdAlias = getProductIDAlias(productIdSelected, productData);

    try {
      await fillSupplierTextBoxDataList(supplierArray, currencySupplierMap);
    } catch {
      // Error handled in fetchSupplierFromDatabase
      return;
    }

    //#region Load table

    // Load table from Database - Server side
    try {
      const altIndexFromDatabase = await fetchAltIndexFromDatabase(
        socket,
        productIdSelected
      );
      altIndexObjectArray.push(
        ...altIndexFromDatabase.map((x) => {
          return new AlternateIndexDto(
            x.AltIndexNumber,
            x.SupplierName,
            x.SupplierNumber,
            x.MOQ,
            x.CostCurrency,
            x.CostAud,
            new Date(x.LastUpdate),
            x.Quality,
            x.SupplierPartType,
            x.WCPPartType,
            x.IsMain
          );
        })
      );
    } catch {
      // Error handled in fetchAltIndexFromDatabase
      return;
    }

    // Load table from API
    let selectedProductData = [];
    if (productIdSelected.slice(0, 2) == "R-") {
      // Filter existing ones with interchangeNumber, interchangeNumber and partTypeFriendlyName/partTypeCode
      selectedProductData = productRequestArray.filter(
        (x) => x.researchIdentifier == productIdSelected && x.vendorId
      );
    } else {
      selectedProductData = productRequestArray.filter(
        (x) => x.productStockNumber == productIdSelected && x.vendorId
      );
    }

    selectedProductData.forEach((product) => {
      // Check if product is already in altIndexObjectArray, if so, skip
      if (altIndexObjectArray.find((x) => x.Number == product.vendorId)) return;
      // Add product to altIndexObjectArray
      altIndexObjectArray.push(
        new AlternateIndexDto(
          String(product.altIndexNumber),
          String(product.vendorName),
          String(product.vendorId)
        )
      );
    });

    //#endregion
  }

  // Check if alternative index list is empty
  isTableEmpty = altIndexObjectArray.length === 0;

  // Scenario of when data loaded is empty
  if (isTableEmpty) {
    $(tableName).append(createEmptyRow(rowDefaultAmount, columnDefaultAmount));
  }

  // Disable/Enable date picker
  $dateFromFilter.attr("disabled", isTableEmpty);
  $dateToFilter.attr("disabled", isTableEmpty);

  const tableOptions = {
    orderCellsTop: true,
    columns: [
      { data: "Index" },
      { data: "Name" },
      { data: "Number" },
      { data: "Moq" },
      {
        data: "CostCurrency",
        render: function (data, _, row) {
          const currency = currencySupplierMap[row.Number] ?? "AUD";
          if (!row.Index) return "";
          if (data === null) return currency;
          return `${currency} ${data}`;
        },
      },
      {
        data: "CostAud",
        render: function (data, _, row) {
          if (data === -1) {
            const currency = currencySupplierMap[row.Number] ?? "AUD";
            const costCurrency = row.CostCurrency;
            const costAud = calculateAUD(currency, costCurrency);
            if (typeof costAud === "string" || costAud instanceof String) {
              showAlert(costAud);
              return "N/A";
            }
            return costAud;
          } else {
            return data;
          }
        },
      },
      {
        data: "LastUpdated",
        render: DataTable.render.datetime("D MMM YYYY"),
      },
      {
        data: "Quality",
        render: function (data) {
          return toTitleCase(data);
        },
        orderable: true,
      },
      { data: "SupplierPartType" },
      { data: "WcpPartType" },
      {
        data: "IsMain",
        render: function (data) {
          return data ? "MAIN" : "";
        },
      },
    ],
    stateSave: true,
    paging: true,
  };

  let table = new DataTable(tableName, tableOptions);

  $(`${tableName}_filter`).remove();
  $(".dataTables_length").css("padding-bottom", "1%");

  table.rows.add(altIndexObjectArray).draw(false);
  table.columns().search("").draw(false);

  $("#productSelected").val(productIdSelected);

  hideLoadingScreen();

  //#endregion

  //#region Searchbar Logic

  $('input.filter[type="text"]').on("input", function () {
    table.column($(this).data("column")).search($(this).val()).draw();
  });

  // multi select can also be possible to replace some search bars
  $(".multiple-select").multipleSelect({
    onClick: function () {
      let values = $(this)
        .multipleSelect("getData")[0]
        ["data"].filter((json) => json.selected)
        .map((json) => json.text);
      let filterRegex = values
        .map(function (value) {
          return "^" + value + "$";
        })
        .join("|");
      //filter with an regex, no smart filtering, not case sensitive
      table
        .column($(this).attr("column"))
        .search(filterRegex, true, false, false)
        .draw(false);
    },
    onUncheckAll: function () {
      table.column($(this).attr("column")).search("").draw(false);
    },
    onCheckAll: function () {
      table.column($(this).attr("column")).search("").draw(false);
    },
  });

  let dateToVal;
  let dateFromVal;
  $dateFromFilter.on("input", function () {
    dateFromVal = new Date($dateFromFilter.val());
    dateFromVal.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
    dateToVal = new Date($dateToFilter.val());
    dateToVal.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
    table.draw();
  });

  $dateToFilter.on("input", function () {
    dateFromVal = new Date($dateFromFilter.val());
    dateFromVal.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
    dateToVal = new Date($dateToFilter.val());
    dateToVal.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
    table.draw();
  });

  // Custom range date filtering function
  // Add a custom search function to the array
  $.fn.dataTable.ext.search.push(function (_settings, data, _dataIndex) {
    let rowDate = new Date(data[$dateFromFilter.data("column")]);

    if (
      (isNaN(dateFromVal) || rowDate.getTime() >= dateFromVal.getTime()) &&
      (isNaN(dateToVal) || rowDate.getTime() <= dateToVal.getTime())
    ) {
      return true;
    }
    return false;
  });

  $dateFromFilter.trigger("input"); // Trigger input event to initialize the date variables

  //#endregion

  //#region textbox event

  // Search Product ID events
  $("#productSelected").on("keydown", function (event) {
    if (event.key === "Enter")
      productSelectedChanged(
        $(this).val(),
        productIdArray,
        productIdSelected,
        $(".tab-selected").attr("id"),
        true
      );
  });
  $("#productSelected").on("input", function () {
    productSelectedChanged(
      $(this).val(),
      productIdArray,
      productIdSelected,
      $(".tab-selected").attr("id")
    );
  });

  //#endregion

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    //on successful save
    if (saveChanges(socket)) {
      updateHasChanges(false);
    }
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    exportDataTable(
      tableName,
      `${productIdSelected} - Alternate Index Table`,
      isTableEmpty
    );
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", async function () {
    formSelected = "import";
    // Fill in Supplier Number and Name if not already filled
    if (supplierArray.length === 0) {
      showLoadingScreen("Loading Supplier List...");
      try {
        await fillSupplierTextBoxDataList(supplierArray, currencySupplierMap);
      } catch {
        // Error handled in fetchSupplierFromDatabase
        return;
      }

      hideLoadingScreen();
    }
    showPopUpForm(formSelected, "Import Alternate Index");
  });

  // Edit button
  $('button[name="editBtn"]').on("click", function () {
    formSelected = "edit";
    $(`#${formSelected}Index`).val(altIndexSelected.Index);
    $(`#${formSelected}Name`).text(altIndexSelected.Name);
    $(`#${formSelected}Num`).val(altIndexSelected.Number);
    $(`#${formSelected}Moq`).text(altIndexSelected.Moq);
    $(`#${formSelected}Currency`).text(altIndexSelected.CostCurrency);
    $(`#${formSelected}Aud`).val(altIndexSelected.CostAud);
    $(`#${formSelected}Date`).text(
      altIndexSelected.LastUpdated.toLocaleString("en-AU")
    );
    $(`#${formSelected}Quality`).val(altIndexSelected.Quality);
    $(`#${formSelected}SupType`).text(altIndexSelected.SupplierPartType);
    $(`#${formSelected}WcpType`).text(altIndexSelected.WcpPartType);
    $(`#${formSelected}Main`).prop("checked", altIndexSelected.IsMain);
    showPopUpForm(formSelected, "Edit Alternate Index");
  });

  // Edit Supplier button
  $('button[name="editSupplierBtn"]').on("click", async function () {
    formSelected = "editSupplier";
    $(`#${formSelected}Name`).text(altIndexSelected.Name);
    $(`#${formSelected}Num`).val(altIndexSelected.Number);
    $(`#${formSelected}Currency`).val(
      currencySupplierMap[altIndexSelected.Number]
    );
    // Fill Currency Rates
    try {
      await fillCurrencyRates();
    } catch (error) {
      console.log(error);
      return;
    }
    // Fill in Supplier Number and Name if not already filled
    if (supplierArray.length === 0) {
      showLoadingScreen("Loading Supplier List...");
      try {
        await fillSupplierTextBoxDataList(supplierArray, currencySupplierMap);
      } catch {
        // Error handled in fetchSupplierFromDatabase
        return;
      }

      hideLoadingScreen();
    }
    showPopUpForm(formSelected, "Edit Supplier Information");
  });

  //#endregion

  //#region Row Click event
  $(`${tableName} tbody`).on("click", "tr", function () {
    if (isTableEmpty) return;
    // Clear highlight of all row in DataTable
    table.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Assign row to productSelected
    altIndexSelected = new AlternateIndexDto(
      ...Object.values(table.row(this).data())
    );
    if (altIndexSelected.CostAud == -1)
      altIndexSelected.CostAud = calculateAUD(
        currencySupplierMap[altIndexSelected.Number] ?? "AUD",
        altIndexSelected.CostCurrency
      );
    rowIndexSelected = table.row(this).index();
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });
  //#endregion

  //#region Form Events
  $('button[name="saveForm"]').on("click", async function () {
    const fileVal = $(`#${formSelected}File`).val();
    const altIndexVal = $(`#${formSelected}Index`).val();
    const supNumVal = $(`#${formSelected}Num`).val();
    const supNameVal = $(`#${formSelected}Name`).text();
    const moqVal = $(`#${formSelected}Moq`).val();
    const costCurVal = $(`#${formSelected}CostCur`).val();
    const supPartTypeVal = $(`#${formSelected}SupPartType`).val();
    const wcpPartTypeVal = $(`#${formSelected}WcpPartType`).val();
    const QualityVal = $(`#${formSelected}Quality`).val();
    const costAUDVal = $(`#${formSelected}Aud`).val();
    const isMainVal = $(`#${formSelected}Main`).is(":checked");
    const productVal = $(`#${formSelected}Product`).val();
    const currencyVal = $(`#${formSelected}Currency`).val();
    let isFormFilled = false;
    let changesMade = [];
    let errorMessage = [];

    //check mandatory fields
    if (formSelected === "import") {
      isFormFilled =
        Boolean(
          fileVal &&
            altIndexVal &&
            supNumVal &&
            moqVal &&
            costCurVal &&
            supPartTypeVal &&
            wcpPartTypeVal &&
            productVal
        ) && supNameVal != "-";
    } else if (formSelected === "edit") {
      isFormFilled = Boolean(
        altIndexVal && supNumVal && costAUDVal && QualityVal
      );
    } else if (formSelected === "editSupplier") {
      const isCurrencyValid = Object.keys(currencyRates.data).includes(
        currencyVal
      );

      isFormFilled = Boolean(supNumVal) && supNameVal != "-" && isCurrencyValid;

      // On Currency not being valid
      if (!isCurrencyValid) {
        showAlert(
          "<strong>Error!</strong> Please use only the available Currency Options."
        );
        return;
      }
    }
    // On Form being filled Incompletely or Incorrectly
    if (!isFormFilled) {
      showAlert(
        "<strong>Error!</strong> Please complete all non-optional fields."
      );
      return;
    }

    // Import Form Save
    if (formSelected === "import") {
      let isQualityEmpty = QualityVal.trim().length === 0;
      let columnHeader = [
        altIndexVal,
        productVal,
        moqVal,
        costCurVal,
        supPartTypeVal,
        wcpPartTypeVal,
        QualityVal,
      ];
      columnHeader.filter((n) => n);

      const jsonSheet = await readFileToJson("#importFile", columnHeader);

      let missingHeader = "";
      // Check if file is empty or blank
      if (jsonSheet === undefined || jsonSheet.length === 0) {
        showAlert(
          `<strong>Error!</strong> <i>${$("input[type=file]")
            .val()
            .split("\\")
            .pop()}</i> File is empty or blank.`
        );
        return;
      }

      missingHeader = findMissingColumnHeader(jsonSheet[0], [
        altIndexVal,
        productVal,
        moqVal,
        costCurVal,
        supPartTypeVal,
        wcpPartTypeVal,
        isQualityEmpty ? null : QualityVal,
      ]);

      // Check if all headers from input are inside the file
      if (Boolean(missingHeader)) {
        showAlert(
          `<strong>Error!</strong> Column <i>${missingHeader}</i> Header not found in file.`
        );
        return;
      }

      const importAltIndexes = jsonSheet.map((row) => {
        // Change according to this: yes I think its probably easier to store
        // the currency the supplier quotes in against the supplier and the import will just be a $ value
        return new AlternateIndexDto(
          row[altIndexVal],
          supNameVal,
          supNumVal,
          row[moqVal],
          row[costCurVal],
          null,
          new Date(),
          isQualityEmpty ? "" : row[QualityVal],
          row[supPartTypeVal],
          row[wcpPartTypeVal],
          false,
          row[productVal]
        );
      });

      // Store each new row locally
      changesMade.push(
        new Map([
          ["type", "newSupplier"],
          ["supplier", supNumVal],
          ["table", "AlternateIndex"],
          ["changes", importAltIndexes],
        ])
      );

      if (errorMessage.length) {
        showAlert(`<strong>Error!</strong> ${errorMessage.join(".\n")}`);
        return;
      }

      let importAltIndexCurrentProduct = importAltIndexes.filter(
        (altIndex) =>
          altIndex.ProductID === productIdSelected ||
          altIndex.ProductID === productIdAlias
      );

      if (importAltIndexCurrentProduct.length > 0) {
        // Empty Data if data before is is empty
        if (isTableEmpty) {
          isTableEmpty = false;
          $dateFromFilter.attr("disabled", isTableEmpty);
          $dateToFilter.attr("disabled", isTableEmpty);
          table.clear().draw();
        }

        // Add data to table
        table.rows.add(importAltIndexCurrentProduct).draw();
      }
    }
    // Edit Form Save
    else if (formSelected === "edit") {
      if (!isFloat(costAUDVal))
        errorMessage.push(
          `Cost AUD <i>${costAUDVal}</i> is not a number value`
        );

      if (errorMessage.length) {
        showAlert(`<strong>ERROR!</strong> ${errorMessage.join(".\n")}`);
        return;
      }
      let rowData = table.row(rowIndexSelected).data();
      // Save if there are any changes compared to old value (can be found in productSelected)
      let newUpdate = {};

      if (altIndexSelected.Index != altIndexVal)
        newUpdate.Index = rowData.Index = altIndexVal;

      if (altIndexSelected.Number != supNumVal) {
        newUpdate.Number = rowData.Number = supNumVal;
        newUpdate.Name = rowData.Name = supNameVal;
      }

      if (altIndexSelected.CostAud != costAUDVal)
        newUpdate.CostAud = rowData.CostAud = parseFloat(costAUDVal);

      if (altIndexSelected.Quality != QualityVal)
        newUpdate.Quality = rowData.Quality = QualityVal;

      if (altIndexSelected.IsMain != isMainVal) {
        newUpdate.IsMain = rowData.IsMain = isMainVal;
        mainSupplier = isMainVal ? rowData.Number : null;

        // Change previous Main Supplier into normal supplier in table
        if (prevMainSupplier && prevMainSupplier != altIndexSelected.Number) {
          // column index 1 for Supplier Number
          let prevMainRow = table.column(1).data().indexOf(prevMainSupplier);
          let prevMainRowData = table.row(prevMainRow).data();
          let updatePrevMain = {};
          prevMainRowData.IsMain = updatePrevMain.IsMain = false;

          changesMade.push(
            new Map([
              ["type", "edit"],
              ["id", productIdSelected],
              ["table", "AlternateIndex"],
              ["number", prevMainRowData.Number],
              ["changes", updatePrevMain],
            ])
          );

          table.row(prevMainRow).data(prevMainRowData).invalidate().draw();
        }
      }
      // exit if no changes were made
      if (Object.keys(newUpdate).length === 0) {
        exitPopUpForm(formSelected);
        return;
      }

      changesMade.push(
        new Map([
          ["type", "edit"],
          ["id", productIdSelected],
          ["table", "AlternateIndex"],
          ["number", altIndexSelected.Number],
          ["changes", newUpdate],
        ])
      );
      altIndexSelected = updateObject(altIndexSelected, newUpdate);
      // Redraw the table to reflect the changes
      table.row(rowIndexSelected).data(rowData).invalidate().draw();
    }
    // Edit Supplier Form Save
    else if (formSelected === "editSupplier") {
      let newUpdate = {};

      if (currencySupplierMap[altIndexSelected.Number] != currencyVal)
        newUpdate.Currency = currencySupplierMap[altIndexSelected.Number] =
          currencyVal;

      // exit if no changes were made
      if (Object.keys(newUpdate).length === 0) {
        exitPopUpForm(formSelected);
        return;
      }

      changesMade.push(
        new Map([
          ["type", "edit"],
          ["supplier", supNumVal],
          ["table", "Supplier"],
          ["changes", newUpdate],
        ])
      );

      // Redraw the table to reflect the changes in currency
      table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        let rowData = this.data();
        if (rowData.Number === supNumVal) {
          this.data(rowData).invalidate();
        }
      });
      table.draw();
    }
    // save new rows into sessionStorage
    updateChanges(changesMade);
    // Toggle hasChanges ON
    updateHasChanges(true);
    // Exit form
    exitPopUpForm(formSelected);
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    hidePopUpForm(formSelected);
    mainSupplier = prevMainSupplier;
  });

  $("#editMain").on("change", function () {
    prevMainSupplier = mainSupplier;
    $("#mainConfirmation.confirmation").show();
    $("#popupForm").css("z-index", 0);
    const currentSupplierName = $("#editName").text();
    if (!mainSupplier)
      $("#changeInfo").html(
        `from <b>Nothing</b> to <b>${currentSupplierName}</b>`
      );
    else if ($("#editMain").is(":checked")) {
      let row = table.column(1).data().indexOf(mainSupplier); // column index 1 for Supplier Number
      let rowData = table.row(row).data();
      $("#changeInfo").html(
        `from <b>${rowData.Name}</b> to <b>${currentSupplierName}</b>`
      );
    } else
      $("#changeInfo").html(
        `from <b>${currentSupplierName}</b> to <b>Nothing</b>`
      );
  });

  // Event for when Supplier Number is changed, change Supplier Name
  ["import", "edit"].forEach((form) => {
    $(`#${form}Num`).on("input", function () {
      const supplierNumber = $(this).val();
      const supplierFound = supplierArray.find(
        (supplier) => supplier.SupplierNumber == supplierNumber
      );
      if (supplierFound) {
        $(`#${form}Name`).text(supplierFound.SupplierName);
        return;
      }
      $(`#${form}Name`).text("-");
    });
  });

  $("#editSupplierNum").on("input", function () {
    const supplierNumber = $(this).val();
    const supplierFound = supplierArray.find(
      (supplier) => supplier.SupplierNumber == supplierNumber
    );
    if (supplierFound) {
      $("#editSupplierName").text(supplierFound.SupplierName);
      $("#editSupplierCurrency").val(supplierFound.Currency);
      return;
    }
    $("#editSupplierName").text("-");
    $("#editSupplierCurrency").val("");
  });

  $('#mainConfirmation button[name="yes"]').on("click", function () {
    sessionStorage.setItem("hasChanges", false);
    $("#mainConfirmation.confirmation").hide();
    $("#popupForm").css("z-index", "");
    mainSupplier = $("#editMain").is(":checked") ? $("#editNum").val() : null;
  });

  $('#mainConfirmation button[name="no"]').on("click", function () {
    $("#mainConfirmation.confirmation").hide();
    $("#popupForm").css("z-index", "");
    $("#editMain").prop("checked", !$("#editMain").is(":checked"));
    mainSupplier = prevMainSupplier;
  });

  //#endregion
});

/**
 * Fills the supplier text box data list with options for alternative index Name and ID.
 * Retrieves supplier data from the database and populates the data list.
 *
 * @param {Array} supplierArray - The array to store the retrieved supplier data.
 * @param {Object} currencySupplierMap - The map to store the currency information for each supplier.
 * @returns {void}
 */
async function fillSupplierTextBoxDataList(supplierArray, currencySupplierMap) {
  // Fill in options for alternative index Name and ID
  try {
    // Get all Supplier from database
    const supplierFromDatabase = await fetchSupplierFromDatabase(socket);
    supplierArray.push(...supplierFromDatabase);
  } catch {
    // Error handled in fetchSupplierFromDatabase
    return;
  }

  // Fill in Search by Bars
  supplierArray.forEach((supplier) => {
    $("#altIndexNumList").append(
      $("<option>")
        .attr("value", supplier.SupplierNumber)
        .text(`${supplier.SupplierNumber}: ${supplier.SupplierName}`)
    );
    currencySupplierMap[supplier.SupplierNumber] = supplier.Currency;
  });
}

/**
 * Fills the currency rates in the altIndexCurrencyList dropdown.
 * @returns {Promise<Object>} The currency rates object.
 * @throws {Error} If unable to retrieve currency rates from API.
 */
async function fillCurrencyRates() {
  try {
    const currencyRates = await getCurrencyRates();
    const $altIndexCurrencyList = $("#altIndexCurrencyList");

    // Check if datalist already has options
    if ($altIndexCurrencyList.children().length === 0) {
      Object.keys(currencyRates.data).forEach((currency) => {
        $altIndexCurrencyList.append(
          $("<option>").attr("value", currency).text(currency)
        );
      });
    }

    return currencyRates;
  } catch (error) {
    showAlert(
      "<strong>Error!</strong> Unable to retrieve currency rates from API."
    );
    throw error;
  }
}
