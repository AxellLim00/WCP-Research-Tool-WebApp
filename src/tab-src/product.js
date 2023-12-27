/**
 * This file contains the implementation of the product page in the web application.
 * It includes the initialization of the page, table rendering, search bar logic, and button event handlers.
 * The page displays a table of product data fetched from the database and allows users to interact with the data.
 * Users can search for products, filter the table using multiple select dropdowns, edit product details, and export the table.
 * Double-clicking on a row opens a form to view and edit the selected product.
 * Single-clicking on a row highlights the row and enables the edit button.
 * The file also includes various utility functions for manipulating the table and interacting with the database.
 */
import DataTable from "datatables.net-dt";
import "../../node_modules/datatables.net-dt/css/jquery.dataTables.min.css";
import "multiple-select";
import "../../node_modules/multiple-select/dist/multiple-select.min.css";
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
  updateObject,
  updateHasChanges,
  updateChanges,
  saveChanges,
  addNewProductRequestHistory,
  generateProductID,
  findMatchingProductDetail,
} from "../utils/tab-utils.js";
// import socket from "../utils/socket-utils.js";
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
  const socket = window.socket;

  let formSelected;
  let isEmptyData = true;
  let productSelected = new ProductDto();
  let rowIndexSelected = -1;

  //#region Initialize Page

  showLoadingScreen("Loading All Products...");

  let productDetails;

  try {
    const result = await fetchProductDataFromDatabase(socket);
    productDetails = result.Product;
  } catch {
    return;
  }

  //Load table from API
  const productReqHistWorkflowArray = JSON.parse(
    sessionStorage.getItem("productRequestHistory")
  ).map((object) => Object.assign(new ProductRequestHistoryDto(), object));

  // Check if both productWorkflowArray and productDatabaseArray are empty
  isEmptyData = !Boolean(productReqHistWorkflowArray);

  // If Data from API empty
  if (isEmptyData) {
    $(tableName).append(createEmptyRow(defaultRowAmount, defaultColumnAmount));
  } else {
    // Get list of unique OEM
    let oemList;
    try {
      oemList = await fillOemTextBoxDataList(socket);
    } catch (error) {
      console.error("An error occurred:", error);
      return;
    }

    // Get list of AltIndex for its Supplier Product relation
    let altIndexList;
    try {
      altIndexList = await fetchAltIndexFromDatabase(socket);
    } catch (error) {
      // Error handled in fetchOemFromDatabase
      throw error;
    }

    // Add all product from productDtoArray to productObjectList
    productReqHistWorkflowArray.forEach((currObject, idx, array) => {
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

      // Find productDetail Match in database
      let productDetailMatch = findMatchingProductDetail(
        productDetails,
        currObject
      );

      productObjectList.push(
        createProductObjectForTable(
          currObject,
          productDetailMatch,
          oemList,
          altIndexList
        )
      );
    });

    // Add all Supplier from Database to SupplierList
    try {
      await fillSupplierTextBoxDataList(socket);
    } catch (error) {
      console.error("An error occurred:", error);
      return;
    }
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

  // Hide Supplier and OEM List Column (Only used for searching)
  const supplierListIndex = 9;
  const oemListIndex = 10;
  table.column(supplierListIndex).visible(false, false);
  table.column(oemListIndex).visible(false, false);
  table.columns.adjust().draw(false);

  $(`${tableName}_filter`).remove();
  $(".dataTables_length").css("padding-bottom", "1%");
  table.rows.add(productObjectList).draw(false);
  table.columns().search("").draw();

  hideLoadingScreen();

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
    if (formSelected === "new")
      isFormFilled &= Boolean(
        // 18 is length of ID generated
        statusVal && oemTypeVal && idVal != researchIdPlaceHolder
      );
    // Extra validation on import product form (File is uploaded)
    else if (formSelected === "import") isFormFilled &= Boolean(fileVal);
    // Extra validation on edit product form (ID is not empty)
    else if (formSelected === "edit") {
      isFormFilled = Boolean(statusVal && oemTypeVal);
      incompleteMessage = "Please have all fields filled before saving";
    }

    // On Form not filled properly, show alert and exit
    if (!isFormFilled) {
      showAlert(`<strong>Error!</strong> ${incompleteMessage}.`);
      return;
    }

    // Import Form Save
    if (formSelected === "import") {
      // Optional Column header name
      let isSkuEmpty = skuVal.trim().length === 0;
      let isStatusEmpty = statusVal.trim().length === 0;
      let isOemCategoryEmpty = oemTypeVal.trim().length === 0;
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
      const jsonSheet = await readFileToJson("#importFile", columnHeaders);

      // Check if file is empty or blank (no data), exit and alert if true
      if (jsonSheet === undefined || jsonSheet.length === 0) {
        showAlert(
          `<strong>Error!</strong> <i>${$("input[type=file]")
            .val()
            .split("\\")
            .pop()}</i> File is empty or blank.`
        );
        return;
      }

      let missingHeader = findMissingColumnHeader(jsonSheet[0], [
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
      // TODO: Inform user if there are any duplicate IC Number + Part Type Code in the file
      // TODO: Inform user for changes/updates to values. (e.g. Status, OEM, etc.) can be done with colors and tooltips.
      // Put map data into Object List
      // const updatedRows = [];
      const importProducts = jsonSheet
        .map((row) => {
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
          let type = "new";
          let tableDatabase = "NewProduct";
          // TODO: Test this
          // Check if imported data is in ProductHistoryRequest, if yes, change type to update and table to Product
          const productReq = findProductInProductRequestHistory(
            productReqHistWorkflowArray,
            newObject
          );
          let isNew = true;
          if (productReq) {
            type = "edit";
            isNew = false;
            newObject.Id = productReq.researchIdentifier;

            if (productReq.productStockNumber) {
              showAlert(
                "WARNING: Duplicate SKU found in file. Products in Pinnacle will not update the uneditable data."
              );
              tableDatabase = "Product";
            }
          }

          // Store each new row locally
          changesMade.push(
            new Map([
              ["type", type],
              ["id", newObject.Id],
              ["user", user],
              ["table", tableDatabase],
              ["changes", type == "new" ? [newObject] : newObject],
            ])
          );

          // if New Product, return newObject, else return nothing
          if (isNew) return newObject;
          // Find row by SKU
          let rowIndex;
          let rowObject = table
            .row((idx, data) => {
              if (
                data.Sku &&
                productReq.productStockNumber &&
                data.Sku.toUpperCase() ===
                  productReq.productStockNumber.toUpperCase()
              ) {
                rowIndex = idx;
                return true;
              }
              return false;
            })
            .data();
          // Find row by Research ID if SKU not found
          if (!rowObject) {
            rowObject = table
              .row((idx, data) => {
                rowIndex = idx;
                if (
                  data.Id &&
                  productReq.researchIdentifier &&
                  data.Id.toUpperCase() ===
                    productReq.researchIdentifier.toUpperCase()
                ) {
                  rowIndex = idx;
                  return true;
                }
                return false;
              })
              .data();
          }
          // Row found by SKU
          console.log(rowObject);
          // Update rowBySku values based on newObject
          if (!isStatusEmpty) rowObject.Status = newObject.Status;
          if (!isOemCategoryEmpty) rowObject.Oem = newObject.Oem;
          // Update Row in table
          table.row(rowIndex).data(rowObject).invalidate();
          // Add updated row to the array
          // updatedRows.push({ idx: rowIndex, data: rowObject });

          return;
        })
        // Filter out undefined objects
        .filter((obj) => obj);

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
      // console.log(importProducts);
      // console.log(importProducts.length);

      // console.log(updatedRows);
      // Update rows in table
      // updatedRows.forEach((row) => {
      //   table.row(row.idx).data(row.data).invalidate();
      // });
      // Add new import data to table
      table.rows.add(importProducts).draw();
      // Exit Row
      exitPopUpForm(formSelected);
    }
    // New Form Save
    else if (formSelected === "new") {
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
    else if (formSelected === "edit") {
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
    } else if (icNum.length === 0 || typeCode.length === 0) {
      // Clear the product ID if any input field is empty or has less than 3 characters
      $("#ID").text(researchIdPlaceHolder);
    }
  });

  //#endregion
});

