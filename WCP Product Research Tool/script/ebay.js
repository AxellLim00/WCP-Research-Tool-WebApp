$(document).ready(function () {
  const ebayTable_Column = 1;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_ebayTable_Row_Amount = 10;
  if (isEmptyData) {
    $("#kTypeTable").append(
      getEmptyRow(default_ebayTable_Row_Amount, ebayTable_Column)
    );
    $("#epIDTable").append(
      getEmptyRow(default_ebayTable_Row_Amount, ebayTable_Column)
    );
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

  const kTypeTable = new DataTable("#kTypeTable");
  const epIDTable = new DataTable("#epIDTable");

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
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    $("table").tableExport({
      type: "excel",
      fileName: `${productChosen} - eBay Compatibility Table`,
      mso: {
        fileFormat: "xlsx",
        worksheetName: ["K Types", "EPIDs"],
      },
    });
  });

  //#endregion
});
