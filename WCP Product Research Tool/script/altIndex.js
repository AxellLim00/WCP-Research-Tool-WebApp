$(function () {
  const COLUMN_AMOUNT = 10;
  const ROW_AMOUNT = 10;
  const TABLE_NAME = "#altIndexTable";
  var isEmptyData = true;
  var formSelected = "";
  var currencyRate = new Object();
  var currencyList = new Set();
  var productChosen = sessionStorage.getItem("productChosen");

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
  $("#productSelected").val(productChosen);

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
        fileName: `${productChosen} - Alternate Index Table`,
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

  //#endregion

  //#region Form Button
  $('button[name="saveForm"]').on("click", async function () {
    const FILE_VALUE = $(`#${formSelected}File`).val();
    const SUPPLIER_NUMBER_VALUE = $(`#${formSelected}Num`).val();
    const MOQ_VALUE = $(`#${formSelected}Moq`).val();
    const COST_CURRENCY_VALUE = $(`#${formSelected}CostCur`).val();
    const SUPPLIER_PART_TYPE_VALUE = $(`#${formSelected}SupPartType`).val();
    const WCP_PART_TYPE_VALUE = $(`#${formSelected}WcpPartType`).val();
    const QUALITY_VALUE = $(`#${formSelected}Quality`).val();

    //check if mandatory field
    let isFormFilled = Boolean(
      FILE_VALUE &&
        SUPPLIER_NUMBER_VALUE &&
        MOQ_VALUE &&
        COST_CURRENCY_VALUE &&
        SUPPLIER_PART_TYPE_VALUE &&
        WCP_PART_TYPE_VALUE
    );

    // On Form being filled Completely
    if (isFormFilled) {
      let isQualityEmpty = QUALITY_VALUE.trim().length == 0;
      const SHEET_JSON = await readExcelFileToJson("#importFile");
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
          `<strong>Error!</strong> Column ${missingHeader} Header not found in file.`
        );
        return;
      }

      // TO DO: Get supplier list from SQL to json format
      // Will create a map
      let supplierListJson = new Map([]);

      let problemEncountered = [];
      let changesMade = [];

      // clear the list
      currencyList = new Set();
      // TO DO: get all of currency in SHEET_JSON, once there is an example
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
          problemEncountered.push(
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
          problemEncountered.push(costAud);
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
            ["id", productChosen],
            ["table", "AlternateIndex"],
            ["changes", newObject],
          ])
        );
        return newObject;
      });

      if (problemEncountered.length > 0) {
        showAlert(`<strong>Error!</strong> ${problemEncountered.join("\n")}`);
        return;
      }

      // Empty Data if data before is is empty
      if (isEmptyData) {
        isEmptyData = false;
        TABLE.clear().draw();
      }
      // save new rows into Session Storage
      updateChanges(changesMade);
      // Toggle hasChanges On
      updateHasChanges(true);
      // Add data to table
      TABLE.rows.add(importAltIndexes).draw();
      exitPopUpForm(formSelected);
      return;
    }
    // On Form being filled Incompletely
    else {
      showAlert(
        "<strong>Error!</strong> Please complete all non-optional fields."
      );
      return;
    }
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    hidePopUpForm(formSelected);
  });

  //#endregion
});

/**
 * Convert local currency to AUD currency
 * @param {String} costCurrency currency name
 * @param {Number} amount Amount in local currency
 * @returns {number} Amount converted to AUD
 */
function calculateAUD(costCurrency, amount) {
  const RATES = JSON.parse(localStorage.getItem("currencyRate"))["data"];

  if (!RATES.hasOwnProperty(costCurrency))
    // when currency not Found
    return `<i>Cost Currency ${costCurrency}</i> not found and cannot be converted.\n`;

  return (amount * 1) / RATES[costCurrency];
}

/**
 * Update "currencyRate" in Session Storage to have currency rates to AUD
 * and get converison rates from API
 * @returns {Map} of currencies to its currency rates
 */
function getCurrencyRates() {
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
  FREE_CURRENCY_API.latest({
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
