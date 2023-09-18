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
});
