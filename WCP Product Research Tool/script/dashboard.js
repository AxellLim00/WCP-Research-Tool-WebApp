$(document).ready(function () {
  const userTable_Column = 2;
  const periodTable_Column = 4;

  //#region Setup Default Values
  // $("#teamAmount").text(~ insert text here ~);

  date = new Date();
  $("#dateTo").val(date.toLocaleDateString("en-CA"));
  date.setMonth(date.getMonth() - 1);
  $("#dateFrom").val(date.toLocaleDateString("en-CA"));

  //#endregion

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_Row_Amount = 10;
  if (isEmptyData) {
    $("#userResearchTable > tbody:last-child").append(
      getEmptyRow(default_Row_Amount, userTable_Column)
    );
    $("#periodResearchTable > tbody:last-child").append(
      getEmptyRow(default_Row_Amount, periodTable_Column)
    );
  } else {
    let userTable_Data, periodTable_Data;
    //fill in table with the data

    // $("#userResearchTable > tbody:last-child").append(
    // html here
    // );

    // $("#periodResearchTable > tbody:last-child").append(
    // html here
    // );
  }

  const userTable = new DataTable("#userResearchTable");
  const periodTable = new DataTable("#periodResearchTable");

  $(".dataTables_filter").css("padding-bottom", "20px");

  //#region Screen Button

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    const dateTo = $("#dateTo").val();
    const dateFrom = $("#dateFrom").val();
    $("#periodResearchTable").tableExport({
      type: "excel",
      fileName: `Product-User Research (${dateFrom} ~ ${dateTo})`,
      mso: {
        fileFormat: "xlsx",
      },
      ignoreRow: ["#searchRow"],
    });
  });

  //#endregion
});
