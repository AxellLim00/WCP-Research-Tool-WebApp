$(function () {
  const COLUMN_AMOUNT = 1;
  const ROW_AMOUNT = 10;
  const K_TYPE_TABLE_NAME = "#kTypeTable";
  const EPID_TABLE_NAME = "#epIDTable";
  var isEmptyData = true;
  var itemSelected = { table: "", value: "" };
  var productIdSelected = sessionStorage.getItem("productIDSelected");
  var productDtoArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );
  var productIdArray = getProductIdentifier(productDtoArray);
  //Load table from API/Server-side

  // if loading is empty
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

  var kTypeTable = new DataTable(K_TYPE_TABLE_NAME, tableOptions);
  var epIDTable = new DataTable(EPID_TABLE_NAME, tableOptions);

  $(".dataTables_length").css("padding-bottom", "1%");

  $("#productSelected").val(productIdSelected);

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
    if (saveChanges()) {
      updateHasChanges(false);
    }
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    exportDataTable(
      "table",
      `${productIdSelected} - eBay Compatibility Table`,
      isEmptyData,
      ["K-Types", "EPIDs"]
    );
  });

  // New table Button
  $('button[name="newBtn"]').on("click", function () {
    formSelected = "new";
    $("#default").prop("checked", true);
    $("#newKtypeField").show();
    $("#newEpIdField").hide();
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
  $(`${K_TYPE_TABLE_NAME} tbody`).on("click", "tr", function () {
    if (isEmptyData) return;
    // Clear highlight of all row in Datatable
    itemSelected.table = "K-Type";
    itemSelected.value = Object.values(kTypeTable.row(this).data())[0];
    kTypeTable.rows().nodes().to$().css("background-color", "");
    epIDTable.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });

  // Click on EPID table
  $(`${EPID_TABLE_NAME} tbody`).on("click", "tr", function () {
    if (isEmptyData) return;
    // Clear highlight of all row in Datatable
    itemSelected.table = "EPID";
    itemSelected.value = Object.values(epIDTable.row(this).data())[0];
    kTypeTable.rows().nodes().to$().css("background-color", "");
    epIDTable.rows().nodes().to$().css("background-color", "");
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
    const EPID_VALUE = $(`#${formSelected}EpId`).val();
    const EDIT_VALUE = $(`#${formSelected}Item`).val();
    var table;
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
          table = epIDTable;
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
          table = epIDTable;
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

      switch (ITEM_CHOSEN_VALUE) {
        case "K-Type":
          newItem.item = K_TYPE_VALUE;
          break;
        case "EPID":
          newItem.item = EPID_VALUE;
          break;
      }

      // Empty Table if DataTable previosly was empty
      if (isEmptyData) {
        isEmptyData = false;
        kTypeTable.clear().draw();
        epIDTable.clear().draw();
      }

      changesMade.push(
        new Map([
          ["type", "new"],
          ["id", productIdSelected],
          ["table", "Ebay"],
          ["changes", newItem],
        ])
      );
      // Add data to table
      table.row.add(newItem).draw();
    }
    // Edit Form Save
    else if (formSelected == "edit") {
      let row = -1;
      let rowData = table
        .rows((idx, data) => {
          if (data.item === itemSelected.value) {
            row = idx;
            return;
          }
        })
        .data();
      newUpdate = {};
      if (itemSelected.value != EDIT_VALUE)
        switch (itemSelected.table) {
          case "K-Type":
            rowData.item = newUpdate.KType = EDIT_VALUE;
            break;
          case "EPID":
            rowData.item = newUpdate.EpId = EDIT_VALUE;
            break;
        }

      // exit if no changes were made
      if (Object.keys(newUpdate).length === 0) {
        exitPopUpForm(formSelected);
        return;
      }
      changesMade.push(
        new Map([
          ["type", "edit"],
          ["id", productIdSelected],
          ["table", "Ebay"],
          ["changes", newUpdate],
        ])
      );
      itemSelected.value = EDIT_VALUE;
      // Redraw the table to reflect the changes
      table.row(row).data(rowData).invalidate();
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
        $("#newKtypeField").show();
        $("#newEpIdField").hide();
        break;
      case "EPID":
        $("#newKtypeField").hide();
        $("#newEpIdField").show();
        break;
    }
  });

  //#endregion
});
