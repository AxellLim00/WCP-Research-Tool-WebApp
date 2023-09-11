$(document).ready(function () {
  const statsTable_Column = 1;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_VinTable_Row_Amount = 23;
  const default_OemTable_Row_Amount = 15;
  if (isEmptyData) {
    $("#vinNumberTable").append(
      getEmptyRow(default_VinTable_Row_Amount, statsTable_Column)
    );
    $("#oemTable").append(
      getEmptyRow(default_OemTable_Row_Amount, statsTable_Column)
    );
  } else {
    let vinNumberTable_Data, oemTable_Data;
    //fill in table with the data

    if (vinNumberTable_Data < default_VinTable_Row_Amount) {
      $("#vinNumberTable > tbody:last-child").append(
        getEmptyRow(
          default_VinTable_Row_Amount - vinNumberTable_Data,
          statsTable_Column
        )
      );
    }
    if (oemTable_Data < default_OemTable_Row_Amount) {
      $("#oemTable > tbody:last-child").append(
        getEmptyRow(
          default_OemTable_Row_Amount - oemTable_Data,
          statsTable_Column
        )
      );
    }
  }
});
