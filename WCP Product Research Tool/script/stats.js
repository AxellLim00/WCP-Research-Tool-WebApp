$(function () {
  const COLUMN_AMOUNT = 1;
  const ROW_AMOUNT_VIN = 10;
  const ROW_AMOUNT_OEM = 10;
  const VIN_TABLE_NAME = "#vinTable";
  const OEM_TABLE_NAME = "#oemTable";
  const IS_PRODUCT_EDITABLE = Boolean(
    sessionStorage.getItem("productIDSelected")
  );
  var formSelected = "";
  var isEmptyData = true;
  var productIdSelected = sessionStorage.getItem("productIDSelected");
  var oemSelected = "";
  var estSalesChanges = false;
  var notesChanges = false;
  var productData;
  // Temporary previous values variables
  var prevEstSales = "";
  var prevNote = "";

  //Load table from SQL
  var vinTableData = [];
  var oemTableData = [];
  if (productIdSelected.slice(0, 2) == "R-") {
    // Filter existing ones with interchangeNumber, interchangeNumber and partTypeFriendlyName/partTypeCode
    productData = JSON.parse(
      sessionStorage.getItem("productRequestHistory")
    ).filter((x) => x.researchIdentifier == productIdSelected);
  } else {
    productData = JSON.parse(
      sessionStorage.getItem("productRequestHistory")
    ).filter((x) => x.productStockNumber == productIdSelected);
  }

  vinTableData = [
    // Remove duplicates
    ...new Set(
      productData
        .map((obj) => obj.vehicleIdentificationNumbers)
        .map((str) => str.split("\r"))
        .flat()
    ),
    // Return Data Table format
  ].map((vin) => {
    return { data: vin };
  });

  console.log("VIN Table Data");
  console.log(vinTableData);

  // if loading from SQL empty
  isEmptyData = vinTableData.length == 0 && oemTableData.length == 0;

  console.log(`isEmptyData ${isEmptyData}`);
  if (isEmptyData) {
    $(VIN_TABLE_NAME).append(getEmptyRow(ROW_AMOUNT_VIN, COLUMN_AMOUNT));
    $(OEM_TABLE_NAME).append(getEmptyRow(ROW_AMOUNT_OEM, COLUMN_AMOUNT));
  }

  var tableOptions = {
    columns: [{ data: "data" }],
    orderCellsTop: true,
    stateSave: true,
  };

  // initialize DataTable
  var vinTable = new DataTable(VIN_TABLE_NAME, tableOptions);
  var oemTable = new DataTable(OEM_TABLE_NAME, tableOptions);

  $(".dataTables_length").css("padding-bottom", "2%");

  // Fill in text fields
  $("#requestValue").val(productData[0].totalNumberOfRequests);
  $("#nfValue").val(productData[0].totalNumberOfNotFoundRequests);
  $("#stdValue").val(productData[0].averageConditionPrice);
  $("#salesValue").val(productData[0].totalNumberOfRequests);
  $("#estSalesVolValue").val(productData[0].totalNumberOfRequests);

  //  TO DO: Get List of all products in an array
  //  Details:
  //  Add options to the datalist:
  // - "attr" helps if you need an i.d to identify each option.
  // - "text" is the content to be displayed.
  // productList = get_list
  // $.each(productList, function (i, item) {
  //   $("#productList").append($("<option>").attr("value", i).text(item));
  // });
  vinTable.rows.add(vinTableData).draw();
  $("#productSelected").val(productIdSelected);

  //#region textbox event

  $("#estSalesVolValue").on("change", function () {
    if ($("#estSalesVolValue").val() != prevEstSales) estSalesChanges = true;
    else estSalesChanges = false;
    updateHasChanges(estSalesChanges || notesChanges);
  });

  $("#note").on("change", function () {
    if ($("#note").val() != prevNote) notesChanges = true;
    else notesChanges = false;
    updateHasChanges(estSalesChanges || notesChanges);
  });

  //#endregion

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    // find changes in textboxes
    const EST_SALES_VOLUME_VALUE = $("#estSalesVolValue").val();
    const NOTES_VALUE = $("#note").val();
    let update = {};
    if (EST_SALES_VOLUME_VALUE != prevEstSales)
      update.estSaleVol = prevEstSales = EST_SALES_VOLUME_VALUE;

    if (NOTES_VALUE != prevNote) update.note = prevNote = NOTES_VALUE;

    if (!jQuery.isEmptyObject(update)) updateChanges(update);

    // on successful save to SQL
    if (saveChangesToSQL()) {
      updateHasChanges(false);
    }
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    formSelected = "import";
    showPopUpForm(formSelected, "Import OEMs");
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    exportDataTable(
      "table",
      tableOptions,
      `${productIdSelected} - Stats Table`,
      isEmptyData,
      ["VINs", "OEMs"]
    );
  });

  // Edit button
  $('button[name="editBtn"]').on("click", function () {
    formSelected = "edit";
    $(`#${formSelected}Oem`).val(oemSelected);
    showPopUpForm(formSelected, "Edit Product");
  });

  //#endregion

  //#region Row Click event

  $(`${OEM_TABLE_NAME} tbody`).on("click", "tr", function () {
    if (isEmptyData) return;
    // Clear highlight of all row in Datatable
    oemTable.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Assign row to productSelected
    oemSelected = Object.values(oemTable.row(this).data())[0];
    if (IS_PRODUCT_EDITABLE)
      // Enable Edit button
      $('button[name="editBtn"]').prop("disabled", false);
  });

  //#endregion

  //#region Form Button

  $('button[name="saveForm"]').on("click", async function () {
    //check if mandatory field
    const FILE_VALUE = $(`#${formSelected}File`).val();
    const OEM_VALUE = $(`#${formSelected}Oem`).val();
    let changesMade = [];
    let isFormFilled = Boolean(OEM_VALUE);

    if (formSelected == "import") isFormFilled &= Boolean(FILE_VALUE);

    // Successful Save
    if (!isFormFilled) {
      showAlert("<strong>Error!</strong> Please complete necessary fields.");
      return;
    }
    // Import Form Save
    if (formSelected == "import") {
      let sheetJson;
      sheetJson = await readFileToJson("#importFile");

      let missingHeader = "";
      // If has erros from reading
      if (sheetJson === undefined) return;
      // If file is empty or blank
      if (sheetJson.length == 0) {
        showAlert(
          `<strong>Error!</strong> <i>${$("input[type=file]")
            .val()
            .split("\\")
            .pop()}</i> File is empty or blank.`
        );
        return;
      }

      missingHeader = findMissingColumnHeader(sheetJson[0], [OEM_VALUE]);

      // Check if all headers from input are inside the file
      if (Boolean(missingHeader)) {
        showAlert(
          `<strong>Error!</strong> Column <i>${missingHeader}</i> Header not found in file.`
        );
        return;
      }

      let importOems = sheetJson.map(function (row) {
        let newObject = { data: row[OEM_VALUE] };
        changesMade.push(
          new Map([
            ["type", "new"],
            ["id", productIdSelected],
            ["table", "oem"],
            ["changes", newObject],
          ])
        );
        return newObject;
      });

      // Add data to table
      if (isEmptyData) {
        isEmptyData = false;
        oemTable.clear().draw();
      }
      oemTable.rows.add(importOems).draw();
    }
    // Edit Form Save
    else if (formSelected == "edit") {
      // Find the row in the DataTable with the matching ID.
      let row = oemTable.column(0).data().indexOf(oemSelected);
      let rowData = oemTable.row(row).data();

      if (oemSelected != OEM_VALUE) {
        // Get all OEMs without special characters
        oemArray = oemTable
          .columns(0)
          .data()
          .toArray()[0]
          .map(function (item) {
            return String(item).replace(/[-_.,#~:;]]/g, "");
          });
        // Check if the number is the same as existing ones
        if (oemArray.includes(OEM_VALUE)) {
          showAlert(
            `<b>ERROR!</b> OEM Number <i>${OEM_VALUE}</i> already exist`
          );
          return;
        }
        rowData.data = OEM_VALUE;
      } else {
        // exit if no changes were made
        exitPopUpForm(formSelected);
        return;
      }

      changesMade.push(
        new Map([
          ["type", "edit"],
          ["id", productIdSelected],
          ["table", "Product"],
          ["oldValue", oemSelected],
          ["newValue", OEM_VALUE],
        ])
      );
      // Redraw the table to reflect the changes
      oemTable.row(row).data(rowData).invalidate();
      oemSelected = OEM_VALUE;
    }

    // Save new rows into Session Storage
    updateChanges(changesMade);
    // Toggle hasChanges On
    updateHasChanges(true);
    // Exit form
    exitPopUpForm(formSelected);
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    hidePopUpForm(formSelected);
  });

  //#endregion
});
