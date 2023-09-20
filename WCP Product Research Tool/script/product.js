$(document).ready(function () {
  const productTable_Column = 9;
  var form_Selected;
  productChosen = "test";

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_ProductTable_Row_Amount = 10;
  if (isEmptyData) {
    $("#productTable").append(
      getEmptyRow(default_ProductTable_Row_Amount, productTable_Column)
    );
  } else {
    let productTable_Data;

    // fill in table with the data
    // $("#productTable > tbody:last-child").append(
    // html here
    // );
  }

  const table = new DataTable("#productTable", {
    orderCellsTop: true,
    columns: [
      { data: "id" },
      {
        data: "sku",
        defaultContent: "<i>Not set</i>",
      },
      { data: "make" },
      { data: "model" },
      { data: "type" },
      { data: "num" },
      { data: "desc" },
      { data: "status" },
      { data: "oem" },
    ],
  });

  $("#productTable_filter").remove();
  $(".dataTables_length").css("padding-bottom", "1%");

  // table.on("click", "tbody tr", function () {
  //   let data = table.row(this).data();
  //   Logic to select row's data after clicking here
  //   productChosen = data.text ? Get product Research ID clicked
  // });

  //#region Searchbar Logic
  const rows = $("#productTable tr");

  $("#idSearch").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    // filter data
    // remove rows from table
    // insert new filter data into table
  });
  //#endregion

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    // find changes
    // save changes to SQL
  });

  // New product Button
  $('button[name="newBtn"]').on("click", function () {
    $('h2[name="formTitle"]').text("New Product");
    form_Selected = "new";
    $("#popupForm").show();
    $(`#${form_Selected}Form`).show();
    $("#darkLayer").show();
    $("#darkLayer").css("position", "fixed");
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    $('h2[name="formTitle"]').text("Import Product(s)");
    form_Selected = "import";
    $("#popupForm").show();
    $(`#${form_Selected}Form`).show();
    $("#darkLayer").css("position", "fixed");
    $("#darkLayer").show();
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    $("#productTable").tableExport({
      type: "excel",
      fileName: "Research Product Table",
      mso: {
        fileFormat: "xlsx",
      },
      ignoreRow: ["#searchRow"],
    });
  });

  //#endregion

  //#region Form Button
  $('button[name="saveForm"]').on("click", function () {
    //check if mandatory field
    var isFormFilled = Boolean(
      $(`#${form_Selected}Make`).val() &&
        $(`#${form_Selected}Model`).val() &&
        $(`#${form_Selected}Type`).val() &&
        $(`#${form_Selected}Num`).val() &&
        $(`#${form_Selected}Desc`).val()
    );
    //extra validation on new product
    if (form_Selected == "new")
      isFormFilled &= Boolean(
        $(`#${form_Selected}Stat`).val() && $(`#${form_Selected}Oem`).val()
      );
    // extra validation on import product
    else if (form_Selected == "import")
      isFormFilled &= Boolean($(`#${form_Selected}File`).val());

    // Successful Save
    if (isFormFilled) {
      // save data
      $("#popupForm").hide();
      $(`#${form_Selected}Form`).hide();
      $(".alert").hide();
      $("#darkLayer").hide();
      $("#darkLayer").css("position", "absolute");

      // reset values
      $(`#${form_Selected}Form input`).val("");
      $(`#${form_Selected}Form select`).val("");
    }
    // Unsuccessful Save
    else {
      if (!$(".alert").length) {
        $("body").append(`
          <div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
            <strong>Error!</strong> Please complete all non-optional fields.
          </div>`);
      } else if ($(".alert").is(":hidden")) {
        $(".alert").show();
      }
    }
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    $("#popupForm").hide();
    $(`#${form_Selected}Form`).hide();
    $(".alert").hide();
    $("#darkLayer").hide();
    $("#darkLayer").css("position", "absolute");
  });

  //#endregion
});
