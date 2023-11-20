import DataTable from "datatables.net-dt";
import dt_css from "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";

import { showAlert } from "../utils/html-utils.js";

$(function () {
  const COLUMN_AMOUNT_USER = 2;
  const COLUMN_AMOUNT_PERIOD = 4;
  const ROW_AMOUNT = 10;
  const TABLE_USER_NAME = "#userResearchTable";
  const TABLE_PERIOD_NAME = "#periodResearchTable";
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
      getEmptyRow(ROW_AMOUNT, COLUMN_AMOUNT_USER)
    );
    $("#periodResearchTable > tbody:last-child").append(
      getEmptyRow(ROW_AMOUNT, COLUMN_AMOUNT_PERIOD)
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
  showAlert("Testing Alert Here");
  const TABLE_USER = new DataTable(TABLE_USER_NAME);
  const TABLE_PERIOD = new DataTable(TABLE_PERIOD_NAME);

  $(".dataTables_filter").css("padding-bottom", "20px");

  //#region Screen Button

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    const DATE_TO_VAL = $("#dateTo").val();
    const DATE_FROM_VAL = $("#dateFrom").val();
    $(TABLE_PERIOD_NAME).tableExport({
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
