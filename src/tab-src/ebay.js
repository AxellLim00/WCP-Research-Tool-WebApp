import DataTable from "datatables.net-dt";
import "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";
import {
  showAlert,
  showPopUpForm,
  hidePopUpForm,
  exitPopUpForm,
  hideLoadingScreen,
  showLoadingScreen,
} from "../utils/html-utils.js";
import {
  productSelectedChanged,
  getProductIdentifier,
  updateHasChanges,
  updateChanges,
  saveChanges,
} from "../utils/tab-utils.js";
import {
  fetchKTypeFromDatabase,
  fetchEpidFromDatabase,
} from "../utils/fetchSQL-utils.js";
import { createEmptyRow, exportDataTable } from "../utils/table-utils.js";
import socket from "../utils/socket-utils.js";

$(async function () {
  const defaultColumnAmount = 1;
  const defaultRowAmount = 10;
  const kTypeTableName = "#kTypeTable";
  const epidTableName = "#ePIDTable";
  const productDtoArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );

  const kTypeList = [];
  const ePIDList = [];
  let isKTypeEmpty = true;
  let isEpidEmpty = true;
  let formSelected;
  let itemSelected = { table: "", value: "" };
  let productIdSelected = sessionStorage.getItem("productIDSelected");
  let rowIndexSelected = -1;
  let productIdArray = getProductIdentifier(productDtoArray);

  //#region Initialization

  showLoadingScreen("Loading eBay Compatibility Table...");

  if (productIdSelected) {
    try {
      //Load table from Server-side
      // Fetch Key Type data from database
      const kTypeArray = await fetchKTypeFromDatabase(
        socket,
        productIdSelected
      );
      kTypeList.push(
        ...kTypeArray.map((item) => {
          return { item: item.KeyType };
        })
      );
      // Fetch ePID data from database
      const ePIDArray = await fetchEpidFromDatabase(socket, productIdSelected);
      ePIDList.push(
        ...ePIDArray.map((item) => {
          return { item: item.EPID };
        })
      );
    } catch {
      // Rejection handled in fetchKTypeFromDatabase and fetchEpidFromDatabase
      return;
    }
  }
  isKTypeEmpty = kTypeList.length == 0;
  isEpidEmpty = ePIDList.length == 0;
  if (isKTypeEmpty)
    $(kTypeTableName).append(
      createEmptyRow(defaultRowAmount, defaultColumnAmount)
    );
  if (isEpidEmpty)
    $(epidTableName).append(
      createEmptyRow(defaultRowAmount, defaultColumnAmount)
    );

  //#region Fill in textbox Datalist

  // Fill in ID search box
  $.each(productIdArray, function (_, item) {
    $("#productList").append($("<option>").attr("value", item).text(item));
  });

  //#endregion

  let tableOptions = {
    orderCellsTop: true,
    columns: [{ data: "item" }],
    stateSave: true,
    paging: true,
  };

  let kTypeTable = new DataTable(kTypeTableName, tableOptions);
  let ePIDTable = new DataTable(epidTableName, tableOptions);

  $(".dataTables_length").css("padding-bottom", "1%");

  // If List is not empty, fill in DataTable
  if (!isKTypeEmpty) kTypeTable.rows.add(kTypeList).draw();
  if (!isEpidEmpty) ePIDTable.rows.add(ePIDList).draw();

  $("#productSelected").val(productIdSelected);

  hideLoadingScreen();

  //#endregion

  //#region textbox event

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
    exportDataTable(
      "table",
      `${productIdSelected} - eBay Compatibility Table`,
      isEmptyData,
      ["K-Types", "ePIDs"]
    );
  });

  // New table Button
  $('button[name="newBtn"]').on("click", function () {
    formSelected = "new";
    $("#default").prop("checked", true);
    $("#newKTypeField").show();
    $("#newEPIDField").hide();
    showPopUpForm(formSelected, "New Item");
  });

  // Edit table Button
  $('button[name="editBtn"]').on("click", function () {
    formSelected = "edit";
    // Change text on label without changing other contents in label
    $("#editItemField")
      .contents()
      .filter(function () {
        return this.nodeType == 3;
      })
      .first()
      .replaceWith(itemSelected.table);
    $("#editItem").val(itemSelected.value);
    showPopUpForm(formSelected, `Edit ${itemSelected.table}`);
  });

  //#endregion

  //#region Row Click event

  // Click on K-Type table
  $(`${kTypeTableName} tbody`).on("click", "tr", function () {
    if (isKTypeEmpty) return;
    // Clear highlight of all row in DataTable
    itemSelected.table = "K-Type";
    itemSelected.value = Object.values(kTypeTable.row(this).data())[0];
    rowIndexSelected = kTypeTable.row(this).index();
    kTypeTable.rows().nodes().to$().css("background-color", "");
    ePIDTable.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });

  // Click on EPID table
  $(`${epidTableName} tbody`).on("click", "tr", function () {
    if (isEpidEmpty) return;
    // Clear highlight of all row in DataTable
    itemSelected.table = "EPID";
    itemSelected.value = Object.values(ePIDTable.row(this).data())[0];
    rowIndexSelected = ePIDTable.row(this).index();
    kTypeTable.rows().nodes().to$().css("background-color", "");
    ePIDTable.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });

  //#endregion

  //#region Form Event

  $('button[name="saveForm"]').on("click", async function () {
    const ITEM_CHOSEN_VALUE = $('input[name="newItem"]:checked').val();
    const K_TYPE_VALUE = $(`#${formSelected}KType`).val();
    const EPID_VALUE = $(`#${formSelected}EPID`).val();
    const EDIT_VALUE = $(`#${formSelected}Item`).val();
    let table;
    let changesMade = [];
    let isFormFilled = false;
    // validation on new
    if (formSelected == "new") {
      switch (ITEM_CHOSEN_VALUE) {
        case "K-Type":
          table = kTypeTable;
          isFormFilled = Boolean(K_TYPE_VALUE);
          break;
        case "EPID":
          table = ePIDTable;
          isFormFilled = Boolean(EPID_VALUE);
          break;
      }
    }
    // validation on edit
    else if (formSelected == "edit") {
      isFormFilled = Boolean(EDIT_VALUE);
      switch (itemSelected.table) {
        case "K-Type":
          table = kTypeTable;
          break;
        case "EPID":
          table = ePIDTable;
          break;
      }
    }

    // Successful Save
    if (!isFormFilled) {
      showAlert(
        `<strong>Error!</strong> Please complete all non-optional fields.`
      );
      return;
    }

    // New Form Save
    if (formSelected == "new") {
      let newItem = {};
      let tableDatabaseName;
      switch (ITEM_CHOSEN_VALUE) {
        case "K-Type":
          newItem.KType = K_TYPE_VALUE;
          tableDatabaseName = "KeyType";
          // Empty Table if DataTable previously was empty
          if (isKTypeEmpty) {
            isKTypeEmpty = false;
            kTypeTable.clear().draw();
          }
          break;

        case "EPID":
          newItem.EPID = EPID_VALUE;
          tableDatabaseName = "EPID";
          // Empty Table if DataTable previously was empty
          if (isEpidEmpty) {
            isEpidEmpty = false;
            ePIDTable.clear().draw();
          }
          break;
      }

      changesMade.push(
        new Map([
          ["type", "new"],
          ["id", productIdSelected],
          ["table", tableDatabaseName],
          ["changes", newItem],
        ])
      );
      // Add data to table
      table.row.add({ item: Object.values(newItem)[0] }).draw();
    }
    // Edit Form Save
    else if (formSelected == "edit") {
      let rowData = table.row(rowIndexSelected).data();
      let tableDatabaseName;
      let newUpdateValue;
      if (itemSelected.value != EDIT_VALUE)
        switch (itemSelected.table) {
          case "K-Type":
            rowData.item = newUpdateValue = EDIT_VALUE;
            tableDatabaseName = "KeyType";
            break;
          case "EPID":
            rowData.item = newUpdateValue = EDIT_VALUE;
            tableDatabaseName = "EPID";
            break;
        }

      // exit if no changes were made
      if (Object.keys(newUpdateValue).length === 0) {
        exitPopUpForm(formSelected);
        return;
      }
      changesMade.push(
        new Map([
          ["type", "edit"],
          ["id", productIdSelected],
          ["table", tableDatabaseName],
          ["oldValue", itemSelected.value],
          ["newValue", newUpdateValue],
        ])
      );
      itemSelected.value = EDIT_VALUE;
      // Redraw the table to reflect the changes
      table.row(rowIndexSelected).data(rowData).invalidate().draw();
    }
    // save changes in rows into sessionStorage
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

  $('input[name="newItem"]').on("click", function () {
    switch ($(this).val()) {
      case "K-Type":
        $("#newKTypeField").show();
        $("#newEPIDField").hide();
        break;
      case "EPID":
        $("#newKTypeField").hide();
        $("#newEPIDField").show();
        break;
    }
  });

  //#endregion
});
