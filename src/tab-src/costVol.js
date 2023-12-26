import {
  showAlert,
  showPopUpForm,
  hidePopUpForm,
  exitPopUpForm,
  showLoadingScreen,
  hideLoadingScreen,
} from "../utils/html-utils.js";
import { CostVolumeDto } from "../utils/class/dataTableDto.js";
import {
  productSelectedChanged,
  calculateAUD,
  isFloatValue,
  getProductIdentifier,
  updateObject,
  updateHasChanges,
  updateChanges,
  saveChanges,
  isFloat,
  getCurrencyRates,
  getProductFromID,
  getProductIDAlias,
} from "../utils/tab-utils.js";
import {
  findMissingColumnHeader,
  readFileToJson,
} from "../utils/table-utils.js";
import $ from "jquery";
import "../utils/tableExport-utils/tableExport.js";
// import socket from "../utils/socket-utils.js";
import { fetchProductDetailFromDatabase } from "../utils/fetchSQL-utils.js";

$(async function () {
  const tableName = "#costVolTable";
  const $table = $("#costVolTable");
  const productRequestArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );
  const productIdArray = getProductIdentifier(productRequestArray);
  const socket = window.socket;
  let formSelected;
  let isTableEmpty = true;
  let productIdSelected = sessionStorage.getItem("productIDSelected");
  let costVolSelected = new CostVolumeDto();
  let productData;
  let productIdAlias;

  //#region Initialization

  showLoadingScreen("Loading Cost & Volume Table...");

  try {
    // Get Currency Rates from API if empty
    await getCurrencyRates(socket);
  } catch (error) {
    showAlert(error.message);
    return;
  }

  //Load table from API
  if (productIdSelected) {
    productData = getProductFromID(productIdSelected, productRequestArray);
    productIdAlias = getProductIDAlias(productData, productRequestArray);
    costVolSelected.Id = productData.researchIdentifier
      ? productData.researchIdentifier
      : "No Research ID Assigned";

    // Fetch Product Detail from Database
    try {
      let productDetail = await fetchProductDetailFromDatabase(
        socket,
        productIdSelected
      );
      if (productDetail.length > 0) {
        productDetail = productDetail[0];
        if (productDetail.CostUsd) {
          costVolSelected.CostUSD = productDetail.CostUsd;
          costVolSelected.CostAUD = calculateAUD("USD", productDetail.CostUsd);
        } else {
          costVolSelected.CostUSD = 0;
          costVolSelected.CostAUD = 0;
        }
        costVolSelected.EstimateCostAUD = productDetail.EstCostAud ?? 0;
        costVolSelected.EstimateSell = productDetail.EstSell ?? 0;
        costVolSelected.Postage = productDetail.Postage ?? 0;
        costVolSelected.ExtGP = productDetail.ExtGp ?? 0;
      }
    } catch {
      // Error already handled in fetchProductDetailFromDatabase
      return;
    }
  }

  //#region Fill in textbox Datalist

  // Fill in ID search box
  $.each(productIdArray, function (_, item) {
    $("#productList").append($("<option>").attr("value", item).text(item));
  });

  //#endregion

  // if loading from API/Server-side empty
  isTableEmpty = !Boolean(productData);
  if (isTableEmpty) {
    $('tr[name="values"]').children().text("-");
    $('button[name="editBtn"]').prop("disabled", true);
  } else {
    $.each(Object.keys(costVolSelected), function (i, val) {
      $table.find("tr").find("td").eq(i).text(costVolSelected[val]);
    });
  }

  $("#productSelected").val(productIdSelected);

  hideLoadingScreen();

  //#endregion

  //#region TextBox event

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
    // on successful save to Server-side
    if (saveChanges(socket)) {
      updateHasChanges(false);
    }
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (isTableEmpty) {
      showAlert("<strong>Error!</strong> No data found in table.");
    } else {
      $(tableName).tableExport({
        type: "excel",
        fileName: `${productIdSelected} - Cost & Volume Table`,
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

  //#region Form Event
  $('button[name="saveForm"]').on("click", async function () {
    const fileVal = $(`#${formSelected}File`).val();
    const idVal = $(`#${formSelected}Id`).val();
    const costUsdVal = $(`#${formSelected}CostUsd`).val();
    const estCostAudVal = $(`#${formSelected}EstCostAud`).val();
    const estSellVal = $(`#${formSelected}EstSell`).val();
    const postageVal = $(`#${formSelected}Postage`).val();
    const extGPVal = $(`#${formSelected}Ext`).val();
    let changesMade = [];
    let isFormFilled = false;
    let incompleteMessage = "Please complete all non-optional fields";
    // validation on import
    if (formSelected === "import")
      isFormFilled = Boolean(idVal && costUsdVal && fileVal);
    // validation on edit
    else if (formSelected === "edit") {
      isFormFilled = Boolean(
        estCostAudVal && estSellVal && postageVal && extGPVal
      );
      incompleteMessage = "Please have all fields filled before saving";
    }
    // Successful Save
    if (!isFormFilled) {
      showAlert(`<strong>Error!</strong> ${incompleteMessage}.`);
      return;
    }

    // Import Form Save
    if (formSelected === "import") {
      let isEstCostAudEmpty = estCostAudVal.trim().length === 0;
      let isEstSellEmpty = estSellVal.trim().length === 0;
      let isPostageEmpty = postageVal.trim().length === 0;
      let isExtGpEmpty = extGPVal.trim().length === 0;
      let columnHeaders = [
        idVal,
        costUsdVal,
        estCostAudVal,
        estSellVal,
        postageVal,
        extGPVal,
      ];
      columnHeaders.filter((n) => n);
      const SHEET_JSON = await readFileToJson("#importFile", columnHeaders);

      // Check if file is empty or blank
      if (SHEET_JSON === undefined || SHEET_JSON.length === 0) {
        showAlert(
          `<strong>Error!</strong> <i>${$("input[type=file]")
            .val()
            .split("\\")
            .pop()}</i> File is empty or blank.`
        );
        return;
      }

      let missingHeader = findMissingColumnHeader(SHEET_JSON[0], [
        idVal,
        costUsdVal,
        isEstCostAudEmpty ? null : estCostAudVal,
        isEstSellEmpty ? null : estSellVal,
        isPostageEmpty ? null : postageVal,
        isExtGpEmpty ? null : extGPVal,
      ]);

      // Check if all headers from input are inside the file
      if (Boolean(missingHeader)) {
        showAlert(
          `<strong>Error!</strong> Column <i>${missingHeader}</i> Header not found in file.`
        );
        return;
      }

      let errorMessage = [];
      let importCosVol = SHEET_JSON.map((row) => {
        // Check if all value that in the row has the correct format

        isFloatValue(row, costUsdVal, errorMessage);
        isFloatValue(row, estCostAudVal, errorMessage);
        isFloatValue(row, estSellVal, errorMessage);
        isFloatValue(row, postageVal, errorMessage);
        isFloatValue(row, extGPVal, errorMessage);

        // convert USD to AUD
        let convertedAud = parseFloat(
          calculateAUD("USD", parseFloat(row[costUsdVal]))
        ).toFixed(2);

        const newObject = new CostVolumeDto(
          row[idVal],
          parseFloat(row[costUsdVal]).toFixed(2),
          convertedAud,
          isEstCostAudEmpty ? 0 : parseFloat(row[estCostAudVal]).toFixed(2),
          isEstSellEmpty ? 0 : parseFloat(row[estSellVal]).toFixed(2),
          isPostageEmpty ? 0 : parseFloat(row[postageVal]).toFixed(2),
          isExtGpEmpty ? 0 : parseFloat(row[extGPVal]).toFixed(2)
        );

        // Store each new row locally
        changesMade.push(
          new Map([
            ["type", "edit"],
            ["id", newObject.Id],
            ["table", "Product"],
            ["changes", newObject],
          ])
        );
        return newObject;
      });

      if (errorMessage.length) {
        showAlert(`<strong>ERROR!</strong> ${errorMessage.join(".\n")}`);
        return;
      }

      // Find current product in import cost and volume list
      let foundCostVol = importCosVol.find(
        (obj) => obj.Id == productIdSelected || obj.Id == productIdAlias
      );
      if (foundCostVol) {
        // Add data to table
        $.each(Object.keys(foundCostVol), function (i, val) {
          $table.find("tr").find("td").eq(i).text(foundCostVol[val]);
        });
        isTableEmpty = false;
        costVolSelected = foundCostVol;
        $('button[name="editBtn"]').prop("disabled", false);
      }
    }
    // Edit Form Save
    else if (formSelected === "edit") {
      // Check if all inputs are numbers or in float format.
      if (
        !(
          isFloat(estCostAudVal) &&
          isFloat(estSellVal) &&
          isFloat(postageVal) &&
          isFloat(extGPVal)
        )
      ) {
        showAlert(
          "<strong>Error!</strong> Please have all fields filled with the correct format."
        );
        return;
      }
      // Save if there are any changes compared to old value (can be found in costVolSelected)
      const newUpdate = {};
      const costAud = parseFloat(estCostAudVal).toFixed(2);
      if (costVolSelected.EstimateCostAUD != costAud)
        newUpdate.EstimateCostAUD = costAud;

      const sell = parseFloat(estSellVal).toFixed(2);
      if (costVolSelected.EstimateSell != sell) newUpdate.EstimateSell = sell;

      const post = parseFloat(postageVal).toFixed(2);
      if (costVolSelected.Postage != post) newUpdate.Postage = post;

      const extGP = parseFloat(extGPVal).toFixed(2);
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
          ["table", "Product"],
          ["changes", newUpdate],
        ])
      );
      costVolSelected = updateObject(costVolSelected, newUpdate);
      $.each(Object.keys(costVolSelected), function (i, val) {
        $table.find("tr").find("td").eq(i).text(costVolSelected[val]);
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
