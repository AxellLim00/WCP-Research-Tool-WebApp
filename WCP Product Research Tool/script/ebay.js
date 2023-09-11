$(document).ready(function () {
    const ebayTable_Column = 1;

    //Load table from SQL

    // if loading from SQL empty
    var isEmptyData = true;

    const default_ebayTable_Row_Amount = 20;
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

      if (kTypeTable_Data < default_ebayTable_Row_Amount) {
        $("#kTypeTable > tbody:last-child").append(
          getEmptyRow(
            default_ebayTable_Row_Amount - kTypeTable_Data,
            ebayTable_Column
          )
        );
      }
      if (epIDTable_Data < default_ebayTable_Row_Amount) {
        $("#epIDTable > tbody:last-child").append(
          getEmptyRow(
            default_OemTable_Row_Amount - epIDTable_Data,
            ebayTable_Column
          )
        );
      }
    }
});
