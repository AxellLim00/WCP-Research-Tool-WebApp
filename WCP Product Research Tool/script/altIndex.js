$(function () {
  const COLUMN_AMOUNT = 10;
  const ROW_AMOUNT = 10;
  const TABLE_NAME = "#altIndexTable";
  var isEmptyData = true;
  var formSelected = "";
  var currencyRate = new Object();
  var currencyList = new Set();
  var productIDSelected = sessionStorage.getItem("productIDSelected");
  var altIndexSelected = new AlternateIndex();
  var mainSupplier = null;
  // temporary variable to store previous values
  var prevMainSupplier = null;

  //TO DO: Load table from SQL

  // TO DO: Get all currency from SQL into currencyList
  // currencyList.add()
  // Check if all currency is in currencyRates
  currencyRate = getCurrencyRates();

  // Scenario of when data loaded is empty
  if (isEmptyData) {
    $(TABLE_NAME).append(getEmptyRow(ROW_AMOUNT, COLUMN_AMOUNT));
  } else {
    let altIndexData;
    let altIndexList = [];

    // TO DO: fill in table with the data
    // TO DO: create for loop to loop to every data in altIndexData and translate SQL to altIndex object
    // altIndexList.push() --> To push every altIndex Object to list
    // TABLE.rows.add(altIndexList).draw();
  }

  const TABLE = new DataTable(TABLE_NAME, {
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
      { data: "Quality" },
      { data: "SupplierPartType" },
      { data: "WcpPartType" },
      { data: "IsMain" },
    ],
    stateSave: true,
    columnDefs: [
      {
        targets: 6, // Assuming "Quality" is the 7th column
        render: function (data) {
          return toTitleCase(data);
        },
        orderable: true,
      },
      {
        targets: 9, // Assuming "Main Supplier" is the 10th column
        render: function (data) {
          return data ? "MAIN" : "";
        },
      },
    ],
  });

  $(`${TABLE_NAME}_filter`).remove();
  $(".dataTables_length").css("padding-bottom", "1%");

  //  TO DO: Get List of all products in an array
  //  Details:
  //  Add options to the datalist:
  // - "attr" helps if you need an i.d to identify each option.
  // - "text" is the content to be displayed.
  // productList = get_list
  // $.each(productList, function (i, item) {
  //   $("#productList").append($("<option>").attr("value", i).text(item));
  // });
  $("#productSelected").val(productIDSelected);

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    //on successful save
    if (saveChangesToSQL()) {
      updateHasChanges(false);
    }
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (isEmptyData) {
      showAlert("<strong>Error!</strong> No data found in table.");
    } else {
      $(TABLE_NAME).tableExport({
        type: "excel",
        fileName: `${productIDSelected} - Alternate Index Table`,
        mso: {
          fileFormat: "xlsx",
        },
        ignoreRow: ["#searchRow"],
      });
    }
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
    // $(`#${formSelected}Num`).val(altIndexSelected.Number);
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
    if (isEmptyData) return;
    // Clear highlight of all row in Datatable
    TABLE.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Assign row to productSelected
    altIndexSelected = new AlternateIndex(
      ...Object.values(TABLE.row(this).data())
    );
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });
  //#endregion

  //#region Form Events
  $('button[name="saveForm"]').on("click", async function () {
    const FILE_VALUE = $(`#${formSelected}File`).val();
    const SUPPLIER_NUMBER_VALUE = $(`#${formSelected}Num`).val();
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
      isFormFilled = Boolean(
        FILE_VALUE &&
          SUPPLIER_NUMBER_VALUE &&
          MOQ_VALUE &&
          COST_CURRENCY_VALUE &&
          SUPPLIER_PART_TYPE_VALUE &&
          WCP_PART_TYPE_VALUE
      );
    } else if (formSelected == "edit") {
      isFormFilled = Boolean(
        SUPPLIER_NUMBER_VALUE && COST_AUD_VALUE && QUALITY_VALUE
      );
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
      const SHEET_JSON = await readFileToJson("#importFile");
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
        SUPPLIER_NUMBER_VALUE,
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

      // TO DO: Get supplier list from SQL to json format
      // Will create a map
      let supplierListJson = new Map([]);

      // clear the list
      currencyList = new Set();
      // TO DO:  Change according to this: yes I think its probably easier to store 
      // the currency the supplier quotes in against the supplier and the import will just be a $ value
      currencyList = SHEET_JSON.map((row) => {
        return row[COST_CURRENCY_VALUE].split(" ", 2)[1];
      });
      currencyRate = getCurrencyRates(currencyList);

      let importAltIndexes = SHEET_JSON.map((row) => {
        // Temporary Code TO DO: DELETE THIS
        supplierListJson[row[SUPPLIER_NUMBER_VALUE]] =
          "Temporary Supplier Name";
        // DELETE UNTIL HERE

        // TO DO: Find supplier from Json list
        if (!supplierListJson.hasOwnProperty(row[SUPPLIER_NUMBER_VALUE])) {
          errorMessage.push(
            `<i>Supplier Number ${row[SUPPLIER_NUMBER_VALUE]}</i> not found.`
          );
          return null;
        }

        let costForeignCurrency = row[COST_CURRENCY_VALUE].split(" ", 2);
        let costAud = calculateAUD(
          costForeignCurrency[1],
          costForeignCurrency[0]
        );

        // If converting currency occured an error
        if (typeof costAud === "string" || costAud instanceof String) {
          errorMessage.push(costAud);
          return null;
        }

        let newObject = new AlternateIndex(
          supplierListJson[row[SUPPLIER_NUMBER_VALUE]],
          row[SUPPLIER_NUMBER_VALUE],
          row[MOQ_VALUE],
          row[COST_CURRENCY_VALUE],
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
            ["id", productIDSelected],
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
      if (isEmptyData) {
        isEmptyData = false;
        TABLE.clear().draw();
      }
      // Add data to table
      TABLE.rows.add(importAltIndexes).draw();
    }
    // Edit Form Save
    else if (formSelected == "edit") {
      if (!isFloat(COST_AUD_VALUE))
        errorMessage.push(
          `Cost AUD <i>${COST_AUD_VALUE}</i> is not a number value`
        );

      // Check if Supplier number already exist in Column
      // if (
      //   SUPPLIER_NUMBER_VALUE != altIndexSelected.Number &&
      //   TABLE.columns(1).data().toArray()[0].includes(SUPPLIER_NUMBER_VALUE)
      // )
      //   errorMessage.push(
      //     `Supplier Number <i>${SUPPLIER_NUMBER_VALUE}</i> already exist`
      //   );

      if (errorMessage.length) {
        showAlert(`<strong>ERROR!</strong> ${errorMessage.join(".\n")}`);
        return;
      }
      // Find the row in the DataTable with the matching ID.
      let row = TABLE.column(1).data().indexOf(altIndexSelected.Number); // column index 1 for Supplier Number
      let rowData = TABLE.row(row).data();
      // Save if there are any changes compared to old value (can be found in productSelected)
      newUpdate = {};
      // TO DO: uncomment if can be changed
      // if (altIndexSelected.Number != SUPPLIER_NUMBER_VALUE)
      //   newUpdate.Number = rowData.Number = SUPPLIER_NUMBER_VALUE;

      if (altIndexSelected.CostAud != COST_AUD_VALUE)
        newUpdate.CostAud = rowData.CostAud = parseFloat(COST_AUD_VALUE);

      if (altIndexSelected.Quality != QUALITY_VALUE)
        newUpdate.Quality = rowData.Quality = QUALITY_VALUE;

      if (altIndexSelected.IsMain != IS_MAIN_VALUE) {
        newUpdate.IsMain = rowData.IsMain = IS_MAIN_VALUE;
        mainSupplier = IS_MAIN_VALUE ? rowData.Number : null;

        // Change previous Main Supplier into normal supplier in table
        if (prevMainSupplier && prevMainSupplier != altIndexSelected.Number) {
          let prevMainRow = TABLE.column(1).data().indexOf(prevMainSupplier); // column index 1 for Supplier Number
          let prevMainRowData = TABLE.row(prevMainRow).data();
          let updatePrevMain = {};
          prevMainRowData.IsMain = updatePrevMain.IsMain = false;

          changesMade.push(
            new Map([
              ["type", "edit"],
              ["id", productIDSelected],
              ["table", "AlternateIndex"],
              ["number", prevMainRowData.Number],
              ["changes", updatePrevMain],
            ])
          );

          TABLE.row(prevMainRow).data(prevMainRowData).invalidate();
        }
      }
      // exit if no changes were made
      if (Object.keys(newUpdate).length === 0) {
        exitPopUpForm(formSelected);
        return;
      }

      // TO DO: Checkl if the main ID for supplier is the supplier number, and double check if this is editable
      changesMade.push(
        new Map([
          ["type", "edit"],
          ["id", productIDSelected],
          ["table", "AlternateIndex"],
          ["number", altIndexSelected.Number],
          ["changes", newUpdate],
        ])
      );
      altIndexSelected = updateObject(altIndexSelected, newUpdate);
      // Redraw the table to reflect the changes
      TABLE.row(row).data(rowData).invalidate();
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
      let row = TABLE.column(1).data().indexOf(mainSupplier); // column index 1 for Supplier Number
      let rowData = TABLE.row(row).data();
      $("#changeInfo").html(
        `from <b>${rowData.Name}</b> to <b>${currentSupplierName}</b>`
      );
    } else
      $("#changeInfo").html(
        `from <b>${currentSupplierName}</b> to <b>Nothing</b>`
      );
  });

  $('#mainConfirmation button[name="yes"]').on("click", function () {
    debugger;
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
  const FREE_CURRENCY_API = new Freecurrencyapi();
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
