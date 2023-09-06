$(document).ready(function () {
  const userTable_Column = 2;
  const periodTable_Column = 4;

  // $("#teamAmount").text(~ insert text here ~);

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_UserTable_Row_Amount = 10;
  const default_PeriodTable_Row_Amount = 10;
  if (isEmptyData) {
    $("#userResearchTable > tbody:last-child").append(
      getEmptyRow(default_UserTable_Row_Amount, userTable_Column)
    );
    $("#periodResearchTable > tbody:last-child").append(
      getEmptyRow(default_PeriodTable_Row_Amount, periodTable_Column)
    );
  } else {
    let userTable_Data, periodTable_Data;
    //fill in table with the data

    if (userTable_Data < 15) {
      $("#user-research-table > tbody:last-child").append(
        getEmptyRow(15 - userTable_Data, userTable_Column)
      );
    }
    if (periodTable_Data < 12) {
      $("#period-research-table > tbody:last-child").append(
        getEmptyRow(12 - periodTable_Data, periodTable_Column)
      );
    }
  }
});
