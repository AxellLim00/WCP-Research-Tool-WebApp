$(document).ready(function () {
  const COLUMN_AMOUNT = 10;
  const ROW_AMOUNT = 10;
  const TABLE_NAME = "#altIndexTable";
  var isEmptyData = true;
  var formSelected = "";

  //TO DO: Load table from SQL

  // TO DO: if loading from SQL empty

  // TO DO: Create sessionStorage (or localStrorage) to store currency conversion rates
  // TO DO: Check conversion rates are in sessionStorage, if not get the conversion rates

  if (isEmptyData) {
    $(TABLE_NAME).append(getEmptyRow(ROW_AMOUNT, COLUMN_AMOUNT));
  } else {
    let altIndexData;

    // TO DO: fill in table with the data
    // $("#altIndexTable > tbody:last-child").append(
    // html here
    // );
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
    // columnDefs: [
    //   {
    //     targets: 5,
    //     render: DataTable.render.datetime("d MMM yyyy"),
    //   },
    // ],
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
    // find changes
    // save changes to SQL

    // if save successful
    editHasChanges(false);
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (!isEmptyData) {
      if (!$(".alert").length) {
        $("body").append(`
          <div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
            <strong>Error!</strong> No data found in table.
          </div>`);
      } else if ($(".alert").is(":hidden")) {
        $(".alert").show();
      }
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
    $('h2[name="formTitle"]').text("Import Alternate Index");
    formSelected = "import";
    $("#popupForm").show();
    $(`#${formSelected}Form`).show();
    $("#darkLayer").css("position", "fixed");
    $("#darkLayer").show();
  });

  //#endregion

  //#region Form Button
  $('button[name="saveForm"]').on("click", function () {
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
      // Read file
      const FILE = $("#importFile").prop("files");
      const READER = new FileReader();
      READER.readAsArrayBuffer(FILE[0]);
      READER.onload = function () {
        const FILE_DATA = new Uint8Array(READER.result);
        const WORKBOOK = XLSX.read(FILE_DATA, { type: "array" });

        // Assuming the first sheet of the workbook is the relevant one
        const SHEET_NAME = WORKBOOK.SheetNames[0];
        const SHEET = WORKBOOK.Sheets[SHEET_NAME];
        const SHEET_JSON = XLSX.utils.sheet_to_json(SHEET);
        let missingHeader = "";

        // Check if file is empty or blank
        if (SHEET_JSON === undefined || SHEET_JSON.length == 0) {
          showAlert(
            `<strong>Error!</strong> <i>${FILE[0].name}</i> File is empty or blank.`
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
        // Will look like dictionary
        let supplierListJson = {};

        let problemEncountered = [];
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
          costAud = calculateAUD(row[COST_CURRENCY_VALUE]);
          if (typeof costAud === "string" || costAud instanceof String) {
            problemEncountered.push(costAud);
            return null;
          }
          return new AlternateIndex(
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
        // Toggle hasChanges On
        editHasChanges(true);
        // Add data to table
        TABLE.rows.add(importAltIndexes).draw();
        hidePopUpForm(formSelected);
      };
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
    $("#popupForm").hide();
    $(`#${formSelected}Form`).hide();
    $(".alert").hide();
    $("#darkLayer").hide();
    $("#darkLayer").css("position", "absolute");
  });

  //#endregion
});

function calculateAUD(costCurrency) {
  // TO DO: get currency rates from the sessionStorage
  // Use switch function OR dictionary to get the rates
  let costInAud = 0;

  if (false)
    // when currency not Found
    return `<i>Cost Currency ${costCurrency}</i> not found and cannot be converted.`;

  return costInAud;
}
