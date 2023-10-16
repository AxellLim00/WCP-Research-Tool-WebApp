$(function () {
  const COST_VOLUME_TABLE_NAME = "#costVolTable";
  const TABLE = $("#costVolTable");
  var researchID = "Default ID";
  var formSelected = "";
  var isEmptyData = true;
  var productIdSelected = sessionStorage.getItem("productIDSelected");
  var costVolSelected = new CostVolume();
  //Load table from SQL

  // if loading from SQL empty

  if (isEmptyData) {
    $('tr[name="values"]').children().text("-");
    $('button[name="editBtn"]').prop("disabled", true);
  } else {
    let costVolTableData;
    // TO DO: fill in table with the data

    // $("#productTable > tbody:last-child").append(
    // html here
    // );
  }

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
    // save changes to SQL
    let isSaved = saveChangesToSQL();
    // if successful save
    if (isSaved) updateHasChanges(false);
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (isEmptyData) {
      showAlert("<strong>Error!</strong> No data found in table.");
    } else {
      $(COST_VOLUME_TABLE_NAME).tableExport({
        type: "excel",
        fileName: `${researchID} - Cost & Volume Table`,
        mso: {
          fileFormat: "xlsx",
        },
      });
    }
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    formSelected = "import";
    showPopUpForm(formSelected, "Import Cost & Volume");
  });

  $('button[name="editBtn"]').on("click", function () {
    formSelected = "edit";
    $(`#${formSelected}Id`).text(costVolSelected.Id);
    $(`#${formSelected}CostUsd`).text(costVolSelected.CostUSD);
    $(`#${formSelected}CostAud`).text(costVolSelected.CostAUD);
    $(`#${formSelected}EstCostAud`).val(costVolSelected.EstimateCostAUD);
    $(`#${formSelected}EstSell`).val(costVolSelected.EstimateSell);
    $(`#${formSelected}Postage`).val(costVolSelected.Postage);
    $(`#${formSelected}Ext`).val(costVolSelected.ExtGP);
    showPopUpForm(formSelected, "Edit Cost & Volume");
  });

  //#endregion

  //#region Form Button
  $('button[name="saveForm"]').on("click", async function () {
    const FILE_VALUE = $(`#${formSelected}File`).val();
    const ID_VALUE = $(`#${formSelected}Id`).val();
    const COST_USD_VALUE = $(`#${formSelected}CostUsd`).val();
    const EST_COST_AUD_VALUE = $(`#${formSelected}EstCostAud`).val();
    const EST_SELL_VALUE = $(`#${formSelected}EstSell`).val();
    const POSTAGE_VALUE = $(`#${formSelected}Postage`).val();
    const EXT_GP_VALUE = $(`#${formSelected}Ext`).val();
    let changesMade = [];
    let isFormFilled = false;
    let incompleteMessage = "Please complete all non-optional fields";
    // validation on import
    if (formSelected == "import")
      isFormFilled = Boolean(ID_VALUE && COST_USD_VALUE && FILE_VALUE);
    // validation on edit
    else if (formSelected == "edit") {
      isFormFilled = Boolean(
        EST_COST_AUD_VALUE && EST_SELL_VALUE && POSTAGE_VALUE && EXT_GP_VALUE
      );
      incompleteMessage = "Please have all fields filled before saving";
    }
    // Successful Save
    if (!isFormFilled) {
      showAlert(`<strong>Error!</strong> ${incompleteMessage}.`);
      return;
    }

    // Import Form Save
    if (formSelected == "import") {
      let isEstCostAudEmpty = EST_COST_AUD_VALUE.trim().length == 0;
      let isEstSellEmtpy = EST_SELL_VALUE.trim().length == 0;
      let isPostageEmtpy = POSTAGE_VALUE.trim().length == 0;
      let isExtGpEmtpy = EXT_GP_VALUE.trim().length == 0;

      const SHEET_JSON = await readFileToJson("#importFile");

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

      let missingHeader = findMissingColumnHeader(SHEET_JSON[0], [
        ID_VALUE,
        COST_USD_VALUE,
        isEstCostAudEmpty ? null : EST_COST_AUD_VALUE,
        isEstSellEmtpy ? null : EST_SELL_VALUE,
        isPostageEmtpy ? null : POSTAGE_VALUE,
        isExtGpEmtpy ? null : EXT_GP_VALUE,
      ]);

      // Check if all headers from input are inside the file
      if (Boolean(missingHeader)) {
        showAlert(
          `<strong>Error!</strong> Column ${missingHeader} Header not found in file.`
        );
        return;
      }

      let errorMessage = [];
      let importCosVol = SHEET_JSON.map((row) => {
        // Check if all value that in the row has the correct format

        checkAndPushFloatError(row, COST_USD_VALUE, errorMessage);
        checkAndPushFloatError(row, EST_COST_AUD_VALUE, errorMessage);
        checkAndPushFloatError(row, EST_SELL_VALUE, errorMessage);
        checkAndPushFloatError(row, POSTAGE_VALUE, errorMessage);
        checkAndPushFloatError(row, EXT_GP_VALUE, errorMessage);

        // convert USD to AUD
        let convertedAud = parseFloat(
          calculateAUD("USD", parseFloat(row[COST_USD_VALUE]))
        ).toFixed(2);

        newObject = new CostVolume(
          row[ID_VALUE],
          parseFloat(row[COST_USD_VALUE]).toFixed(2),
          convertedAud,
          isEstCostAudEmpty
            ? 0
            : parseFloat(row[EST_COST_AUD_VALUE]).toFixed(2),
          isEstSellEmtpy ? 0 : parseFloat(row[EST_SELL_VALUE]).toFixed(2),
          isPostageEmtpy ? 0 : parseFloat(row[POSTAGE_VALUE]).toFixed(2),
          isExtGpEmtpy ? 0 : parseFloat(row[EXT_GP_VALUE]).toFixed(2)
        );

        // Store each new row locally
        changesMade.push(
          new Map([
            ["type", "new"],
            ["id", newObject.Id],
            ["table", "CostVolume"],
            ["changes", newObject],
          ])
        );
        return newObject;
      });

      // for testing purpose TO DO: DELETE
      productIdSelected = "test";
      if (errorMessage.length > 0) {
        showAlert(`<strong>ERROR!</strong> ${errorMessage.join(", ")}`);
        return;
      }

      // Find current product in import cost and volume list
      let foundCostVol = importCosVol.find(
        (obj) => obj.Id === productIdSelected
      );
      if (foundCostVol) {
        // Add data to table
        $.each(Object.keys(foundCostVol), function (i, val) {
          TABLE.find("tr").find("td").eq(i).text(foundCostVol[val]);
        });
        isEmptyData = false;
        costVolSelected = foundCostVol;
        $('button[name="editBtn"]').prop("disabled", false);
      }
    }
    // Edit Form Save
    else if (formSelected == "edit") {
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

  //#endregion
});
