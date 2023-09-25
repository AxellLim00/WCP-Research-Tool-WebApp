$(document).ready(function () {
  const productTable_Column = 9;
  const tableName = "#productTable";
  var form_Selected;
  var isEmptyData = true;
  // temp variables for new product form
  var prevMake = "";
  var prevModel = "";
  var prevPartType = "";
  var prevID = "";

  //Load table from SQL

  // if loading from SQL empty

  const default_ProductTable_Row_Amount = 10;
  if (isEmptyData) {
    $(tableName).append(
      getEmptyRow(default_ProductTable_Row_Amount, productTable_Column)
    );
  } else {
    let productTable_Data;

    // fill in table with the data
    // table.row.add[{}]
    // $("#productTable > tbody:last-child").append(
    // html here
    // );
  }

  const table = new DataTable(tableName, {
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
  });

  $(`${tableName}_filter`).remove();
  $(".dataTables_length").css("padding-bottom", "1%");

  // table.on("click", "tbody tr", function () {
  //   let data = table.row(this).data();
  //   Logic to select row's data after clicking here
  //   productChosen = data.text ? Get product Research ID clicked
  // });

  //#region Searchbar Logic
  const rows = $(`${tableName} tr`);

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
    sessionStorage.setItem("hasChanges", false);
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
    $(tableName).tableExport({
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
    const skuValue = $(`#${form_Selected}Sku`).val();
    const makeValue = $(`#${form_Selected}Make`).val();
    const modelValue = $(`#${form_Selected}Model`).val();
    const typeValue = $(`#${form_Selected}Type`).val();
    const numValue = $(`#${form_Selected}Num`).val();
    const descValue = $(`#${form_Selected}Desc`).val();
    let fileValue = "";
    let statValue = "";
    let oemValue = "";

    //check if mandatory field
    let isFormFilled = Boolean(
      makeValue && modelValue && typeValue && numValue && descValue
    );
    //extra validation on new product
    if (form_Selected == "new") {
      statValue = $(`#${form_Selected}Stat`).val();
      oemValue = $(`#${form_Selected}Oem`).val();
      isFormFilled &= Boolean(statValue && oemValue);
    }
    // extra validation on import product
    else if (form_Selected == "import") {
      fileValue = $(`#${form_Selected}File`).val();
      isFormFilled &= Boolean(fileValue);
    }

    // Successful Save
    if (isFormFilled) {
      if (isEmptyData) {
        isEmptyData = false;
        table.clear().draw();
      }

      sessionStorage.setItem("hasChanges", true);
      if (form_Selected == "import") {
        // Keeping Column header name
        let isSkuEmpty = skuValue.trim().length == 0;

        // Read file
        const file = $("#importFile").prop("files");
        const reader = new FileReader();
        reader.readAsArrayBuffer(file[0]);
        reader.onload = function () {
          const XLSX = require("xlsx");
          const data = new Uint8Array(reader.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Assuming the first sheet of the workbook is the relevant one
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(sheet);

          // Put data into table
          const importProducts = data.map((row) => {
            return new Product(
              generateProductID(
                row[makeValue],
                row[modelValue],
                row[typeValue]
              ),
              isSkuEmpty ? "" : row[skuValue],
              row[makeValue],
              row[modelValue],
              row[typeValue],
              row[numValue],
              row[descValue],
              row[statValue],
              row[oemValue]
            );
          });
          table.rows.add(importProducts).draw();
        };
      } else if (form_Selected == "new") {
        let newProduct = new Product(
          $("#ID").text(),
          skuValue,
          makeValue,
          modelValue,
          typeValue,
          numValue,
          descValue,
          statValue,
          oemValue
        );

        table.row.add(newProduct).draw();
      }

      // finally hide form
      $("#popupForm").hide();
      $(`#${form_Selected}Form`).hide();
      $(".alert").hide();
      $("#darkLayer").hide();
      $("#darkLayer").css("position", "absolute");

      // reset values
      $(`#${form_Selected}Form input`).val("");
      $(`#${form_Selected}Form select`).val("");
    }
    // on Unsuccessful Save
    else {
      // Check if alert has been made before
      if (!$(".alert").length) {
        $("body").append(`
          <div class="alert">
            <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> 
            <strong>Error!</strong> Please complete all non-optional fields.
          </div>`);
      }
      // Show previously made alert
      else if ($(".alert").is(":hidden")) {
        $(".alert").show();
      }
    }
  });

  // Cancel Form - NOTE: keep last thing written
  $('button[name="cancelForm"]').on("click", function () {
    // hide the form
    $("#popupForm").hide();
    $(`#${form_Selected}Form`).hide();
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
  var makePrefix = make.substring(0, 3).toUpperCase();
  var modelPrefix = model.substring(0, 3).toUpperCase();
  var partTypePrefix = partType.substring(0, 3).toUpperCase();

  // Combine the prefixes and shortened UUID to create the product ID
  var productID =
    makePrefix + modelPrefix + partTypePrefix + "-" + generateShortUUID();

  return productID;
}

// Function to generate a short UUID
function generateShortUUID() {
  // A shorter UUID consisting of 8 hexadecimal digits
  var uuid = "xxxxxxxx".replace(/[x]/g, function () {
    return ((Math.random() * 16) | 0).toString(16);
  });
  return uuid;
}

// Function to check if all input fields are filled with at least 3 characters
function areAllFieldsFilled() {
  var make = $("#newMake").val();
  var model = $("#newModel").val();
  var partType = $("#newType").val();
  return make.length >= 3 && model.length >= 3 && partType.length >= 3;
}

class Product {
  constructor(id, sku, make, model, type, num, desc, status, oem) {
    this.Id = id;
    if (sku.trim().length > 0) {
      this.Sku = sku;
    } else {
      this.Sku = "<i>Not set</i>";
    }
    this.Make = make;
    this.Model = model;
    this.Type = type;
    this.Num = num;
    this.Desc = desc;
    switch (status.toLowerCase()) {
      case "research":
        this.Status = "Research OEM";
        break;
      case "waiting":
        this.Status = "Waiting on Vendor Quote";
        break;
      case "costdone":
        this.Status = "Costing Completed";
        break;
      case "approval":
        this.Status = "Waiting Approval";
        break;
      case "pinnacle":
        this.Status = "Added to Pinnacle";
        break;
      case "peach":
        this.Status = "Added to Peach";
        break;
      default:
        this.Status = status;
    }
    switch (oem.toLowerCase()) {
      case "aftermarket":
        this.Oem = "Aftermarket OEM";
        break;
      case "genuine":
        this.Oem = "Genuine OEM";
        break;
      default:
        this.Oem = oem;
    }
  }
}
