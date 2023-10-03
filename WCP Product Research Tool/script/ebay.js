$(function () {
  const COLUMN_AMOUNT = 1;
  const ROW_AMOUNT = 10;
  const K_TYPE_TABLE_NAME = "#kTypeTable";
  const EPID_TABLE_NAME = "#epIDTable";
  var isEmptyData = true;
  var productChosen = sessionStorage.getItem("productChosen");
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
  $("#productSelected").val(productChosen);

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    // find changes
    // save changes to SQL
    editHasChanges(false);
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (isEmptyData) {
      showAlert("<strong>Error!</strong> No data found in table.");
    } else {
      $("table").tableExport({
        type: "excel",
        fileName: `${productChosen} - eBay Compatibility Table`,
        mso: {
          fileFormat: "xlsx",
          worksheetName: ["K Types", "EPIDs"],
        },
      });
    }
  });

  // TO DO: make new button to add new rows to either K types or EPIDs

  //#endregion
});
