$(document).ready(function () {
  const productTable_Column = 9;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_ProductTable_Row_Amount = 15;
  if (isEmptyData) {
    $("#productTable").append(
      getEmptyRow(default_ProductTable_Row_Amount, productTable_Column)
    );
  } else {
    let productTable_Data;
    //fill in table with the data

    if (productTable_Data < default_ProductTable_Row_Amount) {
      $("#productTable > tbody:last-child").append(
        getEmptyRow(
          default_ProductTable_Row_Amount - productTable_Data,
          productTable_Column
        )
      );
    }
  }

  $("#productTable").DataTable({
    responsive: true,
    pagingType: "full_numbers",
  });

  // searchbar logic
  const rows = $("#productTable tr");

  $("#idSearch").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    // filter data
    // remove rows from table
    // insert new filter data into table
  });
});
