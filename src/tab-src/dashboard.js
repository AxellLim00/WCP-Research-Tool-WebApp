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
import { exportDataTable } from "../utils/table-utils.js";
import {
  saveChanges,
  updateChanges,
  updateProductRequestHistory,
} from "../utils/tab-utils.js";
import {
  fetchUserDataFromDatabase,
  fetchProductDataFromDatabase,
} from "../utils/fetchSQL-utils.js";
import socket from "../utils/socket-utils.js";

$(async function () {
  const defaultColumnAmountUser = 2;
  const defaultColumnAmountPeriod = 4;
  const defaultRowAmount = 10;
  const userTableName = "#userResearchTable";
  const periodTableName = "#periodResearchTable";
  let dateTo = new Date();
  let dateFrom = new Date();
  dateFrom.setMonth(dateFrom.getMonth() - 1);
  let userTableData = [],
    periodTableData = [];

  //#region Initialization

  showLoadingScreen("Loading User Data...");

  // Load table from Server-side ~ ackData -> Acknowledgement Data
  try {
    userTableData = await fetchUserDataFromDatabase(socket);
  } catch {
    // Error handled in fetchUserDataFromDatabase function
    return;
  }

  try {
    periodTableData = await fetchProductDataFromDatabase(socket);
  } catch {
    // Error handled in fetchPeriodDataFromDatabase function
    return;
  }

  // if loading from Server-side empty
  if (!userTableData || jQuery.isEmptyObject(userTableData))
    $(userTableName + " > tbody:last-child").append(
      createEmptyRow(defaultRowAmount, defaultColumnAmountUser)
    );
  else {
    const currentUser = userTableData.find(
      (user) => user.UserID == sessionStorage.getItem("username")
    );
    if (currentUser) fillDashboardTexts(currentUser, userTableData);
    else {
      Array.from(new Set(userTableData.map((user) => user.Team))).forEach(
        (team) =>
          $("#newTeamSelect").append(
            $("<option>").attr("value", team).text(team)
          )
      );
      showPopUpForm("new", "New User?");
    }
  }

  if (!periodTableData || jQuery.isEmptyObject(periodTableData.Product)) {
    $(periodTableName + " > tbody:last-child").append(
      createEmptyRow(defaultRowAmount, defaultColumnAmountPeriod)
    );
  } else {
    // Put New Products into Product Request History
    updateProductRequestHistory(
      periodTableData.NewProduct,
      periodTableData.Product
    );

    let productHistoryData = JSON.parse(
      sessionStorage.getItem("productRequestHistory")
    );

    productHistoryData = productHistoryData.filter(
      (productHistory) =>
        !productHistory.productStockNumber || productHistory.researchIdentifier
    );

    // TODO: (Do this last) Filter out Product that has product-research-tool as its User
    periodTableData.Product = periodTableData.Product.filter(
      (product) => !product.SKU || product.ResearchID
    );

    periodTableData = periodTableData.Product.map((product) => {
      let matchProductDetail = productHistoryData.find(
        (productDetail) =>
          productDetail.researchIdentifier == product.ResearchID ||
          `${productDetail.interchangeNumber.trim()}${
            productDetail.interchangeVersion
          }${productDetail.partTypeCode}` == product.ResearchID.split("-")[1]
      );
      if (!matchProductDetail) {
        console.log(product);
        return {
          UserID: product.UserID,
          Type: "",
          Num: "",
          Desc: "",
          LastUpdate: product.LastUpdate,
        };
      }
      return {
        UserID: product.UserID,
        Type: matchProductDetail.partTypeFriendlyName,
        Num: `${matchProductDetail.interchangeNumber.trim()}${
          matchProductDetail.interchangeVersion
        }`,
        Desc: matchProductDetail.interchangeDescriptions,
        LastUpdate: product.LastUpdate,
      };
    });
  }

  const tableUser = new DataTable(userTableName, {
    orderCellsTop: true,
    columns: [{ data: "UserID" }, { data: "ProductCount" }],
  });
  tableUser.rows.add(userTableData).draw();

  const tablePeriod = new DataTable(periodTableName, {
    orderCellsTop: true,
    columns: [
      { data: "UserID" },
      { data: "Type" },
      { data: "Num" },
      { data: "Desc" },
      {
        data: "LastUpdate",
        render: (data, type) => {
          const date = new Date(data);
          if (type === "display") {
            return date.toLocaleDateString("en-AU", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            });
          }
          return date;
        },
      },
    ],
  });
  tablePeriod.rows.add(periodTableData).draw();

  $(".dataTables_filter").css("padding-bottom", "20px");

  $("#dateTo").val(dateTo.toLocaleDateString("en-CA"));
  $("#dateFrom").val(dateFrom.toLocaleDateString("en-CA"));

  hideLoadingScreen();

  //#endregion

  //#region Searchbar Logic

  let dateToVal = new Date($("#dateTo").val());
  let dateFromVal = new Date($("#dateFrom").val());
  // Input event for DateTo and DateFrom inputs
  $("#dateTo, #dateFrom").on("input", function () {
    dateToVal = new Date($("#dateTo").val());
    dateFromVal = new Date($("#dateFrom").val());
    tablePeriod.draw();
  });

  // Add a custom search function to the array
  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    let rowDate = new Date(data[4]); // Assuming the date is in the 5th column and is a Date object

    if (
      (isNaN(dateFromVal) || rowDate >= dateFromVal) &&
      (isNaN(dateToVal) || rowDate <= dateToVal)
    ) {
      return true;
    }
    return false;
  });

  tablePeriod.draw();

  //#endregion

  //#region Screen Button

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    const DATE_TO_VAL = $("#dateTo").val();
    const DATE_FROM_VAL = $("#dateFrom").val();
    exportDataTable(
      periodTableName,
      `Product-User Research (${DATE_FROM_VAL} ~ ${DATE_TO_VAL})`,
      !periodTableData
    );
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
    const teamText = $(`#newTeamText`).val();
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
    let isSaved = await saveChanges(socket);
    if (isSaved) {
      newUser.ProductCount = 0;
      tableUser.row.add(newUser).draw();
      fillDashboardTexts(newUser, userTableData);
      userTableData.append(newUser);
      hidePopUpForm();
    }
  });

  //#endregion
});

/**
 * Fill html text in the dashboard tab with relevant data
 * @param {*} currentUser current user signed in
 * @param {*} allUsers all user in the platform to process
 */
function fillDashboardTexts(currentUser, allUsers) {
  $("#userName").text(currentUser.UserID);
  $("#userAmount").text(currentUser.ProductCount);
  $("#team").text(currentUser.Team);
  $("#teamAmount").text(
    allUsers
      .filter((user) => user.Team === currentUser.Team)
      .reduce((acc, user) => acc + user.ProductCount, 0)
  );
}
