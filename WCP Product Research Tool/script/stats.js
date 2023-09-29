$(function () {
  const COLUMN_AMOUNT = 1;
  const ROW_AMOUNT_VIN = 10;
  const ROW_AMOUNT_OEM = 10;
  const VIN_TABLE_NAME = "#vinTable";
  const OEM_TABLE_NAME = "#oemTable";
  var formSelected = "";
  var isEmptyData = true;

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
    orderCellsTop: true,
    stateSave: true,
  });
  const OEM_TABLE = new DataTable(OEM_TABLE_NAME, {
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
  $("#productSelected").val(productChosen);

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    // find changes
    // save changes to SQL

    // if save successful
    editHasChanges(false);
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
        fileName: `${productChosen} - Stats Table`,
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

  $('button[name="saveForm"]').on("click", function () {
    //check if mandatory field
    const FILE_VALUE = $(`#${formSelected}File`).val();
    const VIN_VALUE = $(`#${formSelected}Vin`).val();
    const OEM_VALUE = $(`#${formSelected}Oem`).val();
    const VIN_WORKSHEET_VALUE = $(`#${formSelected}VinWS`).val();
    const OEM_WORKSHEET_VALUE = $(`#${formSelected}OemWS`).val();

    var isFormFilled = Boolean(FILE_VALUE && (VIN_VALUE || OEM_VALUE));

    if ($(`#${formSelected}DiffWS`).is(":checked")) {
      if (VIN_VALUE) {
        isFormFilled &= Boolean(VIN_WORKSHEET_VALUE);
      }
      if (OEM_VALUE) {
        isFormFilled &= Boolean(OEM_WORKSHEET_VALUE);
      }
    }

    // Successful Save
    if (isFormFilled) {
      editHasChanges(true);

      // reset values
      // $(`#${formSelected}Form input`).val("");
      // $(`#${formSelected}Form select`).val("");
      // $(`#${formSelected}DiffWS`).prop("checked", false);
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
