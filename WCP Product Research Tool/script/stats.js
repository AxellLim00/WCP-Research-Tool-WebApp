$(document).ready(function () {
  const statsTable_Column = 1;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_VinTable_Row_Amount = 10;
  const default_OemTable_Row_Amount = 10;
  if (isEmptyData) {
    $("#vinTable").append(
      getEmptyRow(default_VinTable_Row_Amount, statsTable_Column)
    );
    $("#oemTable").append(
      getEmptyRow(default_OemTable_Row_Amount, statsTable_Column)
    );
  } else {
    let vinNumberTable_Data, oemTable_Data;
    //fill in table with the data

    // $("#vinTable > tbody:last-child").append(
    // html here
    // );
    // $("#oemTable > tbody:last-child").append(
    // html here
    // );
  }

  const vinTable = new DataTable("#vinTable", {
    orderCellsTop: true,
  });
  const oemTable = new DataTable("#oemTable", {
    orderCellsTop: true,
  });
  $(".dataTables_length").css("padding-bottom", "2%");

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
});
