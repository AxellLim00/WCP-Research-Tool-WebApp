$(document).ready(function () {
  const altIndexTable_Column = 10;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_AltIndexTable_Row_Amount = 20;
  if (isEmptyData) {
    $("#altIndexTable").append(
      getEmptyRow(default_AltIndexTable_Row_Amount, altIndexTable_Column)
    );
  } else {
    let altIndexTable_Data;
    //fill in table with the data

    if (altIndexTable_Data < default_AltIndexTable_Row_Amount) {
      $("#altIndexTable > tbody:last-child").append(
        getEmptyRow(
          default_AltIndexTable_Row_Amount - altIndexTable_Data,
          altIndexTable_Column
        )
      );
    }
  }
});
