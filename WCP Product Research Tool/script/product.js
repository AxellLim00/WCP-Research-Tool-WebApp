$(document).ready(function () {
  const productTable_Column = 9;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_UserTable_Row_Amount = 15;
  if (isEmptyData) {
    $("#productTable").append(
      getEmptyRow(default_UserTable_Row_Amount, productTable_Column)
    );
  }
});
