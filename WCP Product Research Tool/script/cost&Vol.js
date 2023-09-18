$(document).ready(function () {
  const costVolTable_Col = 7;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_Row_Amount = 5;
  if (isEmptyData) {
    $("#costVolTable").append(
      getEmptyRow(default_Row_Amount, costVolTable_Col)
    );
  } else {
    let costVolTable_Data;
    //fill in table with the data

    // $("#productTable > tbody:last-child").append(
    // html here
    // );
  }

  // const table = new DataTable("#costVolTable");
  // $(".dataTables_length").css("padding-bottom", "1%");
});
