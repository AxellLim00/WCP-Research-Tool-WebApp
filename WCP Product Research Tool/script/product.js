$(function () {
  const COLUMN_AMOUNT = 9;
  const ROW_AMOUNT = 10;
  const TABLE_NAME = "#productTable";
  var formSelected = "";
  var isEmptyData = true;
  var productSelected = new Product();
  // Temporary variables for the new product form
  var prevMake = "";
  var prevModel = "";
  var prevPartType = "";
  var prevID = "";

  //#region Initialize Page
  //Load table from SQL

  // if loading from SQL empty

  if (isEmptyData) {
    $(TABLE_NAME).append(getEmptyRow(ROW_AMOUNT, COLUMN_AMOUNT));
  } else {
    let productData;
    let productList = [];

    // TO DO: fill in table with the data
    // TO DO: create for loop to loop to every data in productData and translate SQL to product object
    // productList.push() --> To push every product Object to list
    // TABLE.rows.add(productList).draw();
  }

  const TABLE = new DataTable(TABLE_NAME, {
    orderCellsTop: true,
    columns: [
      { data: "Id" },
      {
        data: "Sku",
        defaultContent: "<i>Not set</i>",
      },
      { data: "Make" },
      { data: "Model" },
      { data: "Type" },
      { data: "Num" },
      { data: "Desc" },
      { data: "Status" },
      { data: "Oem" },
    ],
    stateSave: true,
    columnDefs: [
      {
        targets: 7, // Assuming "Status" is the 8th column
        render: function (data) {
          switch (data) {
            case "research":
              return "Research OEM";
            case "waiting":
              return "Waiting on Vendor Quote";
            case "costDone":
              return "Costing Completed";
            case "approval":
              return "Waiting Approval";
            case "pinnacle":
              return "Added to Pinnacle";
            case "peach":
              return "Added to Peach";
            default:
              return "";
          }
        },
        orderable: true,
      },
      {
        targets: 8, // Assuming "OEM" is the 9th column
        render: function (data) {
          switch (data) {
            case "aftermarket":
              return "Aftermarket";
            case "genuine":
              return "Genuine";
            default:
              return "";
          }
        },
        orderable: true,
      },
    ],
  });

  $(`${TABLE_NAME}_filter`).remove();
  $(".dataTables_length").css("padding-bottom", "1%");

  //#endregion

  //#region Searchbar Logic
  const rows = $(`${TABLE_NAME} tr`);
  // TO DO: Search logic (find how to filter DataTable)
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
    //on successful save
    if (saveChangesToSQL()) {
      updateHasChanges(false);
    }
  });

  // New product Button
  $('button[name="newBtn"]').on("click", function () {
    formSelected = "new";
    showPopUpForm(formSelected, "New Product");
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    formSelected = "import";
    showPopUpForm(formSelected, "Import Product(s)");
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    if (isEmptyData) {
      showAlert("<strong>Error!</strong> No data found in table.");
    } else {
      $(TABLE_NAME).tableExport({
        type: "excel",
        fileName: "Research Product Table",
        mso: {
          fileFormat: "xlsx",
        },
        ignoreRow: ["#searchRow"],
      });
    }
  });

  // Edit button
  $('button[name="editBtn"]').on("click", function () {
    formSelected = "edit";
    $(`#${formSelected}Id`).text(productSelected.Id);
    $(`#${formSelected}Sku`).text(productSelected.Sku);
    $(`#${formSelected}Make`).text(productSelected.Make);
    $(`#${formSelected}Model`).text(productSelected.Model);
    $(`#${formSelected}Type`).text(productSelected.Type);
    $(`#${formSelected}Num`).text(productSelected.Num);
    $(`#${formSelected}Desc`).text(productSelected.Desc);
    $(`#${formSelected}Status`).val(productSelected.Status);
    $(`#${formSelected}Oem`).val(productSelected.Oem);
    showPopUpForm(formSelected, "Edit Product");
  });

  //#endregion

  //#region Row Click event

  $(`${TABLE_NAME} tbody`).on("click", "tr", function () {
    if (isEmptyData) return;
    // Clear highlight of all row in Datatable
    TABLE.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");
    // Assign row to productSelected
    productSelected = new Product(...Object.values(TABLE.row(this).data()));
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });

  $(`${TABLE_NAME} tbody`).on("dblclick", "tr", function () {
    // Find the ID cell in the clicked row and extract its text
    let rowId = $(this).find("td:first").text();
    if (rowId.length > 0) {
      sessionStorage.setItem("productIDSelected", rowId);
      selectTab("tab2");
    } else {
      showAlert("<strong>Error!</strong> Product ID not found.");
    }
  });

  //#endregion

  //#region Form Button
  $('button[name="saveForm"]').on("click", async function () {
    const SKU_VALUE = $(`#${formSelected}Sku`).val();
    const MAKE_VALUE = $(`#${formSelected}Make`).val();
    const MODEL_VALUE = $(`#${formSelected}Model`).val();
    const PART_TYPE_VALUE = $(`#${formSelected}Type`).val();
    const IC_NUMBER_VALUE = $(`#${formSelected}Num`).val();
    const IC_DESCRIPTION_VALUE = $(`#${formSelected}Desc`).val();
    const STATUS_VALUE = $(`#${formSelected}Status`).val();
    const OEM_CATEGORY_VALUE = $(`#${formSelected}Oem`).val();
    const ID_VALUE = $("#ID").text();
    const FILE_VALUE = $(`#${formSelected}File`).val();
    let changesMade = [];
    //check if mandatory field
    let isFormFilled = Boolean(
      MAKE_VALUE &&
        MODEL_VALUE &&
        PART_TYPE_VALUE &&
        IC_NUMBER_VALUE &&
        IC_DESCRIPTION_VALUE
    );
    let incompleteMessage = "Please complete all non-optional fields";
    //extra validation on new product
    if (formSelected == "new")
      isFormFilled &= Boolean(
        // 18 is length of ID generated
        STATUS_VALUE && OEM_CATEGORY_VALUE && ID_VALUE.length == 18
      );
    // extra validation on import product
    else if (formSelected == "import") isFormFilled &= Boolean(FILE_VALUE);
    // validation on edit product
    else if (formSelected == "edit") {
      isFormFilled = Boolean(STATUS_VALUE && OEM_CATEGORY_VALUE);
      incompleteMessage = "Please have all fields filled before saving";
    }
    // On Form being filled Completely
    if (!isFormFilled) {
      showAlert(`<strong>Error!</strong> ${incompleteMessage}.`);
      return;
    }

    // Import Form Save
    if (formSelected == "import") {
      // Optional Column header name
      let isSkuEmpty = SKU_VALUE.trim().length == 0;
      let isStatusEmtpy = STATUS_VALUE.trim().length == 0;
      let isOemCategoryEmtpy = OEM_CATEGORY_VALUE.trim().length == 0;

      const SHEET_JSON = await readFileToJson("#importFile");

      // Check if file is empty or blank
      if (SHEET_JSON === undefined || SHEET_JSON.length == 0) {
        showAlert(
          `<strong>Error!</strong> <i>${$("input[type=file]")
            .val()
            .split("\\")
            .pop()}</i> File is empty or blank.`
        );
        return;
      }

      let missingHeader = findMissingColumnHeader(SHEET_JSON[0], [
        isSkuEmpty ? null : SKU_VALUE,
        MAKE_VALUE,
        MODEL_VALUE,
        PART_TYPE_VALUE,
        IC_NUMBER_VALUE,
        IC_DESCRIPTION_VALUE,
        isStatusEmtpy ? null : STATUS_VALUE,
        isOemCategoryEmtpy ? null : OEM_CATEGORY_VALUE,
      ]);

      // Check if all headers from input are inside the file
      if (Boolean(missingHeader)) {
        showAlert(
          `<strong>Error!</strong> Column ${missingHeader} Header not found in file.`
        );
        return;
      }

      errorMessage = [];
      // Put map data into Object List
      let importProducts = SHEET_JSON.map((row) => {
        if (
          row[MAKE_VALUE].length < 3 ||
          row[MODEL_VALUE].length < 3 ||
          row[PART_TYPE_VALUE].length < 3
        ) {
          errorMessage.push(
            `Make <i>${row[MAKE_VALUE]}</i>, Model <i>${row[MODEL_VALUE]}</i> and ` +
              `Part Type <i>${row[PART_TYPE_VALUE]}</i> must be at least 3 characters long`
          );
          return null;
        }

        // TO DO: Check if the status and oem is valid, by checkling if it is null

        let newObject = new Product(
          generateProductID(
            row[MAKE_VALUE],
            row[MODEL_VALUE],
            row[PART_TYPE_VALUE]
          ),
          isSkuEmpty ? "" : row[SKU_VALUE],
          row[MAKE_VALUE],
          row[MODEL_VALUE],
          row[PART_TYPE_VALUE],
          row[IC_NUMBER_VALUE],
          row[IC_DESCRIPTION_VALUE],
          isStatusEmtpy ? "" : row[STATUS_VALUE],
          isOemCategoryEmtpy ? "" : row[OEM_CATEGORY_VALUE]
        );

        if (newObject.Status === null) {
          errorMessage.push(
            `STATUS <i>${row[STATUS_VALUE]}</i> must be a valid value`
          );
        }
        if (newObject.Oem === null) {
          errorMessage.push(
            `OEM type <i>${row[OEM_CATEGORY_VALUE]}</i> must be a valid value`
          );
        }
        // Store each new row locally
        changesMade.push(
          new Map([
            ["type", "new"],
            ["id", newObject.Id],
            ["table", "Product"],
            ["changes", newObject],
          ])
        );
        return newObject;
      });

      if (errorMessage.length) {
        showAlert(
          `<strong>Error!</strong> ${errorMessage.join(".\n")}</strong>`
        );
        return;
      }
      // Empty Table if DataTable previosly was empty
      if (isEmptyData) {
        isEmptyData = false;
        TABLE.clear().draw();
      }
      // Add data to table
      TABLE.rows.add(importProducts).draw();
      // Exit Row
      exitPopUpForm(formSelected);
    }
    // New Form Save
    else if (formSelected == "new") {
      let newProduct = new Product(
        $("#ID").text(),
        SKU_VALUE,
        MAKE_VALUE,
        MODEL_VALUE,
        PART_TYPE_VALUE,
        IC_NUMBER_VALUE,
        IC_DESCRIPTION_VALUE,
        STATUS_VALUE,
        OEM_CATEGORY_VALUE
      );
      // Empty Table if DataTable previosly was empty
      if (isEmptyData) {
        isEmptyData = false;
        TABLE.clear().draw();
      }
      // save new rows into sessionStorage
      changesMade.push(
        new Map([
          ["type", "new"],
          ["id", newProduct.Id],
          ["table", "Product"],
          ["changes", newProduct],
        ])
      );
      // Add data to table
      TABLE.row.add(newProduct).draw();
    }
    // Edit Form Save
    else if (formSelected == "edit") {
      // Find the row in the DataTable with the matching ID.
      let row = TABLE.column(0).data().indexOf(productSelected.Id); // column index 0 for ID
      let rowData = TABLE.row(row).data();
      // Save if there are any changes compared to old value (can be found in productSelected)
      newUpdate = {};
      if (productSelected.Status != STATUS_VALUE)
        newUpdate.Status = rowData.Status = STATUS_VALUE;

      if (productSelected.Oem != OEM_CATEGORY_VALUE)
        newUpdate.Oem = rowData.Oem = OEM_CATEGORY_VALUE;

      // exit if no changes were made
      if (Object.keys(newUpdate).length === 0) {
        exitPopUpForm(formSelected);
        return;
      }
      changesMade.push(
        new Map([
          ["type", "edit"],
          ["id", productSelected.Id],
          ["table", "Product"],
          ["changes", newUpdate],
        ])
      );
      productSelected = updateObject(productSelected, newUpdate);
      // Redraw the table to reflect the changes
      TABLE.row(row).data(rowData).invalidate();
    }
    // save new rows into sessionStorage
    updateChanges(changesMade);
    // Toggle hasChanges ON
    updateHasChanges(true);
    // Exit form
    exitPopUpForm(formSelected);
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    // hide the form
    hidePopUpForm(formSelected);
  });

  // Event handler for when ID is ready to be created
  $("#newForm").on("input", function () {
    var make = $("#newMake").val();
    var model = $("#newModel").val();
    var partType = $("#newType").val();
    // Check if all input fields are non-empty and have at least 3 characters
    if (
      areAllFieldsFilled() &&
      (make.substring(0, 3) !== prevMake ||
        model.substring(0, 3) !== prevModel ||
        partType.substring(0, 3) !== prevPartType)
    ) {
      // Update the previous values
      prevMake = make.substring(0, 3);
      prevModel = model.substring(0, 3);
      prevPartType = partType.substring(0, 3);

      // Generate and display the product ID
      var productID = generateProductID(make, model, partType);
      prevID = productID;
      $("#ID").text(productID);
    } else if (
      areAllFieldsFilled() &&
      make.substring(0, 3) == prevMake &&
      model.substring(0, 3) == prevModel &&
      partType.substring(0, 3) == prevPartType
    ) {
      $("#ID").text(prevID);
    } else {
      // Clear the product ID if any input field is empty or has less than 3 characters
      $("#ID").text("Fill the form to make an ID");
    }
  });

  //#endregion
});

