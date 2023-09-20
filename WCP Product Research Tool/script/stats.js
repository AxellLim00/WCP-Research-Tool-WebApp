$(document).ready(function () {
  const statsTable_Column = 1;
  var form_Selected = "";

  //Load table from SQL

  // if loading from SQL empty
  var isEmptyData = true;

  const default_VinTable_Row_Amount = 10;
  const default_OemTable_Row_Amount = 10;
  if (isEmptyData) {
    $("#vinTable").append(
      getEmptyRow(default_VinTable_Row_Amount, statsTable_Column)
    );
    $("#oemTable").append(
      getEmptyRow(default_OemTable_Row_Amount, statsTable_Column)
    );
  } else {
    let vinNumberTable_Data, oemTable_Data;
    //fill in table with the data

    // $("#vinTable > tbody:last-child").append(
    // html here
    // );
    // $("#oemTable > tbody:last-child").append(
    // html here
    // );
  }

  const vinTable = new DataTable("#vinTable", {
    orderCellsTop: true,
  });
  const oemTable = new DataTable("#oemTable", {
    orderCellsTop: true,
  });
  $(".dataTables_length").css("padding-bottom", "2%");

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
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    $('h2[name="formTitle"]').text(`Import Vin Numbers and OEMs`);
    form_Selected = "import";
    $("#popupForm").show();
    $(`#${form_Selected}Form`).show();
    $("#darkLayer").css("position", "fixed");
    $("#darkLayer").show();
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    $("table").tableExport({
      type: "excel",
      fileName: `${productChosen} - Stats Table`,
      mso: {
        fileFormat: "xlsx",
        worksheetName: ["Vin Numbers", "OEMs"],
      },
    });
  });

  //#endregion

  //#region Form Button
  $("#importDiffWS").change(function () {
    if ($(this).is(":checked")) {
      $(".ws-name").show();
    } else {
      $(".ws-name").hide();
    }
  });

  $('button[name="saveForm"]').on("click", function () {
    //check if mandatory field
    var isFormFilled = Boolean(
      $(`#${form_Selected}File`).val() &&
        ($(`#${form_Selected}Vin`).val() || $(`#${form_Selected}Oem`).val())
    );

    if ($(`#${form_Selected}DiffWS`).is(":checked")) {
      if ($(`#${form_Selected}Vin`).val()) {
        isFormFilled &= Boolean($(`#${form_Selected}VinWS`).val());
      }
      if ($(`#${form_Selected}Oem`).val()) {
        isFormFilled &= Boolean($(`#${form_Selected}OemWS`).val());
      }
    }

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
      $(`#${form_Selected}DiffWS`).prop("checked", false);
      $(`.ws-name`).hide();
    }
    // Unsuccessful Save
    else {
      if (!$(".alert").length) {
        $("body").append(`
          <div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
            <strong>Error!</strong> Please complete necessary fields.
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