/**
 * Fills the supplier text box data list by fetching supplier data from the database.
 *
 * @param {Socket} socket - The socket connection to the database.
 * @returns {Promise<Array>} - A promise that resolves to an array of supplier data.
 * @throws {Error} - If there is an error while fetching the supplier data.
 */
async function fillSupplierTextBoxDataList(socket) {
  let supplierList;
  try {
    supplierList = await fetchSupplierFromDatabase(socket);
  } catch (error) {
    // Error handled in fetchSupplierFromDatabase
    throw error;
  }

  // Fill in Search by Bars
  supplierList.forEach((supplier) => {
    $("#supplierList").append(
      $("<option>")
        .attr("value", supplier.SupplierNumber)
        .text(`${supplier.SupplierNumber} : ${supplier.SupplierName}`)
    );
  });
  return supplierList;
}

/**
 * Fills the OEM text box data list.
 * @param {Socket} socket - The socket object.
 * @returns {Promise<Array>} - The list of OEMs.
 * @throws {Error} - If there is an error fetching the OEMs from the database.
 */
async function fillOemTextBoxDataList(socket) {
  let oemList;
  try {
    oemList = await fetchOemFromDatabase(socket);
  } catch (error) {
    // Error handled in fetchOemFromDatabase
    throw error;
  }

  // Fill in Search by Bars
  oemList.forEach((oemObject) => {
    $("#oemList").append(
      $("<option>").attr("value", oemObject.Oem).text(oemObject.Oem)
    );
  });
  return oemList;
}

