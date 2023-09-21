$(document).ready(function () {
  const altIndexTable_Column = 10;

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_AltIndexTable_Row_Amount = 10;
  if (isEmptyData) {
    $("#altIndexTable").append(
      getEmptyRow(default_AltIndexTable_Row_Amount, altIndexTable_Column)
    );
  } else {
    let altIndexTable_Data;

    // TO DO: fill in table with the data
    // $("#altIndexTable > tbody:last-child").append(
    // html here
    // );
  }

  const table = new DataTable("#altIndexTable", {
    orderCellsTop: true,
  });

  $("#altIndexTable_filter").remove();
  $(".dataTables_length").css("padding-bottom", "1%");

  //  TO DO: Get List of all products in an array
  //  Details:
  //  Add options to the datalist:
  // - "attr" helps if you need an i.d to identify each option.
  // - "text" is the content to be displayed.
  // productList = get_list
  // $.each(productList, function (i, item) {
  //   $("#productList").append($("<option>").attr("value", i).text(item));
  // });
  $("#productSelected").val(productChosen);

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    // find changes
    // save changes to SQL

    // if save successful
    sessionStorage.setItem("hasChanges", false);
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (!isEmptyData) {
      if (!$(".alert").length) {
        $("body").append(`
          <div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
            <strong>Error!</strong> No data found in table.
          </div>`);
      } else if ($(".alert").is(":hidden")) {
        $(".alert").show();
      }
    } else {
      $("#altIndexTable").tableExport({
        type: "excel",
        fileName: `${productChosen} - Alternate Index Table`,
        mso: {
          fileFormat: "xlsx",
        },
        ignoreRow: ["#searchRow"],
      });
    }
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    $('h2[name="formTitle"]').text("Import Alternate Index");
    form_Selected = "import";
    $("#popupForm").show();
    $(`#${form_Selected}Form`).show();
    $("#darkLayer").css("position", "fixed");
    $("#darkLayer").show();
  });

  //#endregion

  //#region Form Button
  $('button[name="saveForm"]').on("click", function () {
    //check if mandatory field
    var isFormFilled = Boolean(
      $(`#${form_Selected}file`).val() &&
        $(`#${form_Selected}Num`).val() &&
        $(`#${form_Selected}Moq`).val() &&
        $(`#${form_Selected}CostCur`).val() &&
        $(`#${form_Selected}SupPartType`).val() &&
        $(`#${form_Selected}WcpPartType`).val()
    );

    // Successful Save
    if (isFormFilled) {
      sessionStorage.setItem("hasChanges", true);

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
