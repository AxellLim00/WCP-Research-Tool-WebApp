$(function () {
  const COLUMN_AMOUNT = 1;
  const ROW_AMOUNT = 10;
  const K_TYPE_TABLE_NAME = "#kTypeTable";
  const EPID_TABLE_NAME = "#epIDTable";
  var isEmptyData = true;
  var productIdSelected = sessionStorage.getItem("productIDSelected");
  var itemSelected = { table: "", value: "" };
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
    columns: [{ data: "KType" }],
    stateSave: true,
  });
  const EPID_TABLE = new DataTable(EPID_TABLE_NAME, {
    orderCellsTop: true,
    columns: [{ data: "EpId" }],
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

  // New table Button
  $('button[name="newBtn"]').on("click", function () {
    formSelected = "new";
    $("#default").prop("checked", true);
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
    itemSelected.value = Object.values(K_TYPE_TABLE.row(this).data());
    K_TYPE_TABLE.rows().nodes().to$().css("background-color", "");
    EPID_TABLE.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Assign row to productSelected
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });

  // Click on EPID table
  $(`${EPID_TABLE_NAME} tbody`).on("click", "tr", function () {
    if (isEmptyData) return;
    // Clear highlight of all row in Datatable
    itemSelected.table = "EPID";
    itemSelected.value = Object.values(EPID_TABLE.row(this).data());
    K_TYPE_TABLE.rows().nodes().to$().css("background-color", "");
    EPID_TABLE.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Assign row to productSelected
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });

  //#endregion

  //#region Form Event

  $('button[name="saveForm"]').on("click", async function () {
    const ITEM_CHOSEN_VALUE = $('input[name="newItem"]:checked').val();
    const K_TYPE_VALUE = $(`#${formSelected}KType`).val();
    const EPID_VALUE = $(`#${formSelected}EpId`).val();
    var table;
    let changesMade = [];
    let isFormFilled = false;
    // validation on new
    if (formSelected == "new") {
      switch (ITEM_CHOSEN_VALUE) {
        case "K-Type":
          table = K_TYPE_TABLE;
          isFormFilled = Boolean(K_TYPE_VALUE);
          break;
        case "EPID":
          table = EPID_TABLE;
          isFormFilled = Boolean(EPID_VALUE);
          break;
      }
    } else if (formSelected == "edit") {
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
          newItem.KType = K_TYPE_VALUE;
          break;
        case "EPID":
          newItem.EpId = EPID_VALUE;
          break;
      }

      // Empty Table if DataTable previosly was empty
      if (isEmptyData) {
        isEmptyData = false;
        K_TYPE_TABLE.clear().draw();
        EPID_TABLE.clear().draw();
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

// TO DO: Edit item logic
