import DataTable from "datatables.net-dt";
import "datatables.net-responsive-dt";
import "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";
import { ProductRequestHistoryDto } from "../utils/class/apiDto.js";
import {
  selectTab,
  showAlert,
  showPopUpForm,
  hidePopUpForm,
  exitPopUpForm,
  showLoadingScreen,
  hideLoadingScreen,
} from "../utils/html-utils.js";
import { ProductDto } from "../utils/class/dataTableDto.js";
import {
  createEmptyRow,
  findMissingColumnHeader,
  exportDataTable,
  readFileToJson,
} from "../utils/table-utils.js";
import {
  getAltIndexValueDictionary,
  updateObject,
  updateHasChanges,
  updateChanges,
  saveChanges,
  updateProductRequestHistory,
  addNewProductRequestHistory,
} from "../utils/tab-utils.js";
import socket from "../utils/socket-utils.js";
import {
  fetchProductDataFromDatabase,
  fetchSupplierFromDatabase,
  fetchOemFromDatabase,
  fetchAltIndexFromDatabase,
} from "../utils/fetchSQL-utils.js";

$(async function () {
  const defaultColumnAmount = 9;
  const defaultRowAmount = 10;
  const tableName = "#productTable";
  const productObjectList = [];
  let formSelected;
  let isEmptyData = true;
  let productSelected = new ProductDto();
  let rowIndexSelected = -1;

  //#region Initialize Page

  showLoadingScreen("Loading All Products...");

  const productDatabaseArray = await updateProductRequestsWithDatabase(socket);
  const productDetails = productDatabaseArray.Product;
  // console.log(productDatabaseArray);

  //Load table from API
  const productWorkflowArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  );

  // Check if both productWorkflowArray and productDatabaseArray are empty
  isEmptyData =
    !Boolean(productWorkflowArray) &&
    (!Boolean(productDatabaseArray) ||
      productDatabaseArray.NewProduct.length === 0);

  // If Data from API empty
  if (isEmptyData) {
    $(tableName).append(createEmptyRow(defaultRowAmount, defaultColumnAmount));
  } else {
    const productAddingToDatabase = [];

    const productDtoArray = productWorkflowArray.map((object) =>
      Object.assign(new ProductRequestHistoryDto(), object)
    );

    // Add all product from productDtoArray to productObjectList
    productDtoArray.forEach((currObject, idx, array) => {
      // If current product's SKU is not empty,
      var i = currObject.productStockNumber
        ? productObjectList.findIndex(
            (x) => x.Sku == currObject.productStockNumber
          )
        : -1;
      if (i != -1) {
        // If current product's AltIndex is empty, exit
        if (!currObject.vendorId) return;
        // Add current product's AltIndex to the supplier list of the product with the same SKU in the list
        productObjectList[i].SuppList.push(
          String(currObject.vendorId).toLowerCase()
        );
        return;
      }

      // If current product's SKU is empty, generate a Research ID
      if (!currObject.productStockNumber) {
        currObject.researchIdentifier = generateProductID(
          `${currObject.interchangeNumber.trim()}${
            currObject.interchangeVersion
          }`,
          currObject.partTypeCode
        );
      }

      // Find productDetail Match in database
      let productDetailMatch = findMatchingProductDetail(
        productDetails,
        currObject
      );
      // Assign ResearchID to currObject if productDetailMatch exist else assign New ResearchID
      let researchId = productDetailMatch
        ? productDetailMatch.ResearchID
        : currObject.researchIdentifier;

      // DEBUG
      // if (researchId && researchId.includes("TEST")) console.log(researchId);

      // Update productDtoArray researchIdentifier here based on productDetailMatch's Values
      array[idx].researchIdentifier = researchId;
      productObjectList.push(
        new ProductDto(
          researchId,
          currObject.productStockNumber,
          currObject.vehicleManufacturers.split("\r").join("; "),
          currObject.vehicleModels.split("\r").join("; "),
          currObject.partTypeFriendlyName,
          currObject.interchangeVersion
            ? `${currObject.interchangeNumber.trim()} ${
                currObject.interchangeVersion
              }`
            : currObject.interchangeNumber.trim(),
          currObject.interchangeDescriptions
            ? currObject.interchangeDescriptions.split("\r").join("; ")
            : "",
          productDetailMatch
            ? productDetailMatch.Status
            : currObject.productStockNumber &&
              currObject.productStockNumber.includes("P-")
            ? "catalogue"
            : "research",
          productDetailMatch ? productDetailMatch.OemType : "",
          // TO DO: AltIndex and/or Oem-Supplier Pair place here (Database)
          // Add AltIndex to Supplier List if AltIndex is not empty
          currObject.vendorId
            ? [String(currObject.vendorId).toLowerCase()]
            : [],
          // TO DO: oem place on left (Database)
          // Add Oem to Oem List if productDetailMatch does exist
          productDetailMatch ? [] : [],
          currObject.partTypeCode
        )
      );

      // If product is not in database, add to database
      if (!productDetailMatch) {
        // TODO: set last update to minimal date 01-01-1900
        productAddingToDatabase.push(
          productObjectList[productObjectList.length - 1]
        );
      }
      // TODO: Find ProductDetails with minimal date that is not in productRequestHistory anymore and delete them
    });

    // Insert all product in productDtoArray that has no productDetailMatch to the database
    insertNewWorkflowProductToDatabase(socket, productAddingToDatabase);

    // Update product with new Generated Research ID
    sessionStorage.setItem(
      "productRequestHistory",
      JSON.stringify(productDtoArray)
    );

    let supplierList;
    try {
      supplierList = await fetchSupplierFromDatabase(socket);
    } catch {
      // Error handled in fetchSupplierFromDatabase
      return;
    }

    // Fill in Search by Bars
    supplierList.forEach((supplier) => {
      $("#supplierList").append(
        $("<option>")
          .attr("value", supplier.SupplierNumber)
          .text(`${supplier.SupplierNumber} : ${supplier.SupplierName}`)
      );
    });

    // TODO: Get list of unique OEM after symbols have been removed
    let oemUniqueArray = [];
    $.each(oemUniqueArray, function (i, item) {
      $("#supplierList").append($("<option>").attr("value", item).text(item));
    });
  }
  var tableOptions = {
    orderCellsTop: true,
    columns: [
      {
        data: "Id",
        render: function (data) {
          if (data && data.length > 0) return data;
          return "<i>Not set</i>";
        },
      },
      {
        data: "Sku",
        render: function (data) {
          if (data && String(data).trim().length > 0) return data;
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
      {
        data: "SuppList",
        /**
         * @param {String[] | String} data
         * @returns {String}
         */
        render: function (data) {
          if (typeof data === "string") return data; // Only used when Redrawing table
          return data ? data.join("; ") : "";
        },
      },
      {
        data: "OemList",
        /**
         * @param {String[] | String} data
         * @returns {String}
         */
        render: function (data) {
          if (typeof data === "string") return data; // Only used when Redrawing table
          return data ? data.join("; ") : "";
        },
      },
    ],
    stateSave: true,
    paging: true,
  };
  var table = new DataTable(tableName, tableOptions);

  // Hide Supplier and OEM List Column
  const supplierListIndex = 9;
  const oemListIndex = 10;
  table.column(supplierListIndex).visible(false, false);
  table.column(oemListIndex).visible(false, false);
  table.columns.adjust().draw(false);

  $(`${tableName}_filter`).remove();
  $(".dataTables_length").css("padding-bottom", "1%");
  table.rows.add(productObjectList).draw(false);
  table.columns().search("").draw();

  //#endregion

  //#region Searchbar Logic

  // https://live.datatables.net/vipifute/1/edit
  // https://datatables.net/extensions/fixedcolumns/examples/styling/col_filter.html
  // https://datatables.net/examples/api/multi_filter_select.html
  // https://datatables.net/extensions/searchpanes/examples/customFiltering/customOptionConditions.html

  $('input.filter[type="text"]').on("input", function () {
    table.column($(this).data("column")).search($(this).val()).draw(false);
  });
  // multi select can also be possible to replace some search bars

  // https://multiple-select.wenzhixin.net.cn/examples#getData.html#view-source
  $(".multiple-select").multipleSelect({
    onClick: function () {
      let values = $(this)
        .multipleSelect("getData")[0]
        ["data"].filter((json) => json.selected)
        .map((json) => json.text);
      let filterRegex = values
        .map(function (value) {
          return "^" + value + "$";
        })
        .join("|");
      //filter with an regex, no smart filtering, not case sensitive
      table
        .column($(this).attr("column"))
        .search(filterRegex, true, false, false)
        .draw(false);
    },
    onUncheckAll: function () {
      table.column($(this).attr("column")).search("").draw(false);
    },
    onCheckAll: function () {
      table.column($(this).attr("column")).search("").draw(false);
    },
  });
  // On Default Exclude In Pinnacle Catalogue

  //#endregion

  //#region Screen Button

  // Save changes Button
  $('button[name="saveBtn"]').on("click", function () {
    //on successful save
    if (saveChanges(socket)) {
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
    showLoadingScreen("Exporting HTML Table...");
    console.log("Exporting HTML Table...");
    exportDataTable(
      tableName,
      "Research Product Table",
      isEmptyData,
      productObjectList
    );
    hideLoadingScreen();
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
  $(`${tableName} tbody`).on("click", "tr", function () {
    if (isEmptyData) return;
    // Assign row to productSelected
    productSelected = new ProductDto(...Object.values(table.row(this).data()));
    rowIndexSelected = table.row(this).index();

    // Clear highlight of all row in DataTable
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
  $(`${tableName} tbody`).on("dblclick", "tr", function () {
    // Find the ID cell in the clicked row and extract its text
    productSelected = new ProductDto(...Object.values(table.row(this).data()));
    // ID is either the SKU first or the Research ID if SKU is empty
    let id = Boolean(productSelected.Sku)
      ? productSelected.Sku
      : productSelected.Id;
    // If ID is not empty, save it in sessionStorage and go to tab2
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
  const researchIdPlaceHolder = "Fill the form to make an ID";

  $('button[name="saveForm"]').on("click", async function () {
    const skuVal = $(`#${formSelected}Sku`).val();
    const makeVal = $(`#${formSelected}Make`).val();
    const modelVal = $(`#${formSelected}Model`).val();
    const partTypeVal = $(`#${formSelected}Type`).val();
    const partTypeCodeVal = $(`#${formSelected}TypeCode`).val();
    const icNumVal = $(`#${formSelected}Num`).val();
    const icDescVal = $(`#${formSelected}Desc`).val();
    const statusVal = $(`#${formSelected}Status`).val();
    const oemTypeVal = $(`#${formSelected}Oem`).val();
    const idVal = $("#ID").text();
    const fileVal = $(`#${formSelected}File`).val();
    const changesMade = [];
    const user = sessionStorage.getItem("username");

    let incompleteMessage = "Please complete all non-optional fields";
    // Check if all input mandatory fields are non-empty
    let isFormFilled = Boolean(
      makeVal &&
        modelVal &&
        partTypeVal &&
        icNumVal &&
        icDescVal &&
        partTypeCodeVal
    );
    // Extra validation on new product form (ID is generated)
    if (formSelected == "new")
      isFormFilled &= Boolean(
        // 18 is length of ID generated
        statusVal && oemTypeVal && idVal != researchIdPlaceHolder
      );
    // Extra validation on import product form (File is uploaded)
    else if (formSelected == "import") isFormFilled &= Boolean(fileVal);
    // Extra validation on edit product form (ID is not empty)
    else if (formSelected == "edit") {
      isFormFilled = Boolean(statusVal && oemTypeVal);
      incompleteMessage = "Please have all fields filled before saving";
    }

    // On Form not filled properly, show alert and exit
    if (!isFormFilled) {
      showAlert(`<strong>Error!</strong> ${incompleteMessage}.`);
      return;
    }

    // Import Form Save
    if (formSelected == "import") {
      // Optional Column header name
      let isSkuEmpty = skuVal.trim().length == 0;
      let isStatusEmpty = statusVal.trim().length == 0;
      let isOemCategoryEmpty = oemTypeVal.trim().length == 0;
      let columnHeaders = [
        skuVal,
        makeVal,
        modelVal,
        partTypeCodeVal,
        partTypeVal,
        icNumVal,
        icDescVal,
        statusVal,
        oemTypeVal,
      ];
      columnHeaders.filter((n) => n);
      const SHEET_JSON = await readFileToJson("#importFile", columnHeaders);

      // Check if file is empty or blank (no data), exit and alert if true
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
        isSkuEmpty ? null : skuVal,
        makeVal,
        modelVal,
        partTypeCodeVal,
        partTypeVal,
        icNumVal,
        icDescVal,
        isStatusEmpty ? null : statusVal,
        isOemCategoryEmpty ? null : oemTypeVal,
      ]);

      // Check if all headers from input are inside the file
      if (Boolean(missingHeader)) {
        showAlert(
          `<strong>Error!</strong> Column <i>${missingHeader}</i> Header not found in file.`
        );
        return;
      }

      let errorMessage = [];
      // TODO: Make preview display of imported data
      // TODO: Inform user if there are any duplicate SKU in file
      // TODO: Inform user if there are any duplicate IC Number + Part Type Code in the file
      // TODO: Inform user for changes/updates to values. (e.g. Status, OEM, etc.) can be done with colors and tooltips.
      // Put map data into Object List
      const importProducts = SHEET_JSON.map((row) => {
        let newObject = new ProductDto(
          generateProductID(row[icNumVal], row[partTypeCodeVal]),
          isSkuEmpty ? "" : row[skuVal],
          row[makeVal],
          row[modelVal],
          row[partTypeVal],
          row[icNumVal],
          row[icDescVal],
          isStatusEmpty ? "" : row[statusVal],
          isOemCategoryEmpty ? "" : row[oemTypeVal],
          [],
          [],
          row[partTypeCodeVal]
        );

        if (newObject.Status === null) {
          errorMessage.push(
            `STATUS <i>${row[statusVal]}</i> must be a valid value`
          );
        }
        if (newObject.Oem === null) {
          errorMessage.push(
            `OEM type <i>${row[oemTypeVal]}</i> must be a valid value`
          );
        }
        // TODO: Check if imported data is in ProductHistoryRequest, if yes, change type to update and table to Product
        // Store each new row locally
        changesMade.push(
          new Map([
            ["type", "new"],
            ["id", newObject.Id],
            ["user", user],
            ["table", "NewProduct"],
            ["changes", [newObject]],
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
      // Empty Table if DataTable previously was empty
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
      let newProduct = new ProductDto(
        $("#ID").text(),
        skuVal.toUpperCase(),
        makeVal.toUpperCase(),
        modelVal.toUpperCase(),
        partTypeVal.toUpperCase(),
        icNumVal.toUpperCase(),
        icDescVal.toUpperCase(),
        statusVal,
        oemTypeVal,
        [],
        [],
        partTypeCodeVal.toUpperCase()
      );
      // Empty Table if DataTable previously was empty
      if (isEmptyData) {
        isEmptyData = false;
        table.clear().draw();
      }
      // save new rows into sessionStorage
      changesMade.push(
        new Map([
          ["type", "new"],
          ["id", newProduct.Id],
          ["user", user],
          ["table", "NewProduct"],
          ["changes", [newProduct]],
        ])
      );

      // Add data to table
      table.row.add(newProduct).draw();

      // Add NewProduct to sessionStorage's ("productRequestHistory")
      addNewProductRequestHistory(newProduct);
    }
    // Edit Form Save
    else if (formSelected == "edit") {
      let rowData = table.row(rowIndexSelected).data();
      // Save if there are any changes compared to old value (can be found in productSelected)
      let newUpdate = {};
      if (productSelected.Status != statusVal)
        newUpdate.Status = rowData.Status = statusVal;

      if (productSelected.Oem != oemTypeVal)
        newUpdate.Oem = rowData.Oem = oemTypeVal;

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
      table.row(rowIndexSelected).data(rowData).invalidate().draw();
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
    const icNum = $("#newNum").val().toUpperCase();
    const typeCode = $("#newTypeCode").val().toUpperCase();
    if ($("#ID").text() && $("#ID").text().split("-")[1] == icNum + typeCode)
      return;
    if (icNum.length > 0 && typeCode.length > 0) {
      // Check if all input fields are non-empty and have at least 3 characters
      // Generate and display the product ID
      $("#ID").text(generateProductID(icNum, typeCode));
    } else if (icNum.length == 0 || typeCode.length == 0) {
      // Clear the product ID if any input field is empty or has less than 3 characters
      $("#ID").text(researchIdPlaceHolder);
    }
  });

  hideLoadingScreen();
  //#endregion
});

/**
 * Generate the product ID using first 3 letters of Make, Model and Part Type,
 * followed by an 8 character UUID
 * @param {String} icNumber Product's IC Number value
 * @param {String} PartTypeCode Product's Part Type Code value
 * @returns {String} Product ID
 */
function generateProductID(icNumber, PartTypeCode) {
  // Combine the prefixes and shortened UUID to create the product ID
  return `R-${icNumber.replace(
    /\s+/g,
    ""
  )}${PartTypeCode}-${generateShortUUID().toUpperCase()}`;
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
 * Insert New Product in Workflow to the SQL Database
 * @param {Socket<DefaultEventsMap, DefaultEventsMap>} socket
 * @param {ProductDto[]} productAddingToDatabase Array of new Products
 * @returns {Promise<void>}
 */
async function insertNewWorkflowProductToDatabase(
  socket,
  productAddingToDatabase
) {
  const sqlInsertLimit = 1000;
  const totalProducts = productAddingToDatabase.length;

  if (totalProducts === 0) return;

  const updateLoops = Math.ceil(totalProducts / sqlInsertLimit);

  for (let i = 0; i < updateLoops; i++) {
    const startIndex = i * sqlInsertLimit;
    const endIndex = startIndex + sqlInsertLimit;
    const productsToInsert = productAddingToDatabase.slice(
      startIndex,
      endIndex
    );

    const changes = new Map([
      ["type", "new"],
      ["table", "Product"],
      ["user", "product-research-tool"],
      ["changes", productsToInsert],
    ]);

    updateChanges([changes]);
    await saveChanges(socket);
  }
}

function findMatchingProductDetail(productDetailsArray, currObject) {
  return productDetailsArray.find((product) => {
    // Check if SKU match match in database with current product in workflow list (currObject)
    let isSkuMatch = product.SKU
      ? product.SKU == currObject.productStockNumber
      : false;
    // Check if Research ID match in database with current product in workflow list (currObject)
    let isResearchIdMatch = product.ResearchID
      ? product.ResearchID.includes(
          (
            currObject.interchangeNumber +
            currObject.interchangeVersion +
            currObject.partTypeCode
          ).replace(/\s+/g, "")
        )
      : false;
    // Return true if either SKU or Research ID match
    return isSkuMatch || isResearchIdMatch;
  });
}

/**
 * Update product request history with new products
 * @returns {Promise<Object>} Return Array of Product and NewProduct data from database
 */

async function updateProductRequestsWithDatabase(socket) {
  //Load Product from Database
  const { Product: productDetails, NewProduct: newProductSaved } =
    await fetchProductDataFromDatabase(socket).catch((error) =>
      console.error(error)
    );

  // Update productRequestHistory in StorageSession with new productDetails
  updateProductRequestHistory(newProductSaved, productDetails);
  return { Product: productDetails, NewProduct: newProductSaved };
}
