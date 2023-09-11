$(document).ready(function () {
  const costVolTable_Row = 7;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_costVolTable_Column_Amount = 1;
  if (isEmptyData) {
    $("#costVolTable tbody tr").each((tr_idx, tr) => {
      $(tr).append($("<td>"));
    });
  } else {
    let costVolTable_Data;
    //fill in table with the data
  }
});
