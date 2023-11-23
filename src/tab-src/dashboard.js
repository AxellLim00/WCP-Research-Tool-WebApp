import DataTable from "datatables.net-dt";
import dt_css from "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";
import { createEmptyRow } from "../utils/table-utils.js";

$(function () {
  const defaulClumnAmountUser = 2;
  const defaulColumnAmountPeriod = 4;
  const defaultRowAmount = 10;
  const userTableName = "#userResearchTable";
  const periodTableName = "#periodResearchTable";
  var isEmptyData = true;
  var dateTo = new Date();
  var dateFrom = new Date();
  dateFrom.setMonth(dateFrom.getMonth() - 1);

  //#region Setup Default Values
  // $("#teamAmount").text(~ insert text here ~);

  $("#dateTo").val(dateTo.toLocaleDateString("en-CA"));
  $("#dateFrom").val(dateFrom.toLocaleDateString("en-CA"));

  //#endregion

  //Load table from Server-side

  // if loading from Server-side empty
  if (isEmptyData) {
    $("#userResearchTable > tbody:last-child").append(
      createEmptyRow(defaultRowAmount, defaulClumnAmountUser)
    );
    $("#periodResearchTable > tbody:last-child").append(
      createEmptyRow(defaultRowAmount, defaulColumnAmountPeriod)
    );
  } else {
    let userTableData, periodTableData;
    //fill in table with the data

    // $("#userResearchTable > tbody:last-child").append(
    // html here
    // );

    // $("#periodResearchTable > tbody:last-child").append(
    // html here
    // );
  }
  const TABLE_USER = new DataTable(userTableName);
  const TABLE_PERIOD = new DataTable(periodTableName);

  $(".dataTables_filter").css("padding-bottom", "20px");

  //#region Screen Button

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    const DATE_TO_VAL = $("#dateTo").val();
    const DATE_FROM_VAL = $("#dateFrom").val();
    $(periodTableName).tableExport({
      type: "excel",
      fileName: `Product-User Research (${DATE_FROM_VAL} ~ ${DATE_TO_VAL})`,
      mso: {
        fileFormat: "xlsx",
      },
      ignoreRow: ["#searchRow"],
    });
  });

  //#endregion
});
