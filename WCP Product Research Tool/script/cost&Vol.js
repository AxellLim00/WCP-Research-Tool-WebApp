$(function () {
  const COST_VOLUME_TABLE_NAME = "#costVolTable";
  var researchID = "Default ID";
  var formSelected = "";
  var isEmptyData = true;
  var productChosen = sessionStorage.getItem("productChosen");

  //Load table from SQL

  // if loading from SQL empty

  if (isEmptyData) {
    $('tr[name="values"]').children().text("-");
  } else {
    let costVolTableData;
    // TO DO: fill in table with the data

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
    updateHasChanges(false);
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (isEmptyData) {
      showAlert("<strong>Error!</strong> No data found in table.");
    } else {
      $(COST_VOLUME_TABLE_NAME).tableExport({
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
    formSelected = "import";
    showPopUpForm(formSelected, "Import Cost & Volume");
  });

  //#endregion

  //#region Form Button
  $('button[name="saveForm"]').on("click", function () {
    //check if mandatory field
    var isFormFilled = Boolean(
      $(`#${formSelected}Id`).val() &&
        $(`#${formSelected}CostUsd`).val() &&
        $(`#${formSelected}file`).val()
    );

    // Successful Save
    if (isFormFilled) {
      updateHasChanges(true);

      // TO DO: save data
      exitPopUpForm(formSelected);
      return;
    }
    // Unsuccessful Save
    else {
      showAlert(
        "<strong>Error!</strong> Please complete all non-optional fields."
      );
      return;
    }
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    hidePopUpForm(formSelected);
  });

  //#endregion
});
