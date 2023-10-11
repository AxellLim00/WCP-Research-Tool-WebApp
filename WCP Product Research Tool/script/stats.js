$(function () {
  const COLUMN_AMOUNT = 1;
  const ROW_AMOUNT_VIN = 10;
  const ROW_AMOUNT_OEM = 10;
  const VIN_TABLE_NAME = "#vinTable";
  const OEM_TABLE_NAME = "#oemTable";
  var formSelected = "";
  var isEmptyData = true;
  var productIdSelected = sessionStorage.getItem("productIDSelected");

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

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    // find changes
    // save changes to SQL

    // if save successful
    updateHasChanges(false);
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    formSelected = "import";
    showPopUpForm(formSelected, "Import Vin Numbers and OEMs");
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

  //#endregion

  //#region Form Button
  $("#importDiffWS").on("change", function () {
    if ($(this).is(":checked")) {
      $(".ws-name").show();
    } else {
      $(".ws-name").hide();
    }
  });

  $('button[name="saveForm"]').on("click", async function () {
    //check if mandatory field
    const FILE_VALUE = $(`#${formSelected}File`).val();
    const VIN_VALUE = $(`#${formSelected}Vin`).val();
    const OEM_VALUE = $(`#${formSelected}Oem`).val();
    const VIN_WORKSHEET_VALUE = $(`#${formSelected}VinWS`).val();
    const OEM_WORKSHEET_VALUE = $(`#${formSelected}OemWS`).val();
    const IS_DIFFERENT_WORKSHEET = $(`#${formSelected}DiffWS`).is(":checked");
    let changesMade = [];

    var isFormFilled = Boolean(FILE_VALUE && (VIN_VALUE || OEM_VALUE));

    // When different worksheet is checked
    if (IS_DIFFERENT_WORKSHEET) {
      // VIN and OEM textbox must be filled
      if (!VIN_VALUE || !OEM_VALUE) {
        isFormFilled = false;
      } else {
        isFormFilled &=
          Boolean(VIN_WORKSHEET_VALUE) && Boolean(OEM_WORKSHEET_VALUE);
      }
    }

    // Successful Save
    if (isFormFilled) {
      let sheetJson;
      let vinSectionKey;
      let oemSectionKey;
      if (IS_DIFFERENT_WORKSHEET) {
        vinSectionKey = VIN_WORKSHEET_VALUE;
        oemSectionKey = OEM_WORKSHEET_VALUE;
        sheetJson = await readFileToJson(
          "#importFile",
          true,
          [VIN_WORKSHEET_VALUE, OEM_WORKSHEET_VALUE],
          [VIN_VALUE, OEM_VALUE]
        );
      } else {
        vinSectionKey = VIN_VALUE;
        oemSectionKey = OEM_VALUE;
        sheetJson = await readFileToJson("#importFile");
      }
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

      missingHeader = findMissingColumnHeader(sheetJson[0], [
        VIN_VALUE,
        OEM_VALUE,
      ]);

      // Check if all headers from input are inside the file
      if (Boolean(missingHeader)) {
        showAlert(
          `<strong>Error!</strong> Column ${missingHeader} Header not found in file.`
        );
        return;
      }

      let importVins = sheetJson
        .filter(function (row) {
          return row.hasOwnProperty(VIN_VALUE);
        })
        .map(function (row) {
          let newObject = { vin: row[VIN_VALUE] };
          changesMade.push(
            new Map([
              ["type", "new"],
              ["id", productIdSelected],
              ["table", "vin"],
              ["changes", newObject],
            ])
          );
          return newObject;
        });
      let importOems = sheetJson
        .filter(function (row) {
          return row.hasOwnProperty(OEM_VALUE);
        })
        .map(function (row) {
          let newObject = { oem: row[OEM_VALUE] };
          changesMade.push(
            new Map([
              ["type", "new"],
              ["id", productIdSelected],
              ["table", "oem"],
              ["changes", newObject],
            ])
          );
          return { oem: row[OEM_VALUE] };
        });

      // save new rows into Session Storage
      updateChanges(changesMade);
      // Toggle hasChanges On
      updateHasChanges(true);
      // Add data to table
      if (isEmptyData) {
        isEmptyData = false;
        VIN_TABLE.clear().draw();
        OEM_TABLE.clear().draw();
      }
      VIN_TABLE.rows.add(importVins).draw();
      OEM_TABLE.rows.add(importOems).draw();
      exitPopUpForm(formSelected);
      $(`.ws-name`).hide();
    }
    // Unsuccessful Save
    else {
      showAlert("<strong>Error!</strong> Please complete necessary fields.");
      return;
    }
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    hidePopUpForm(formSelected);
  });

  //#endregion
});
