import DataTable from "datatables.net-dt";
import "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";
import {
  showAlert,
  showPopUpForm,
  hidePopUpForm,
  exitPopUpForm,
  showLoadingScreen,
  hideLoadingScreen,
} from "../utils/html-utils.js";
import {
  productSelectedChanged,
  getProductIdentifier,
  updateHasChanges,
  updateChanges,
  saveChanges,
} from "../utils/tab-utils.js";
import {
  createEmptyRow,
  findMissingColumnHeader,
  exportDataTable,
  readFileToJson,
} from "../utils/table-utils.js";
import socket from "../utils/socket-utils.js";
import {
  fetchOemFromDatabase,
  fetchProductDetailFromDatabase,
} from "../utils/fetchSQL-utils.js";

$(async function () {
  const defaultVinColumnAmount = 1;
  const defaultOemColumnAmount = 2;
  const defaultRowAmount = 10;
  const vinTableName = "#vinTable";
  const oemTableName = "#oemTable";
  const isProductEditable = Boolean(
    sessionStorage.getItem("productIDSelected")
  );
  const vinList = [];
  const oemList = [];

  let formSelected;
  let isOemEmpty = true;
  let isVinEmpty = true;
  let productIdSelected = sessionStorage.getItem("productIDSelected");
  let rowIndexSelected = -1;
  let oemSelected = {};
  let estSalesChanges = false;
  let notesChanges = false;
  let productDtoArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );
  let productIdArray = getProductIdentifier(productDtoArray);
  // Temporary previous values variables
  let prevEstSales = "";
  let prevNote = "";

  // TODO: (Level: 2) Make all editable if product is from NewProduct

  //#region Initialization

  showLoadingScreen("Loading Stats...");
  // Fill in ID search box
  $.each(productIdArray, function (_, item) {
    $("#productList").append($("<option>").attr("value", item).text(item));
  });

  if (
    productIdSelected &&
    productIdSelected != "undefined" &&
    productIdSelected != "null"
  ) {
    let productSelectedDto;

    if (productIdSelected.slice(0, 2) == "R-") {
      // Filter existing ones with interchangeNumber, interchangeNumber and partTypeFriendlyName/partTypeCode
      productSelectedDto = productDtoArray.find(
        (x) => x.researchIdentifier == productIdSelected
      );
    } else {
      productSelectedDto = productDtoArray.find(
        (x) => x.productStockNumber == productIdSelected
      );
    }

    // Load vinList from ProductList
    const vinNumbers = productSelectedDto.vehicleIdentificationNumbers
      .split("\r")
      .filter(Boolean);
    vinList.push(...vinNumbers.map((vin) => ({ data: vin })));

    // load oemList from database
    try {
      const oemDatabaseArray = await fetchOemFromDatabase(
        socket,
        productIdSelected
      );
      if (oemDatabaseArray.length > 0) {
        oemList.push([
          ...oemDatabaseArray.map((dbObject) => ({
            data: dbObject.Oem,
            supplierNumber: dbObject.Supplier,
          })),
        ]);
      }
    } catch {
      // error is already shown and handled in fetchOemFromDatabase function
      return;
    }

    let productDetail;
    try {
      const productDetailArray = await fetchProductDetailFromDatabase(
        socket,
        productIdSelected
      );
      if (productDetailArray.length > 0) {
        productDetail = productDetailArray[0];
        prevEstSales = productDetail.EstSaleVol;
        prevNote = productDetail.Note;
      } else {
        showAlert(
          `<strong>Error!</strong> Product ID <i>${productIdSelected}</i> does not exist in database.`
        );
        return;
      }
    } catch {
      // error is already shown and handled in fetchProductDetailFromDatabase function
      return;
    }

    // Fill in text fields
    $("#requestValue").val(productSelectedDto.totalNumberOfRequests);
    $("#nfValue").val(productSelectedDto.totalNumberOfNotFoundRequests);
    $("#stdValue").val(productSelectedDto.averageConditionPrice);
    $("#salesValue").val(productSelectedDto.totalNumberOfRequests);
    // Put the value of EstSales if it exist, else put the value of totalNumberOfRequests
    $("#estSalesVolValue").val(
      productDetail.EstSales
        ? productDetail.EstSales
        : productSelectedDto.totalNumberOfRequests
    );
    $("#note").val(productDetail ? productDetail.Note : "");
  }

  isVinEmpty = vinList.length == 0;
  isOemEmpty = oemList.length == 0;
  console.log("isVinEmpty", isVinEmpty);
  console.log("length", vinList.length);
  console.log("isOemEmpty", isOemEmpty);
  console.log("length", oemList.length);
  // debugger;

  // Fill in Table if loading from API empty
  if (isVinEmpty)
    $(vinTableName).append(
      createEmptyRow(defaultRowAmount, defaultVinColumnAmount)
    );
  if (isOemEmpty)
    $(oemTableName).append(
      createEmptyRow(defaultRowAmount, defaultOemColumnAmount)
    );

  // Initialize DataTable
  const vinTableOptions = {
    columns: [{ data: "data" }],
    orderCellsTop: true,
    stateSave: true,
  };
  const oemTableOptions = {
    columns: [{ data: "data" }, { data: "supplierNumber" }],
    orderCellsTop: true,
    stateSave: true,
  };
  var vinTable = new DataTable(vinTableName, vinTableOptions);
  var oemTable = new DataTable(oemTableName, oemTableOptions);

  // Hide Supplier Number column
  const supplierNumberIndex = 1;
  oemTable.column(supplierNumberIndex).visible(false, false);
  oemTable.columns.adjust().draw(false);

  $(".dataTables_length").css("padding-bottom", "2%");

  // debugger;
  // If List is not empty, fill in DataTable
  if (!isVinEmpty) vinTable.rows.add(vinList).draw();
  if (!isOemEmpty) oemTable.rows.add(oemList).draw();
  // Write productIdSelected to #productSelected textbox
  $("#productSelected").val(productIdSelected);

  hideLoadingScreen();
  //#endregion

  //#region textbox event

  $("#estSalesVolValue").on("change", function () {
    estSalesChanges = $("#estSalesVolValue").val() != prevEstSales;
    updateHasChanges(estSalesChanges || notesChanges);
  });

  $("#note").on("change", function () {
    notesChanges = $("#note").val() != prevNote;
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

  // Save Button
  $('button[name="saveBtn"]').on("click", function () {
    // Get values from TextBoxes
    const EST_SALES_VOLUME_VALUE = $("#estSalesVolValue").val();
    const NOTES_VALUE = $("#note").val();
    let update = {};
    // Check if there are changes made to the textbox and update the changes
    if (EST_SALES_VOLUME_VALUE !== prevEstSales) {
      update.EstSaleVol = prevEstSales = EST_SALES_VOLUME_VALUE;
    }
    // Check if there are changes made to the textbox and update the changes
    if (NOTES_VALUE !== prevNote) {
      update.Note = prevNote = NOTES_VALUE;
    }

    if (!jQuery.isEmptyObject(update)) {
      updateChanges([
        new Map([
          ["type", "edit"],
          ["id", productIdSelected],
          ["table", "Product"],
          ["changes", update],
        ]),
      ]);
    }

    if (saveChanges(socket)) {
      updateHasChanges(false);
    }
  });

  // Import Button
  $('button[name="importBtn"]').on("click", function () {
    formSelected = "import";
    showPopUpForm(formSelected, "Import OEMs");
  });

  // Export Button
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
    $(`#${formSelected}Oem`).val(oemSelected.data);
    $(`#${formSelected}Number`).val(oemSelected.supplierNumber);
    showPopUpForm(formSelected, "Edit Product");
  });

  //#endregion

  //#region Row Click event

  $(`${oemTableName} tbody`).on("click", "tr", function () {
    if (isOemEmpty) return;
    // Clear highlight of all rows in DataTable
    oemTable.rows().nodes().to$().css("background-color", "");
    // Highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Assign row values to oemSelected object
    oemSelected = { ...Object.values(oemTable.row(this).data()) };
    rowIndexSelected = oemTable.row(this).index();
    if (isProductEditable)
      // Enable Edit button
      $('button[name="editBtn"]').prop("disabled", false);
  });

  //#endregion

  //#region Form Button

  $('button[name="saveForm"]').on("click", async function () {
    //check if mandatory field
    const fileVal = $(`#${formSelected}File`).val();
    const oemVal = $(`#${formSelected}Oem`).val();
    const supplierVal = $(`#${formSelected}Number`).val();
    let changesMade = [];
    let isFormFilled = Boolean(oemVal);

    if (formSelected == "import")
      isFormFilled &= Boolean(fileVal && supplierVal);

    // Successful Save
    if (!isFormFilled) {
      showAlert("<strong>Error!</strong> Please complete necessary fields.");
      return;
    }
    // Import Form Save
    if (formSelected == "import") {
      let sheetJson;
      sheetJson = await readFileToJson("#importFile", [oemVal, supplierVal]);

      let missingHeader = "";
      // If has errors from reading
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
        oemVal,
        supplierVal,
      ]);

      // Check if all headers from input are inside the file
      if (Boolean(missingHeader)) {
        showAlert(
          `<strong>Error!</strong> Column <i>${missingHeader}</i> Header not found in file.`
        );
        return;
      }

      const editChanges = [];
      const importOems = sheetJson.map(function (row) {
        const newObject = { Oem: row[oemVal], Supplier: row[supplierVal] };
        editChanges.push(newObject);
        return newObject;
      });

      changesMade.push(
        new Map([
          ["type", "newProduct"],
          ["id", productIdSelected],
          ["table", "Oem"],
          ["changes", editChanges],
        ])
      );

      // Add data to table
      if (isOemEmpty) {
        isOemEmpty = false;
        oemTable.clear().draw();
      }
      oemTable.rows.add(importOems).draw();
    }
    // Edit Form Save
    else if (formSelected == "edit") {
      let rowData = oemTable.row(rowIndexSelected).data();

      if (oemSelected.data != oemVal) {
        // Get all OEMs without special characters
        oemArray = oemTable
          .columns(0)
          .data()
          .toArray()[0]
          .map(function (item) {
            return String(item).replace(/[-_.,#~:;]]/g, "");
          });
        // Check if the number is the same as existing ones
        if (oemArray.includes(oemVal)) {
          showAlert(`<b>ERROR!</b> OEM Number <i>${oemVal}</i> already exist`);
          return;
        }
        rowData.data = oemVal;
      } else {
        // exit if no changes were made
        exitPopUpForm(formSelected);
        return;
      }

      changesMade.push(
        new Map([
          ["type", "edit"],
          ["id", productIdSelected],
          ["table", "Oem"],
          ["oldValue", oemSelected.data],
          ["newValue", oemVal],
        ])
      );
      // Redraw the table to reflect the changes
      oemTable.row(rowIndexSelected).data(rowData).invalidate().draw();
      oemSelected.data = oemVal;
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
