import DataTable from "datatables.net-dt";
import "datatables.net-datetime";
// require("datatables.net-responsive-dt");
import "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";
import socket from "../utils/socket-utils.js";
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
import { fetchSupplierFromDatabase } from "../utils/fetchSQL-utils.js";

// TODO: Test this edit changes

$(async function () {
  const columnDefaultAmount = 10;
  const rowDefaultAmount = 10;
  const tableName = "#altIndexTable";
  const $dateFromFilter = $('input[type="date"][name="from"]');
  const $dateToFilter = $('input[type="date"][name="to"]');
  const productDtoArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );

  let isTableEmpty = true;
  let formSelected;
  let currencyRate = new Map();
  let currencySupplierMap = new Map();
  let altIndexSelected = new AlternateIndexDto();
  let supplierList = [];
  let mainSupplier = null;
  let productIdSelected = sessionStorage.getItem("productIDSelected");
  let rowIndexSelected = -1;
  let productIdArray = getProductIdentifier(productDtoArray);
  let altIndexObjectArray = [];
  // temporary variable to store previous values
  let prevMainSupplier = null;

  //#region Initialization

  showLoadingScreen("Loading Alternate Index Table...");

  // Load table from API
  // TODO: Load table Server-side?
  // TODO: Add AltIndexNumber to Alt Index Table
  if (productIdSelected) {
    let selectedProductData = [];
    if (productIdSelected.slice(0, 2) == "R-") {
      // Filter existing ones with interchangeNumber, interchangeNumber and partTypeFriendlyName/partTypeCode
      selectedProductData = productDtoArray.filter(
        (x) => x.researchIdentifier == productIdSelected && x.vendorId
      );
    } else {
      selectedProductData = productDtoArray.filter(
        (x) => x.productStockNumber == productIdSelected && x.vendorId
      );
    }
    altIndexObjectArray = selectedProductData.map(
      (product) =>
        new AlternateIndexDto(
          String(product.vendorName),
          String(product.vendorId)
        )
    );
  }
  // Custom range date filtering function
  DataTable.ext.search.push(function (_, data) {
    let columnIndex = $dateFromFilter.data("column");
    let start = new Date(
      $dateFromFilter.val() ? $dateFromFilter.val() : -8640000000000000
    );
    let end = new Date(
      $dateToFilter.val() ? $dateToFilter.val() : -8640000000000000
    );
    let date = new Date(
      data[columnIndex] ? data[columnIndex] : -8640000000000000
    );

    if (date >= start && date <= end) return true;
    return false;
  });

  //#region Fill in textbox Datalist

  // Fill in ID search box
  $.each(productIdArray, function (_, item) {
    $("#productList").append($("<option>").attr("value", item).text(item));
  });

  // Fill in options for alternative index Name and ID
  try {
    supplierList = await fetchSupplierFromDatabase(socket);
  } catch {
    // Error handled in fetchSupplierFromDatabase
    return;
  }

  // Fill in Search by Bars
  supplierList.forEach((supplier) => {
    $("#altIndexNumList").append(
      $("<option>")
        .attr("value", supplier.SupplierNumber)
        .text(`${supplier.SupplierNumber}: ${supplier.SupplierName}`)
    );
  });

  //#endregion

  try {
    // TO DO: get all currency and supplier pair from Server-side
    // currencySupplierMap =
    // Check if all currency is in currencyRates
    currencyRate = await getCurrencyRates(socket);
  } catch (error) {
    showAlert(error.message);
    return;
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

  let tableOptions = {
    orderCellsTop: true,
    columns: [
      { data: "Name" },
      { data: "Number" },
      { data: "Moq" },
      { data: "CostCurrency" },
      { data: "CostAud" },
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

  $dateFromFilter.on("input", function () {
    if ($dateToFilter.val() == "") $dateToFilter.val($(this).val());
    table.draw();
  });

  $dateToFilter.on("input", function () {
    if ($dateFromFilter.val() == "") $dateFromFilter.val($(this).val());
    table.draw();
  });

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
  $('button[name="importBtn"]').on("click", function () {
    formSelected = "import";
    showPopUpForm(formSelected, "Import Alternate Index");
  });

  // Edit button
  $('button[name="editBtn"]').on("click", function () {
    formSelected = "edit";
    $(`#${formSelected}Name`).text(altIndexSelected.Name);
    $(`#${formSelected}Num`).text(altIndexSelected.Number);
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
    showPopUpForm(formSelected, "Edit Product");
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
    rowIndexSelected = table.row(this).index();
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });
  //#endregion

  //#region Form Events
  $('button[name="saveForm"]').on("click", async function () {
    const fileVal = $(`#${formSelected}File`).val();
    const supNumVal = $(`#${formSelected}Num`).val();
    const supNameVal = $(`#${formSelected}Name`).text();
    const moqVal = $(`#${formSelected}Moq`).val();
    const costCurVal = $(`#${formSelected}CostCur`).val();
    const supPartTypeVal = $(`#${formSelected}SupPartType`).val();
    const wcpPartTypeVal = $(`#${formSelected}WcpPartType`).val();
    const QualityVal = $(`#${formSelected}Quality`).val();
    const costAUDVal = $(`#${formSelected}Aud`).val();
    const isMainVal = $(`#${formSelected}Main`).is(":checked");
    let isFormFilled = false;
    let changesMade = [];
    let errorMessage = [];

    //check mandatory fields
    if (formSelected === "import") {
      isFormFilled =
        Boolean(
          fileVal &&
            supNumVal &&
            moqVal &&
            costCurVal &&
            supPartTypeVal &&
            wcpPartTypeVal
        ) && supNameVal != "-";
    } else if (formSelected === "edit") {
      isFormFilled = Boolean(costAUDVal && QualityVal);
    }
    // On Form being filled Incompletely
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

      let importAltIndexes = jsonSheet.map((row) => {
        // Change according to this: yes I think its probably easier to store
        // the currency the supplier quotes in against the supplier and the import will just be a $ value
        // TO DO: Find currency from Supplier Number
        // let Currency = currencySupplierMap[SUPPLIER_NUMBER_VALUE];
        let supplierFound = supplierList.find(
          (supplier) => supplier.SupplierNumber == supNumVal
        );
        let Currency = supplierFound ? supplierFound.Currency : "AUD";
        let costAud = calculateAUD(Currency, row[costCurVal]);

        // If converting currency occurred an error
        if (typeof costAud === "string" || costAud instanceof String) {
          errorMessage.push(costAud);
          return null;
        }

        let newObject = new AlternateIndexDto(
          SUPPLIER_NAME_VALUE_VALUE,
          supNumVal,
          row[moqVal],
          String(row[costCurVal]) + ` ${Currency}`,
          costAud,
          new Date(),
          isQualityEmpty ? "" : row[QualityVal],
          row[supPartTypeVal],
          row[wcpPartTypeVal],
          false
        );

        // Store each new row locally
        changesMade.push(
          new Map([
            ["type", "new"],
            ["id", productIdSelected],
            ["table", "AlternateIndex"],
            ["changes", [newObject]],
          ])
        );
        return newObject;
      });

      if (errorMessage.length) {
        showAlert(`<strong>Error!</strong> ${errorMessage.join(".\n")}`);
        return;
      }

      // Empty Data if data before is is empty
      if (isTableEmpty) {
        isTableEmpty = false;
        table.clear().draw();
      }
      // Add data to table
      table.rows.add(importAltIndexes).draw();
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

          table.row(prevMainRow).data(prevMainRowData).invalidate();
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

  $("#importNum").on("focusout", function () {
    let altIndexNumber = $(this).val();
    let supplierFound = supplierList.find(
      (supplier) => supplier.SupplierNumber == altIndexNumber
    );
    if (supplierFound) {
      $("#importName").text(supplierFound.SupplierName);
      return;
    }
    $("#importName").text("-");
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
