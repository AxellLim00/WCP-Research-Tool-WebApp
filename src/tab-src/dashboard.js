import DataTable from "datatables.net-dt";
import "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";
import { createEmptyRow } from "../utils/table-utils.js";
import {
  hideLoadingScreen,
  hidePopUpForm,
  showAlert,
  showLoadingScreen,
  showPopUpForm,
} from "../utils/html-utils.js";
import $ from "jquery";
import "../utils/tableExport-utils/tableExport.js";
import io from "socket.io-client";
import { saveChanges, updateChanges } from "../utils/tab-utils.js";
const socket = io();

$(async function () {
  const defaulClumnAmountUser = 2;
  const defaulColumnAmountPeriod = 4;
  const defaultRowAmount = 10;
  const userTableName = "#userResearchTable";
  const periodTableName = "#periodResearchTable";
  var isEmptyData = true;
  var dateTo = new Date();
  var dateFrom = new Date();
  dateFrom.setMonth(dateFrom.getMonth() - 1);
  var userTableData, periodTableData;

  //#region Setup Default Values
  // $("#teamAmount").text(~ insert text here ~);

  $("#dateTo").val(dateTo.toLocaleDateString("en-CA"));
  $("#dateFrom").val(dateFrom.toLocaleDateString("en-CA"));

  //#endregion

  //#region Initialization

  // Load table from Server-side ~ ackData -> Acknowledgement Data
  showLoadingScreen("Loading User Data...");
  userTableData = await fetchUserDataFromDatabase().catch((error) =>
    console.error(error)
  );
  periodTableData = await fetchPeriodDataFromDatabase().catch((error) =>
    console.error(error)
  );
  hideLoadingScreen();

  // if loading from Server-side empty
  if (!userTableData || jQuery.isEmptyObject(userTableData))
    $(userTableName + " > tbody:last-child").append(
      createEmptyRow(defaultRowAmount, defaulClumnAmountUser)
    );
  else {
    if (
      userTableData.some(
        (user) => user.UserID == sessionStorage.getItem("username")
      )
    ) {
      // Show team name form
    } else {
      Array.from(new Set(userTableData.map((user) => user.Team))).forEach(
        (team) =>
          $("#newTeamSelect").append(
            $("<option>").attr("value", team).text(team)
          )
      );
      showPopUpForm("new", "New User?");
    }
    // $(userTableName + ' > tbody:last-child').append(
    //   // HTML for user table data here
    // );
  }

  if (!periodTableData || jQuery.isEmptyObject(periodTableData))
    $(periodTableName + " > tbody:last-child").append(
      createEmptyRow(defaultRowAmount, defaulColumnAmountPeriod)
    );
  else {
    // $(periodTableName + ' > tbody:last-child').append(
    //   // HTML for period table data here
    // );
  }

  const TABLE_USER = new DataTable(userTableName, {
    orderCellsTop: true,
    columns: [{ data: "UserID" }, { data: "ProductCount" }],
  });

  const TABLE_PERIOD = new DataTable(periodTableName, {
    orderCellsTop: true,
    columns: [
      { data: "UserID" },
      { data: "Type" },
      { data: "Num" },
      { data: "Desc" },
    ],
  });

  $(".dataTables_filter").css("padding-bottom", "20px");

  //#endregion

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

  //#region Form Logic

  $("#isNewTeam").on("change", function () {
    if ($("#isNewTeam").is(":checked")) {
      $("#newTeamSelect").hide();
      $("#newTeamText").show();
    } else {
      $("#newTeamSelect").show();
      $("#newTeamText").hide();
    }
  });

  $('button[name="saveForm"]').on("click", async function () {
    const teamSelect = $(`#newTeamSelect`).val();
    const teamText = $(`#newTeamText`).text();
    // If any team input is empty
    if (!(teamSelect || teamText)) {
      showAlert("Please select a team for yourself.");
      return;
    }
    const team = $("#isNewTeam").is(":checked") ? teamText : teamSelect;
    console.log(team);

    let newUser = {
      UserID: sessionStorage.getItem("username"),
      Team: team,
    };
    console.log(newUser);
    updateChanges([
      new Map([
        ["type", "new"],
        ["table", "Users"],
        ["changes", [newUser]],
      ]),
    ]);
    saveChanges();
    hidePopUpForm();
  });

  //#endregion
});

async function fetchUserDataFromDatabase() {
  return new Promise((resolve, reject) => {
    socket.emit("get object database", "Users", "", (ackData) => {
      if (ackData.status === "OK") {
        resolve(ackData.result);
      } else {
        console.log(
          `Error Occurred on getting User data from Database: ${ackData.error.code}: ${ackData.error.name}`
        );
        showAlert(
          `Error Occurred on getting User data from Database: ${ackData.error.code}: ${ackData.error.name}`
        );
        reject(ackData.error);
      }
    });
  });
}

async function fetchPeriodDataFromDatabase() {
  return new Promise((resolve, reject) => {
    socket.emit("get object database", "Product", "", (ackData) => {
      if (ackData.status === "OK") {
        resolve(ackData.result);
      } else {
        console.log(
          `Error Occurred on getting Period data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        showAlert(
          `Error Occurred on getting Period data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        reject(ackData.error);
      }
    });
  });
}
