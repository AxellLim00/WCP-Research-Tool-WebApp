$(function () {
  const COLUMN_AMOUNT = 10;
  const ROW_AMOUNT = 10;
  const TABLE_NAME = "#altIndexTable";
  const DATE_FROM_FILTER = $('input[type="date"][name="from"]');
  const DATE_TO_FILTER = $('input[type="date"][name="to"]');

  var isTableEmpty = true;
  var formSelected = "";
  var currencyRate = new Object();
  var currencySupplierMap = new Map();
  var altIndexSelected = new AlternateIndex();
  var altIndexValueDictionary = [];
  var mainSupplier = null;
  var productIdSelected = sessionStorage.getItem("productIDSelected");
  var productDtoArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );
  var productIdArray = getProductIdentifier(productDtoArray);
  var altIndexObjectArray = [];
  // temporary variable to store previous values
  var prevMainSupplier = null;

  //#region Initialization

  // Load table from API and TO DO: Server-side?
  if (productIdSelected) {
    let selectedProductData = [];
    if (productIdSelected.slice(0, 2) == "R-") {
      // Filter existing ones with interchangeNumber, interchangeNumber and partTypeFriendlyName/partTypeCode
      selectedProductData = productDtoArray.filter(
        (x) => x.researchIdentifier == productIdSelected && x.altIndexNumber
      );
    } else {
      selectedProductData = productDtoArray.filter(
        (x) => x.productStockNumber == productIdSelected && x.altIndexNumber
      );
    }
    altIndexObjectArray = selectedProductData.map(
      (product) =>
        new AlternateIndex(
          String(product.vendorName),
          String(product.altIndexNumber)
        )
    );

    altIndexValueDictionary = getAltIndexValueDictionary(productDtoArray);
  }

  // Custom range date filtering function
  DataTable.ext.search.push(function (_, data, _) {
    let columnIndex = DATE_FROM_FILTER.data("column");
    let start = new Date(
      DATE_FROM_FILTER.val() ? DATE_FROM_FILTER.val() : -8640000000000000
    );
    let end = new Date(
      DATE_TO_FILTER.val() ? DATE_TO_FILTER.val() : -8640000000000000
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
  $.each(Object.keys(altIndexValueDictionary), function (i, item) {
    $("#altIndexNumList").append($("<option>").attr("value", item).text(item));
  });

  //#endregion

  // TO DO: get all currency and supplier pair from Server-side
  // currencySupplierMap =

  // Check if all currency is in currencyRates
  currencyRate = getCurrencyRates();

  // Check if alternative index list is empty
  isTableEmpty = altIndexObjectArray.length == 0;
  // Scenario of when data loaded is empty
  if (isTableEmpty) {
    $(TABLE_NAME).append(getEmptyRow(ROW_AMOUNT, COLUMN_AMOUNT));
  }

  // Disable/Enable date picker
  DATE_FROM_FILTER.attr("disabled", isTableEmpty);
  DATE_TO_FILTER.attr("disabled", isTableEmpty);

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
  var table = new DataTable(TABLE_NAME, tableOptions);

  $(`${TABLE_NAME}_filter`).remove();
  $(".dataTables_length").css("padding-bottom", "1%");

  console.log(altIndexObjectArray);
  table.rows.add(altIndexObjectArray).draw(false);
  table.columns().search("").draw(false);

  $("#productSelected").val(productIdSelected);

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
      table.column($(this).attr("column"))
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

  DATE_FROM_FILTER.on("input", function () {
    if (DATE_TO_FILTER.val() == "") DATE_TO_FILTER.val($(this).val());
    table.draw();
  });

  DATE_TO_FILTER.on("input", function () {
    if (DATE_FROM_FILTER.val() == "") DATE_FROM_FILTER.val($(this).val());
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
    if (saveChanges()) {
      updateHasChanges(false);
    }
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    exportDataTable(
      TABLE_NAME,
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
  $(`${TABLE_NAME} tbody`).on("click", "tr", function () {
    if (isTableEmpty) return;
    // Clear highlight of all row in Datatable
    table.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Assign row to productSelected
    altIndexSelected = new AlternateIndex(
      ...Object.values(table.row(this).data())
    );
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });
  //#endregion

  //#region Form Events
  $('button[name="saveForm"]').on("click", async function () {
    const FILE_VALUE = $(`#${formSelected}File`).val();
    const SUPPLIER_NUMBER_VALUE = $(`#${formSelected}Num`).val();
    const SUPPLIER_NAME_VALUE = $(`#${formSelected}Name`).text();
    const MOQ_VALUE = $(`#${formSelected}Moq`).val();
    const COST_CURRENCY_VALUE = $(`#${formSelected}CostCur`).val();
    const SUPPLIER_PART_TYPE_VALUE = $(`#${formSelected}SupPartType`).val();
    const WCP_PART_TYPE_VALUE = $(`#${formSelected}WcpPartType`).val();
    const QUALITY_VALUE = $(`#${formSelected}Quality`).val();
    const COST_AUD_VALUE = $(`#${formSelected}Aud`).val();
    const IS_MAIN_VALUE = $(`#${formSelected}Main`).is(":checked");
    let isFormFilled = false;
    let changesMade = [];
    let errorMessage = [];

    //check mandatory fields
    if (formSelected == "import") {
      isFormFilled =
        Boolean(
          FILE_VALUE &&
            SUPPLIER_NUMBER_VALUE &&
            MOQ_VALUE &&
            COST_CURRENCY_VALUE &&
            SUPPLIER_PART_TYPE_VALUE &&
            WCP_PART_TYPE_VALUE
        ) && SUPPLIER_NAME_VALUE != "-";
    } else if (formSelected == "edit") {
      isFormFilled = Boolean(COST_AUD_VALUE && QUALITY_VALUE);
    }
    // On Form being filled Incompletely
    if (!isFormFilled) {
      showAlert(
        "<strong>Error!</strong> Please complete all non-optional fields."
      );
      return;
    }

    // Import Form Save
    if (formSelected == "import") {
      let isQualityEmpty = QUALITY_VALUE.trim().length == 0;
      let columnHeader = [
        MOQ_VALUE,
        COST_CURRENCY_VALUE,
        SUPPLIER_PART_TYPE_VALUE,
        WCP_PART_TYPE_VALUE,
        QUALITY_VALUE,
      ];
      columnHeader.filter((n) => n);

      const SHEET_JSON = await readFileToJson("#importFile", columnHeader);

      let missingHeader = "";
      // Check if file is empty or blank
      if (SHEET_JSON === undefined || SHEET_JSON.length == 0) {
        showAlert(
          `<strong>Error!</strong> <i>${$("input[type=file]")
            .val()
            .split("\\")
            .pop()}</i> File is empty or blank.`
        );
        return;
      }

      missingHeader = findMissingColumnHeader(SHEET_JSON[0], [
        MOQ_VALUE,
        COST_CURRENCY_VALUE,
        SUPPLIER_PART_TYPE_VALUE,
        WCP_PART_TYPE_VALUE,
        isQualityEmpty ? null : QUALITY_VALUE,
      ]);

      // Check if all headers from input are inside the file
      if (Boolean(missingHeader)) {
        showAlert(
          `<strong>Error!</strong> Column <i>${missingHeader}</i> Header not found in file.`
        );
        return;
      }

      let importAltIndexes = SHEET_JSON.map((row) => {
        // Change according to this: yes I think its probably easier to store
        // the currency the supplier quotes in against the supplier and the import will just be a $ value
        // TO DO: Find currency from Supplier Number
        // let Currency = currencySupplierMap[SUPPLIER_NUMBER_VALUE];
        let Currency = "AUD"; // TEMP
        let costAud = calculateAUD(Currency, row[COST_CURRENCY_VALUE]);

        // If converting currency occured an error
        if (typeof costAud === "string" || costAud instanceof String) {
          errorMessage.push(costAud);
          return null;
        }

        let newObject = new AlternateIndex(
          SUPPLIER_NAME_VALUE_VALUE,
          SUPPLIER_NUMBER_VALUE,
          row[MOQ_VALUE],
          String(row[COST_CURRENCY_VALUE]) + ` ${Currency}`,
          costAud,
          new Date(),
          isQualityEmpty ? "" : row[QUALITY_VALUE],
          row[SUPPLIER_PART_TYPE_VALUE],
          row[WCP_PART_TYPE_VALUE],
          false
        );

        // Store each new row locally
        changesMade.push(
          new Map([
            ["type", "new"],
            ["id", productIdSelected],
            ["table", "AlternateIndex"],
            ["changes", newObject],
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
    else if (formSelected == "edit") {
      if (!isFloat(COST_AUD_VALUE))
        errorMessage.push(
          `Cost AUD <i>${COST_AUD_VALUE}</i> is not a number value`
        );

      if (errorMessage.length) {
        showAlert(`<strong>ERROR!</strong> ${errorMessage.join(".\n")}`);
        return;
      }
      // Find the row in the DataTable with the matching ID.
      let row = table.column(1).data().indexOf(altIndexSelected.Number); // column index 1 for Supplier Number
      let rowData = table.row(row).data();
      // Save if there are any changes compared to old value (can be found in productSelected)
      newUpdate = {};

      if (altIndexSelected.CostAud != COST_AUD_VALUE)
        newUpdate.CostAud = rowData.CostAud = parseFloat(COST_AUD_VALUE);

      if (altIndexSelected.Quality != QUALITY_VALUE)
        newUpdate.Quality = rowData.Quality = QUALITY_VALUE;

      if (altIndexSelected.IsMain != IS_MAIN_VALUE) {
        newUpdate.IsMain = rowData.IsMain = IS_MAIN_VALUE;
        mainSupplier = IS_MAIN_VALUE ? rowData.Number : null;

        // Change previous Main Supplier into normal supplier in table
        if (prevMainSupplier && prevMainSupplier != altIndexSelected.Number) {
          let prevMainRow = table.column(1).data().indexOf(prevMainSupplier); // column index 1 for Supplier Number
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
      table.row(row).data(rowData).invalidate();
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
    currentSupplierName = $("#editName").text();
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
    if (altIndexValueDictionary.hasOwnProperty(altIndexNumber)) {
      $("#importName").text(altIndexValueDictionary[altIndexNumber]);
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

/**
 * Update "currencyRate" in Session Storage to have currency rates to AUD
 * and get converison rates from API
 * @returns {Map} of currencies to its currency rates
 */
async function getCurrencyRates() {
  let currencyRate;
  if (localStorage["currencyRate"]) {
    currencyRate = JSON.parse(localStorage.getItem("currencyRate"));
    lastUpdate = new Date(currencyRate["last_updated_at"]);
    // Check if currency Rate was updated within this week
    if (lastUpdate.getWeekNumber() == new Date().getWeekNumber()) {
      return currencyRate;
    }
  }
  let responseJSON;
  // Get the currency rates from API
  const FREE_CURRENCY_API = new FreeCurrencyAPI();
  await FREE_CURRENCY_API.latest({
    base_currency: "AUD",
  }).then((response) => {
    responseJSON = response;
  });
  currencyRate = responseJSON;
  currentDate = new Date();
  currencyRate["last_updated_at"] = currentDate.toString();

  localStorage.setItem("currencyRate", JSON.stringify(currencyRate));

  return currencyRate;
}
