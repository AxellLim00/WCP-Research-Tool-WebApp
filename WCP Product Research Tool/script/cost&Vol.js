$(document).ready(function () {
  const costVolTable_Col = 7;
  var researchID = "Default ID";
  var form_Selected = "";

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  if (isEmptyData) {
    $('tr[name="values"]').children().text("-");
  } else {
    let costVolTable_Data;
    //fill in table with the data

    // $("#productTable > tbody:last-child").append(
    // html here
    // );
  }

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

    // if successful save
    sessionStorage.setItem("hasChanges", false);
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (isEmptyData) {
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
      $("#costVolTable").tableExport({
        type: "excel",
        fileName: `${researchID} - Cost & Volume Table`,
        mso: {
          fileFormat: "xlsx",
        },
      });
    }
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    $('h2[name="formTitle"]').text("Import Cost & Volume");
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
      $(`#${form_Selected}Id`).val() &&
        $(`#${form_Selected}CostUsd`).val() &&
        $(`#${form_Selected}file`).val()
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
