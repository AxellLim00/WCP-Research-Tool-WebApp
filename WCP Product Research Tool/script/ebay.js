$(function () {
  const COLUMN_AMOUNT = 1;
  const ROW_AMOUNT = 10;
  const K_TYPE_TABLE_NAME = "#kTypeTable";
  const EPID_TABLE_NAME = "#epIDTable";
  var isEmptyData = true;
  var productIdSelected = sessionStorage.getItem("productIDSelected");
  //Load table from SQL

  // if loading from SQL empty
  if (isEmptyData) {
    $(K_TYPE_TABLE_NAME).append(getEmptyRow(ROW_AMOUNT, COLUMN_AMOUNT));
    $(EPID_TABLE_NAME).append(getEmptyRow(ROW_AMOUNT, COLUMN_AMOUNT));
  } else {
    let kTypeTable_Data, epIDTable_Data;
    //fill in table with the data

    // $("#kTypeTable > tbody:last-child").append(
    // html here
    // );
    // $("#epIDTable > tbody:last-child").append(
    // html here
    // );
  }

  const K_TYPE_TABLE = new DataTable(K_TYPE_TABLE_NAME, {
    orderCellsTop: true,
    stateSave: true,
  });
  const EPID_TABLE = new DataTable(EPID_TABLE_NAME, {
    orderCellsTop: true,
    stateSave: true,
  });

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
  $("#productSelected").val(productIdSelected);

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    // on successful save to SQL
    if (saveChangesToSQL()) {
      updateHasChanges(false);
    }
  });

  // Export table Button

  $('button[name="exportBtn"]').on("click", function () {
    if (isEmptyData) {
      showAlert("<strong>Error!</strong> No data found in table.");
    } else {
      $("table").tableExport({
        type: "excel",
        fileName: `${productIdSelected} - eBay Compatibility Table`,
        mso: {
          fileFormat: "xlsx",
          worksheetName: ["K-Types", "EPIDs"],
        },
      });
    }
  });

  $('button[name="newBtn"]').on("click", function () {
    formSelected = "new";
    showPopUpForm(formSelected, "New Item");
  });

  $('button[name="editBtn"]').on("click", function () {
    formSelected = "edit";
    showPopUpForm(formSelected, "Edit Item");
  });

  //#endregion

  //#region Form Event

  $('button[name="saveForm"]').on("click", async function () {
    const FILE_VALUE = $(`#${formSelected}File`).val();
    const ID_VALUE = $(`#${formSelected}Id`).val();
    let changesMade = [];
    let isFormFilled = false;
    // validation on import
    if (formSelected == "import")
      isFormFilled = Boolean(ID_VALUE && COST_USD_VALUE && FILE_VALUE);
    // validation on edit
    else if (formSelected == "edit") {
      isFormFilled = Boolean(
        EST_COST_AUD_VALUE && EST_SELL_VALUE && POSTAGE_VALUE && EXT_GP_VALUE
      );
    }
    // Successful Save
    if (!isFormFilled) {
      showAlert(
        `<strong>Error!</strong> Please complete all non-optional fields.`
      );
      return;
    }

    // Import Form Save
    if (formSelected == "edit") {
      // Check if all inputs are numbers or in float format.
      if (
        !(
          isFloat(EST_COST_AUD_VALUE) &&
          isFloat(EST_SELL_VALUE) &&
          isFloat(POSTAGE_VALUE) &&
          isFloat(EXT_GP_VALUE)
        )
      ) {
        showAlert(
          "<strong>Error!</strong> Please have all fields filled with the correct format."
        );
        return;
      }
      // Save if there are any changes compared to old value (can be found in costVolSelected)
      newUpdate = {};
      let costAud = parseFloat(EST_COST_AUD_VALUE).toFixed(2);
      if (costVolSelected.EstimateCostAUD != costAud)
        newUpdate.EstimateCostAUD = costAud;

      let sell = parseFloat(EST_SELL_VALUE).toFixed(2);
      if (costVolSelected.EstimateSell != sell) newUpdate.EstimateSell = sell;

      let post = parseFloat(POSTAGE_VALUE).toFixed(2);
      if (costVolSelected.Postage != post) newUpdate.Postage = post;

      let extGP = parseFloat(EXT_GP_VALUE).toFixed(2);
      if (costVolSelected.ExtGP != extGP) newUpdate.ExtGP = extGP;

      // exit if no changes were made
      if (Object.keys(newUpdate).length === 0) {
        exitPopUpForm(formSelected);
        return;
      }
      changesMade.push(
        new Map([
          ["type", "edit"],
          ["id", productIdSelected],
          ["table", "CostVolume"],
          ["changes", newUpdate],
        ])
      );
      costVolSelected = updateObject(costVolSelected, newUpdate);
      $.each(Object.keys(costVolSelected), function (i, val) {
        TABLE.find("tr").find("td").eq(i).text(costVolSelected[val]);
      });
    }

    updateChanges(changesMade);
    // Toggle hasChanges On
    updateHasChanges(true);
    exitPopUpForm(formSelected);
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    hidePopUpForm(formSelected);
  });

  $('input[name="newItem"]').on("click", function () {
    switch ($(this).val()) {
      case "K-Type":
        $("#newKtypeTextbox").show();
        $("#newEpidTextbox").hide();
        break;
      case "EPID":
        $("#newKtypeTextbox").hide();
        $("#newEpidTextbox").show();
        break;
    }
  });

  //#endregion
});

// TO DO: New item logic
// TO DO: Edit item logic