/**
 * Creates a product object for the table.
 *
 * @param {Object} currentProductObject - The current product object.
 * @param {Object} productDetailMatch - The product detail match.
 * @param {Array} oemList - The OEM list.
 * @param {Array} altIndexList - The alternate index list.
 * @returns {ProductDto} The created product object.
 */
function createProductObjectForTable(
  currentProductObject,
  productDetailMatch,
  oemList,
  altIndexList
) {
  let oemProductList = [];
  let altIndexProductList = new Set();
  // Add VendorId (Supplier Number) to Supplier List if VendorId  is not empty
  if (currentProductObject.vendorId)
    altIndexProductList.add(
      String(currentProductObject.vendorId).toUpperCase()
    );

  // When productDetailMatch does exist
  if (productDetailMatch) {
    // Filter OEM List by their SKU or ResearchID to match Product's
    const filteredOemList = oemList.filter((oemObject) => {
      const sku = oemObject.Sku;
      const researchId = oemObject.ResearchID;

      if (
        sku &&
        productDetailMatch.SKU &&
        sku.toUpperCase() === productDetailMatch.SKU.toUpperCase()
      )
        return true;

      if (
        researchId &&
        productDetailMatch.ResearchID &&
        researchId.toUpperCase() === productDetailMatch.ResearchID.toUpperCase()
      )
        return true;

      return false;
    });

    oemProductList = filteredOemList.map((oemObject) => oemObject.Oem);

    // Add Supplier Numbers from Oem Database to altIndexProductList
    filteredOemList.forEach((oemObject) =>
      altIndexProductList.add(oemObject.SupplierNumber)
    );
    // Filter Alternate Index List by their SKU or ResearchID to match Product's
    const filteredAltIndexList = altIndexList.filter((altIndex) => {
      const sku = altIndex.Sku;
      const researchId = altIndex.ResearchID;

      if (
        sku &&
        productDetailMatch.SKU &&
        sku.toUpperCase() === productDetailMatch.SKU.toUpperCase()
      )
        return true;

      if (
        researchId &&
        productDetailMatch.ResearchID &&
        researchId.toUpperCase() === productDetailMatch.ResearchID.toUpperCase()
      )
        return true;

      return false;
    });

    filteredAltIndexList.forEach((altIndex) =>
      altIndexProductList.add(altIndex.SupplierNumber)
    );
  }
  return new ProductDto(
    productDetailMatch
      ? productDetailMatch.ResearchID
      : currentProductObject.researchIdentifier,
    currentProductObject.productStockNumber,
    currentProductObject.vehicleManufacturers.split("\r").join("; "),
    currentProductObject.vehicleModels.split("\r").join("; "),
    currentProductObject.partTypeFriendlyName,
    currentProductObject.interchangeVersion
      ? `${currentProductObject.interchangeNumber.trim()} ${
          currentProductObject.interchangeVersion
        }`
      : currentProductObject.interchangeNumber.trim(),
    currentProductObject.interchangeDescriptions
      ? currentProductObject.interchangeDescriptions.split("\r").join("; ")
      : "",
    productDetailMatch ? productDetailMatch.Status : "",
    productDetailMatch ? productDetailMatch.OemType : "",
    Array.from(altIndexProductList),
    oemProductList,
    currentProductObject.partTypeCode
  );
}

/**
 * Finds a product in the product request history based on the given criteria.
 * @param {Array} productReqHistWorkflowArray - The array of product request history objects.
 * @param {Object} newProductObject - The new product object to search for.
 * @returns {Object|undefined} - The found product request object, or undefined if not found.
 */
function findProductInProductRequestHistory(
  productReqHistWorkflowArray,
  newProductObject
) {
  return productReqHistWorkflowArray.find((productReq) => {
    const sku = productReq.productStockNumber;
    const ic_PartType =
      productReq.interchangeNumber +
      productReq.interchangeVersion +
      productReq.partTypeCode;
    const objectIc_PartType = String(newProductObject.Num).replace(/\s/g, "");
    +newProductObject.TypeCode;
    if (
      sku &&
      newProductObject.Sku &&
      productReq.productStockNumber.toLowerCase() ===
        newProductObject.Sku.toLowerCase()
    )
      return true;

    if (ic_PartType.toLowerCase() === objectIc_PartType.toLowerCase())
      return true;

    return false;
  });
}
