//#region Initialization
//Load table from Server-side ~ ackData -> Acknowledgement Data
await socket.emit("get object database", "Users", "", (ackData) => {
  if (ackData.status == "OK") userTableData = ackData.result;
  else
    showAlert(`Error Occured on getting data from Database: ${ackData.error}`);
  console.log("USER: ");
  console.log(userTableData);
  console.log(typeof userTableData);
});

await socket.emit("get object database", "Product", "", (ackData) => {
  if (ackData.NewProduct.status == "OK")
    periodTableData = ackData.NewProduct.result;
  else
    showAlert(`Error Occured on getting data from Database: ${ackData.error}`);
  console.log("USER-product: ");
  console.log(periodTableData);
  console.log(typeof periodTableData);
});

// if loading from Server-side empty
if (userTableData || jQuery.isEmptyObject(userTableData))
  $("#userResearchTable > tbody:last-child").append(
    createEmptyRow(defaultRowAmount, defaulClumnAmountUser)
  );
else {
  // $("#periodResearchTable > tbody:last-child").append(
  // html here
  // );
}
if (periodTableData || jQuery.isEmptyObject(periodTableData))
  $("#periodResearchTable > tbody:last-child").append(
    createEmptyRow(defaultRowAmount, defaulColumnAmountPeriod)
  );
else {
  //fill in table with the data
  // $("#userResearchTable > tbody:last-child").append(
  // html here
  // );
}
debugger;
const TABLE_USER = new DataTable(userTableName, {
  orderCellsTop: true,
  columns: [{ data: "UserID" }, { data: "Team" }, { data: "ProductCount" }],
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
