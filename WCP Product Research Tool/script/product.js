$(function () {
  const COLUMN_AMOUNT = 9;
  const ROW_AMOUNT = 10;
  const TABLE_NAME = "#productTable";
  var formSelected = "";
  var isEmptyData = true;
  var productSelected = new Product();
  var productObjectList = [];
  // Temporary variables for the new product form
  var prevMake = "";
  var prevModel = "";
  var prevPartType = "";
  var prevID = "";

  //#region Initialize Page

  //Load table from API
  const JSON_ARRAY = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );
  isEmptyData = JSON_ARRAY === null;
  // if loading from API empty
  if (isEmptyData) {
    $(TABLE_NAME).append(getEmptyRow(ROW_AMOUNT, COLUMN_AMOUNT));
  } else {
    let productDtoArray = JSON_ARRAY.map((object) =>
      Object.assign(new ProductRequestHistoryDto(), object)
    );

    productDtoArray.forEach(function (currentDto) {
      var i = currentDto.productStockNumber
        ? productObjectList.findIndex(
            (x) => x.Sku == currentDto.productStockNumber
          )
        : -1;
      if (i <= -1) {
        // researchIdentifier will be used to place Generated Research ID
        if (!currentDto.productStockNumber && !currentDto.researchIdentifier) {
          currentDto.researchIdentifier = generateProductID(
            currentDto.vehicleManufacturers.split("\r"),
            currentDto.vehicleModels.split("\r"),
            currentDto.partTypeFriendlyName.split(" ")
          );
        }
        productObjectList.push(
          new Product(
            currentDto.researchIdentifier,
            currentDto.productStockNumber ?? "",
            currentDto.vehicleManufacturers.split("\r").join("; "),
            currentDto.vehicleModels.split("\r").join("; "),
            currentDto.partTypeFriendlyName,
            currentDto.interchangeVersion
              ? `${currentDto.interchangeNumber.trim()} ${
                  currentDto.interchangeVersion
                }`
              : currentDto.interchangeNumber.trim(),
            currentDto.interchangeDescriptions
              ? currentDto.interchangeDescriptions.split("\r").join("; ")
              : "",
            currentDto.productStockNumber &&
            currentDto.productStockNumber.includes("P-")
              ? "catalogue"
              : "research",
            ""
          )
        );
      }
    });
    console.log("Product Data:");
    console.log(productDtoArray);
    // Update product with new Generated Research ID
    sessionStorage.setItem(
      "productRequestHistory",
      JSON.stringify(productDtoArray)
    );

    // Fill in Search by Bars
    let altIndexValueDictionary = getAltIndexValueDictionary(productDtoArray);
    $.each(Object.keys(altIndexValueDictionary), function (i, item) {
      $("#supplierList").append(
        $("<option>")
          .attr("value", item)
          .text(`${item} : ${altIndexValueDictionary[item]}`)
      );
    });
  }
  var tableOptions = {
    orderCellsTop: true,
    columns: [
      {
        data: "Id",
        render: function (data) {
          if (data.length > 0) return data;
          return "<i>Not set</i>";
        },
      },
      {
        data: "Sku",
        render: function (data) {
          if (String(data).trim().length > 0) return data;
          return "<i>Not set</i>";
        },
      },
      { data: "Make" },
      { data: "Model" },
      { data: "Type" },
      { data: "Num" },
      { data: "Desc" },
      {
        data: "Status",
        render: function (data) {
          if ([null, undefined, ""].includes(data)) return null;
          switch (data) {
            case "research":
            case "Research OEM":
              return "Research OEM";
            case "waiting":
            case "Waiting on Vendor Quote":
              return "Waiting on Vendor Quote";
            case "costDone":
            case "Costing Completed":
              return "Costing Completed";
            case "approval":
            case "Waiting Approval":
              return "Waiting Approval";
            case "pinnacle":
            case "Added to Pinnacle":
              return "Added to Pinnacle";
            case "peach":
            case "Added to Peach":
              return "Added to Peach";
            case "catalogue":
            case "In Pinnacle Catalogue":
              return "In Pinnacle Catalogue";
            default:
              return `ERROR: ${data} not supported`;
          }
        },
        orderable: true,
      },
      {
        data: "Oem",
        render: function (data) {
          if ([null, undefined, ""].includes(data)) return null;
          switch (data.toLowerCase()) {
            case "aftermarket":
              return "Aftermarket";
            case "genuine":
              return "Genuine";
            default:
              return `ERROR: ${data} not supported`;
          }
        },
        orderable: true,
      },
    ],
    stateSave: true,
    paging: true,
  };

  var table = new DataTable(TABLE_NAME, tableOptions);

  $(`${TABLE_NAME}_filter`).remove();
  $(".dataTables_length").css("padding-bottom", "1%");

  table.rows.add(productObjectList).draw();

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
    if (saveChanges()) {
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
    exportDataTable(
      TABLE_NAME,
      tableOptions,
      "Research Product Table",
      isEmptyData
    );
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

  // Single Click Row Event
  $(`${TABLE_NAME} tbody`).on("click", "tr", function () {
    if (isEmptyData) return;
    // Assign row to productSelected
    productSelected = new Product(...Object.values(table.row(this).data()));

    // Clear highlight of all row in Datatable
    table.rows().nodes().to$().css("background-color", "");
    // highlight clicked row
    $(this).css("background-color", "#D5F3FE");

    if (productSelected.Status == "catalogue") {
      $('button[name="editBtn"]').prop("disabled", true);
      return;
    }
    // Enable Edit button
    $('button[name="editBtn"]').prop("disabled", false);
  });

  // Double Click Row Event
  $(`${TABLE_NAME} tbody`).on("dblclick", "tr", function () {
    // Find the ID cell in the clicked row and extract its text
    productSelected = new Product(...Object.values(table.row(this).data()));
    let id =
      productSelected.Sku != "" ? productSelected.Sku : productSelected.Id;
    if (id.length > 0) {
      sessionStorage.setItem("productIDSelected", id);
      sessionStorage.setItem(
        "IsProductEditable",
        productSelected.Status != "catalogue"
      );
      selectTab("tab2");
    } else {
      showAlert(
        "<strong>Error!</strong> Research ID or Product SKU not found."
      );
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
      let columnHeaders = [
        SKU_VALUE,
        MAKE_VALUE,
        MODEL_VALUE,
        PART_TYPE_VALUE,
        IC_NUMBER_VALUE,
        IC_DESCRIPTION_VALUE,
        STATUS_VALUE,
        OEM_CATEGORY_VALUE,
      ];
      columnHeaders.filter((n) => n);
      const SHEET_JSON = await readFileToJson("#importFile", columnHeaders);

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
          `<strong>Error!</strong> Column <i>${missingHeader}</i> Header not found in file.`
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
        table.clear().draw();
      }
      // Add data to table
      table.rows.add(importProducts).draw();
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
        table.clear().draw();
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
      table.row.add(newProduct).draw();
    }
    // Edit Form Save
    else if (formSelected == "edit") {
      // Find the row in the DataTable with the matching ID.
      let row = table.column(0).data().indexOf(productSelected.Id); // column index 0 for ID
      let rowData = table.row(row).data();
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
      table.row(row).data(rowData).invalidate();
    }
    // save changes in rows into sessionStorage
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
 * @param {String[]} make Product's Make value
 * @param {String[]} model Product's Model value
 * @param {String[]} partType Product's Part Type value
 * @returns {String} Product ID
 */
function generateProductID(make, model, partType) {
  // Extract the first 3 letters from make, model, and partType
  let makePrefix =
    make.length == 1
      ? make[0].substring(0, 3).toUpperCase()
      : make
          .map(([v]) => v)
          .join("")
          .toUpperCase();
  let modelPrefix =
    model.length == 1
      ? model[0].substring(0, 3).toUpperCase()
      : model
          .map(([v]) => v)
          .join("")
          .toUpperCase();
  let partTypePrefix =
    partType.length == 1
      ? partType[0].substring(0, 3).toUpperCase()
      : partType
          .map(([v]) => v)
          .join("")
          .toUpperCase();

  // Combine the prefixes and shortened UUID to create the product ID
  return `R-${makePrefix}${modelPrefix}${partTypePrefix}-${generateShortUUID().toUpperCase()}`;
}

/**
 * Generate a short 4 character UUID
 * @returns {String} Short UUID
 */
function generateShortUUID() {
  // A shorter UUID consisting of 4 hexadecimal digits
  let uuid = "xxxx".replace(/[x]/g, function () {
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
