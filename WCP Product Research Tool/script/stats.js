$(function () {
  const COLUMN_AMOUNT = 1;
  const ROW_AMOUNT_VIN = 10;
  const ROW_AMOUNT_OEM = 10;
  const VIN_TABLE_NAME = "#vinTable";
  const OEM_TABLE_NAME = "#oemTable";
  var formSelected = "";
  var isEmptyData = true;
  var productIdSelected = sessionStorage.getItem("productIDSelected");
  var oemSelected = "";
  var estSalesChanges = false;
  var notesChanges = false;
  // Temporary previous values variables
  var prevEstSales = "";
  var prevNote = "";

  //Load table from SQL

  // if loading from SQL empty

  if (isEmptyData) {
    $(VIN_TABLE_NAME).append(getEmptyRow(ROW_AMOUNT_VIN, COLUMN_AMOUNT));
    $(OEM_TABLE_NAME).append(getEmptyRow(ROW_AMOUNT_OEM, COLUMN_AMOUNT));
  } else {
    let vinTableData, oemTableData;
    //fill in table with the data

    // $("#vinTable > tbody:last-child").append(
    // html here
    // );
    // $("#oemTable > tbody:last-child").append(
    // html here
    // );
    // prevEstSales = ;
    // prevNote = ;
  }

  const VIN_TABLE = new DataTable(VIN_TABLE_NAME, {
    columns: [{ data: "vin" }],
    orderCellsTop: true,
    stateSave: true,
  });
  const OEM_TABLE = new DataTable(OEM_TABLE_NAME, {
    columns: [{ data: "oem" }],
    orderCellsTop: true,
    stateSave: true,
  });
  $(".dataTables_length").css("padding-bottom", "2%");

  //  TO DO: Get List of all products in an array
  //  Details:
  //  Add options to the datalist:
  // - "attr" helps if you need an i.d to identify each option.
  // - "text" is the content to be displayed.
  // productList = get_list
  // $.each(productList, function (i, item) {
  //   $("#productList").append($("<option>").attr("value", i).text(item));
  // });
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

    // save changes to SQL

    // if save successful
    updateHasChanges(false);
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    formSelected = "import";
    showPopUpForm(formSelected, "Import OEMs");
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (isEmptyData) {
      showAlert("<strong>Error!</strong> No data found in table.");
    } else {
      $("table").tableExport({
        type: "excel",
        fileName: `${productIdSelected} - Stats Table`,
        mso: {
          fileFormat: "xlsx",
          worksheetName: ["Vin Numbers", "OEMs"],
        },
      });
    }
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
    OEM_TABLE.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Assign row to productSelected
    oemSelected = Object.values(OEM_TABLE.row(this).data())[0];
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });

  //#endregion

  //#region Form Button

  $('button[name="saveForm"]').on("click", async function () {
    debugger;
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
        let newObject = { oem: row[OEM_VALUE] };
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
        OEM_TABLE.clear().draw();
      }
      OEM_TABLE.rows.add(importOems).draw();
    }
    // Edit Form Save
    else if (formSelected == "edit") {
      // Find the row in the DataTable with the matching ID.
      let row = OEM_TABLE.column(0).data().indexOf(oemSelected);
      let rowData = OEM_TABLE.row(row).data();

      if (oemSelected != OEM_VALUE) {
        // Get all OEMs without special characters
        oemArray = OEM_TABLE.columns(0)
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
        rowData.oem = OEM_VALUE;
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
      OEM_TABLE.row(row).data(rowData).invalidate();
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
