import DataTable from "datatables.net-dt";
import dt_css from "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";
import {
  showAlert,
  showPopUpForm,
  hidePopUpForm,
  exitPopUpForm,
} from "../utils/html-utils.js";

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
  var isOemEmpty = true;
  var isVinEmpty = true;
  var productIdSelected = sessionStorage.getItem("productIDSelected");
  var oemSelected = "";
  var estSalesChanges = false;
  var notesChanges = false;
  var productDtoArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );
  var productIdArray = getProductIdentifier(productDtoArray);
  // Temporary previous values variables
  var prevEstSales = "";
  var prevNote = "";

  //#region Initialization

  // Fill in ID search box
  $.each(productIdArray, function (_, item) {
    $("#productList").append($("<option>").attr("value", item).text(item));
  });

  //Load table from ProductList
  var vinList = [];
  var oemList = [];
  if (
    productIdSelected &&
    productIdSelected != "undefined" &&
    productIdSelected != "null"
  ) {
    let productSelectedDto = [];
    if (productIdSelected.slice(0, 2) == "R-") {
      // Filter existing ones with interchangeNumber, interchangeNumber and partTypeFriendlyName/partTypeCode
      productSelectedDto = productDtoArray.filter(
        (x) => x.researchIdentifier == productIdSelected
      );
    } else {
      productSelectedDto = productDtoArray.filter(
        (x) => x.productStockNumber == productIdSelected
      );
    }

    vinList = [
      // Remove duplicates
      ...new Set(
        productSelectedDto
          .map((obj) => obj.vehicleIdentificationNumbers)
          .map((str) => str.split("\r"))
          .flat()
      ),
      // Return Data Table format
    ].map((vin) => {
      return { data: vin };
    });

    console.log("VIN Table Data");
    console.log(vinList);

    // Fill in text fields
    $("#requestValue").val(productSelectedDto[0].totalNumberOfRequests);
    $("#nfValue").val(productSelectedDto[0].totalNumberOfNotFoundRequests);
    $("#stdValue").val(productSelectedDto[0].averageConditionPrice);
    $("#salesValue").val(productSelectedDto[0].totalNumberOfRequests);
    $("#estSalesVolValue").val(productSelectedDto[0].totalNumberOfRequests);
  }

  isVinEmpty = vinList.length == 0;
  isOemEmpty = oemList.length == 0;
  // Fill in Table if loading from API empty
  if (isVinEmpty)
    $(VIN_TABLE_NAME).append(getEmptyRow(ROW_AMOUNT_VIN, COLUMN_AMOUNT));
  if (isOemEmpty)
    $(OEM_TABLE_NAME).append(getEmptyRow(ROW_AMOUNT_OEM, COLUMN_AMOUNT));

  // initialize DataTable
  let tableOptions = {
    columns: [{ data: "data" }],
    orderCellsTop: true,
    stateSave: true,
  };
  var vinTable = new DataTable(VIN_TABLE_NAME, tableOptions);
  var oemTable = new DataTable(OEM_TABLE_NAME, tableOptions);

  $(".dataTables_length").css("padding-bottom", "2%");

  vinTable.rows.add(vinList).draw();
  $("#productSelected").val(productIdSelected);

  //#endregion

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
    // find changes in textboxes
    const EST_SALES_VOLUME_VALUE = $("#estSalesVolValue").val();
    const NOTES_VALUE = $("#note").val();
    let update = {};
    if (EST_SALES_VOLUME_VALUE != prevEstSales)
      update.estSaleVol = prevEstSales = EST_SALES_VOLUME_VALUE;

    if (NOTES_VALUE != prevNote) update.note = prevNote = NOTES_VALUE;

    if (!jQuery.isEmptyObject(update)) updateChanges(update);

    // on successful save to Server-side
    if (saveChanges()) {
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
      `${productIdSelected} - Stats Table`,
      isOemEmpty && isVinEmpty,
      ["VIN", "OEM"]
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
    if (isOemEmpty) return;
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
      sheetJson = await readFileToJson("#importFile", [OEM_VALUE]);

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
      if (isOemEmpty) {
        isOemEmpty = false;
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