/**
 * Generate the product ID using first 3 letters of Make, Model and Part Type,
 * followed by an 8 character UUID
 * @param {String} make Product's Make value
 * @param {String} model Product's Model value
 * @param {String} partType Product's Part Type value
 * @returns {String} Product ID
 */
function generateProductID(make, model, partType) {
  // Extract the first 3 letters from make, model, and partType
  let makePrefix = make.substring(0, 3).toUpperCase();
  let modelPrefix = model.substring(0, 3).toUpperCase();
  let partTypePrefix = partType.substring(0, 3).toUpperCase();

  // Combine the prefixes and shortened UUID to create the product ID
  return makePrefix + modelPrefix + partTypePrefix + "-" + generateShortUUID();
}

/**
 * Generate a short 8 character UUID
 * @returns {String} Short UUID
 */
function generateShortUUID() {
  // A shorter UUID consisting of 8 hexadecimal digits
  let uuid = "xxxxxxxx".replace(/[x]/g, function () {
    return ((Math.random() * 16) | 0).toString(16);
  });
  return uuid;
}

/**
 * Check if all input fields are filled with at least 3 characters
 * @returns {Boolean} True if all input fields are filled with at least 3 characters, False otherwise
 */
function areAllFieldsFilled() {
  let make = $("#newMake").val();
  let model = $("#newModel").val();
  let partType = $("#newType").val();
  return make.length >= 3 && model.length >= 3 && partType.length >= 3;
}

/**
 * Insert row click event into row to highlight
 * @param {String} row datatable's row to insert event
 * @param {Boolean} isEmptyData flag to check if datatable is empty
 */
function insertRowClickEvent(row, isEmptyData) {
  $(row).on("click", function (event) {
    var clickedRow = event.target;
    if (isEmptyData) return;
    $(clickedRow).addClass("highlight");
    let rowId = $(clickedRow).find("td:first").text();
    console.log("TEST");
  });
}

/**
 * Insert row double click event into row to pick product
 * @param {String} row datatable's row to insert event
 */
function insertRowDoubleClickEvent(row) {
  $(row).on("dblclick", function (event) {
    var clickedRow = event.target;
    // Find the ID cell in the clicked row and extract its text
    let rowId = $(clickedRow).find("td:first").text();
    if (rowId.length > 0) {
      sessionStorage.setItem("productIDSelected", rowId);
      selectTab("tab2");
    } else {
      showAlert("<strong>Error!</strong> Product ID not found.");
    }
  });
}
