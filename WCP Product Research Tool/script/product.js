$(document).ready(function () {
  const COLUMN_AMOUNT = 9;
  const ROW_AMOUNT = 10;
  const TABLE_NAME = "#productTable";
  var formSelected = "";
  var isEmptyData = true;
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
    // fill in table with the data
    // table.row.add[{}]
    // $("#productTable > tbody:last-child").append(
    // html here
    // );
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
  });

  $(`${TABLE_NAME}_filter`).remove();
  $(".dataTables_length").css("padding-bottom", "1%");

  //#endregion

  // table.on("click", "tbody tr", function () {
  //   let data = table.row(this).data();
  //   Logic to select row's data after clicking here
  //   productChosen = data.text ? Get product Research ID clicked
  // });

  //#region Searchbar Logic
  const rows = $(`${TABLE_NAME} tr`);

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

    //on successful save
    editHasChanges(false);
  });

  // New product Button
  $('button[name="newBtn"]').on("click", function () {
    $('h2[name="formTitle"]').text("New Product");
    formSelected = "new";
    $("#popupForm").show();
    $(`#${formSelected}Form`).show();
    $("#darkLayer").show();
    $("#darkLayer").css("position", "fixed");
  });

  // Import product Button
  $('button[name="importBtn"]').on("click", function () {
    $('h2[name="formTitle"]').text("Import Product(s)");
    formSelected = "import";
    $("#popupForm").show();
    $(`#${formSelected}Form`).show();
    $("#darkLayer").css("position", "fixed");
    $("#darkLayer").show();
  });

  // Export table Button
  $('button[name="exportBtn"]').on("click", function () {
    $(TABLE_NAME).tableExport({
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
  $('button[name="saveForm"]').on("click", async function () {
    const SKU_VALUE = $(`#${formSelected}Sku`).val();
    const MAKE_VALUE = $(`#${formSelected}Make`).val();
    const MODEL_VALUE = $(`#${formSelected}Model`).val();
    const PART_TYPE_VALUE = $(`#${formSelected}Type`).val();
    const IC_NUMBER_VALUE = $(`#${formSelected}Num`).val();
    const IC_DESCRIPTION_VALUE = $(`#${formSelected}Desc`).val();
    const STATUS_VALUE = $(`#${formSelected}Status`).val();
    const OEM_CATEGORY_VALUE = $(`#${formSelected}Oem`).val();
    let fileValue = "";

    //check if mandatory field
    let isFormFilled = Boolean(
      MAKE_VALUE &&
        MODEL_VALUE &&
        PART_TYPE_VALUE &&
        IC_NUMBER_VALUE &&
        IC_DESCRIPTION_VALUE
    );
    //extra validation on new product
    if (formSelected == "new") {
      isFormFilled &= Boolean(STATUS_VALUE && OEM_CATEGORY_VALUE);
    }
    // extra validation on import product
    else if (formSelected == "import") {
      fileValue = $(`#${formSelected}File`).val();
      isFormFilled &= Boolean(fileValue);
    }

    // On Form being filled Completely
    if (isFormFilled) {
      // For Import Products
      if (formSelected == "import") {
        // Keeping Column header name
        let isSkuEmpty = SKU_VALUE.trim().length == 0;
        let isStatusEmtpy = STATUS_VALUE.trim().length == 0;
        let isOemCategoryEmtpy = OEM_CATEGORY_VALUE.trim().length == 0;

        // Read file
        const FILE = $("#importFile").prop("files");
        const READER = new FileReader();
        READER.readAsArrayBuffer(FILE[0]);
        READER.onload = function () {
          const FILE_DATA = new Uint8Array(READER.result);
          const WORKBOOK = XLSX.read(FILE_DATA, { type: "array" });

          // Assuming the first sheet of the workbook is the relevant one
          const SHEET_NAME = WORKBOOK.SheetNames[0];
          const SHEET = WORKBOOK.Sheets[SHEET_NAME];
          const SHEET_JSON = XLSX.utils.sheet_to_json(SHEET);
          let missingHeader = "";

          // Check if file is empty or blank
          if (SHEET_JSON === undefined || SHEET_JSON.length == 0) {
            showAlert(
              `<strong>Error!</strong> <i>${FILE[0].name}</i> File is empty or blank.`
            );
            return;
          }

          missingHeader = findMissingColumnHeader(SHEET_JSON[0], [
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

          // Put data into table
          let importProducts = SHEET_JSON.map((row) => {
            if (
              row[MAKE_VALUE].length < 3 ||
              row[MODEL_VALUE].length < 3 ||
              row[PART_TYPE_VALUE].length < 3
            ) {
              return false;
            }
            return new Product(
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
          });
          if (importProducts.includes(false)) {
            showAlert(
              `<strong>Error!</strong> Value in Make, Model and Part Type must be at least 3 characters long.`
            );
            return;
          }
          if (isEmptyData) {
            // Empty Data if data before is is empty
            isEmptyData = false;
            TABLE.clear().draw();
          }
          // Toggle hasChanges On
          editHasChanges(true);
          // Add data to table
          TABLE.rows.add(importProducts).draw();
          hidePopUpForm(formSelected);
        };
        // For New Product
      } else if (formSelected == "new") {
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
        // Empty Data if data before is is empty
        if (isEmptyData) {
          isEmptyData = false;
          TABLE.clear().draw();
        }
        // Toggle hasChanges On
        editHasChanges(true);
        // Add data to table
        TABLE.row.add(newProduct).draw();
        hidePopUpForm(formSelected);
      }
      return;
    }
    // On Form being filled Incompletely
    else {
      showAlert(
        "<strong>Error!</strong> Please complete all non-optional fields."
      );
      return;
    }
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    // hide the form
    $("#popupForm").hide();
    $(`#${formSelected}Form`).hide();
    $(".alert").hide();
    $("#darkLayer").hide();
    // turn darkLayer into previous size
    $("#darkLayer").css("position", "absolute");
  });

  // Event handler for when ID is ready to be created
  $("#popupForm").on("input", function () {
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

// Function to generate the product ID
function generateProductID(make, model, partType) {
  // Extract the first 3 letters from make, model, and partType
  let makePrefix = make.substring(0, 3).toUpperCase();
  let modelPrefix = model.substring(0, 3).toUpperCase();
  let partTypePrefix = partType.substring(0, 3).toUpperCase();

  // Combine the prefixes and shortened UUID to create the product ID
  return makePrefix + modelPrefix + partTypePrefix + "-" + generateShortUUID();
}

// Function to generate a short UUID
function generateShortUUID() {
  // A shorter UUID consisting of 8 hexadecimal digits
  let uuid = "xxxxxxxx".replace(/[x]/g, function () {
    return ((Math.random() * 16) | 0).toString(16);
  });
  return uuid;
}

// Function to check if all input fields are filled with at least 3 characters
function areAllFieldsFilled() {
  let make = $("#newMake").val();
  let model = $("#newModel").val();
  let partType = $("#newType").val();
  return make.length >= 3 && model.length >= 3 && partType.length >= 3;
}
