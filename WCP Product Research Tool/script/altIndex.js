$(document).ready(function () {
  const altIndexTable_Column = 10;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_AltIndexTable_Row_Amount = 10;
  if (isEmptyData) {
    $("#altIndexTable").append(
      getEmptyRow(default_AltIndexTable_Row_Amount, altIndexTable_Column)
    );
  } else {
    let altIndexTable_Data;

    // fill in table with the data
    // $("#altIndexTable > tbody:last-child").append(
    // html here
    // );
  }

  const table = new DataTable("#altIndexTable", {
    orderCellsTop: true,
  });

  $("#altIndexTable_filter").remove();
  $(".dataTables_length").css("padding-bottom", "1%");
});
