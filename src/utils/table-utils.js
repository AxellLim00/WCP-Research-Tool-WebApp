import $ from "jquery";
import "datatables.net";
import "../utils/tableExport-utils/tableExport.js";
import { showAlert } from "./html-utils.js";

/**
 * Gets empty rows for a html table based on rows and columns
 * @param {Number} rowQuantity How many empty rows to create
 * @param {Number} [columnQuantity=1] How many column are there in the table, default is 1
 * @returns {String} html \<tr\> rows
 */
export function createEmptyRow(rowQuantity, columnQuantity = 1) {
  return ("<tr>" + "<td></td>".repeat(columnQuantity) + "</tr>").repeat(
    rowQuantity
  );
}

/**
 * Find first missing header inside JSON Sheet
 * @param {Dictionary} rowObject First instance/element of JSON sheet (needs to contain headers)
 * @param {String[]} arrayHeader Array of header names to check
 * @returns {String} missing header name when found, otherwise empty string
 */
export function findMissingColumnHeader(rowObject, arrayHeader) {
  for (let header of arrayHeader) {
    if (header === null) {
      continue;
    }
    if (!rowObject.hasOwnProperty(header)) {
      return header;
    }
  }
  return "";
}

/**
 * Read XLSX and XLS file to JSON representation format/
 * @param {String} filenameInput HTML file input Id
 * @param {String[] | String[String[]]} columnHeader List of Column Header names or List of Worksheet's List of header (when located in different worksheet)
 * @param {Boolean} worksheetSeparated Defaults to false
 * @param {String[]} worksheetName  Defaults to empty list
 * @returns {Promise<Map> | undefined} Excel Worksheet data in JSON format when resolved, if fail to read or rejects returns undefined
 */
export async function readFileToJson(
  filenameInput,
  columnHeader,
  worksheetSeparated = false,
  worksheetName = []
) {
  // Read file
  const file = $(filenameInput).prop("files");
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = function () {
      const fileData = new Uint8Array(reader.result);
      const workbook = XLSX.read(fileData, { type: "array" });

      // Assuming the first sheet of the workbook is the relevant one
      if (!worksheetSeparated) {
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Get all header cell location
        let headerCell = [];
        // const SHEET_ARRAY = XLSX.utils.sheet_to_json(SHEET);
        for (let cellAddress in sheet)
          if (columnHeader.includes(String(sheet[cellAddress].v))) {
            headerCell.push(cellAddress);
          }
        // sort for index 0 to be the most top left cell
        headerCell.sort();
        if (headerCell.length === 0) {
          resolve([{ no_header_found: true }]);
          return;
        }

        //encode range
        let range = XLSX.utils.decode_range(sheet["!ref"]);
        range.s = XLSX.utils.decode_cell(headerCell[0]);
        let new_range = XLSX.utils.encode_range(range);
        // Fix with this solution https://github.com/SheetJS/sheetjs/issues/728
        resolve(
          XLSX.utils.sheet_to_json(sheet, {
            range: new_range,
          })
        );
      } else {
        let jsonData = [];
        let errorMessage = [];

        worksheetName.forEach((sheetName, index) => {
          if (!workbook.SheetNames.includes(sheetName)) {
            errorMessage.push(`Worksheet "${sheetName}" not found.`);
            return;
          }

          let worksheet = workbook.Sheets[sheetName];
          let worksheetData = XLSX.utils.sheet_to_json(worksheet, {
            header: columnHeader[index],
          });

          jsonData[sheetName] = worksheetData;
        });

        // If there is one or more error messages
        if (errorMessage.length) {
          showAlert(`<strong>ERROR!</strong> ${errorMessage.join(".\n")}`);
          resolve(undefined);

          return;
        }
        // Combine all worksheet data into one JSON object
        // Initialize an empty array to store the combined rows
        combinedData = [];

        // Iterate through the properties of the object, and find max row in object's property
        let properties = Object.keys(jsonData);
        let maxRows = Math.max(
          ...properties.map((prop) => jsonData[prop].length)
        );

        // Combine all properties into one JSON object
        for (let i = 0; i < maxRows; i++) {
          let combinedRow = {};

          for (const prop of properties) {
            let propArray = jsonData[prop];
            // Use an empty object if the property array is shorter

            let propObj = propArray[i] || {};
            combinedRow[prop] = propObj[prop];
          }

          combinedData.push(combinedRow);
        }

        // Clean up combinedData
        combinedData.forEach((obj) => {
          // Delete properties that are undefined
          Object.keys(obj).forEach(
            (key) => obj[key] === undefined && delete obj[key]
          );
        });

        resolve(combinedData);
      }
    };
    reader.onerror = function () {
      showAlert(`<strong>Error!</strong> File fail to load: ${reader.error}`);

      reject(undefined);
    };

    reader.readAsArrayBuffer(file[0]);
  });
}

/**
 * Exports the data from a table to an Excel file.
 * @param {string} tableID - The ID of the table to export.
 * @param {string} fileName - The name of the exported file.
 * @param {boolean} [isEmptyData=false] - Indicates if the table has no data.
 * @param {string[]} [worksheetNames=[]] - An array of worksheet names for multiple sheets in the Excel file.
 */
export function exportDataTable(
  tableID,
  fileName,
  isEmptyData = false,
  worksheetNames = []
) {
  if (isEmptyData) {
    showAlert("<strong>Error!</strong> No data found in table.");
  } else {
    let previousPageLength = $(tableID).DataTable().page.len();
    // redraw table with all row shown
    $(tableID).DataTable().page.len(-1).draw(false);
    let exportData = {
      type: "excel",
      fileName: fileName,
      mso: {
        fileFormat: "xlsx",
      },
      ignoreRow: ["#searchRow"],
    };
    if (worksheetNames.length > 0)
      exportData.mso["worksheetName"] = worksheetNames;
    // Export HTML table not DataTable
    $(tableID).tableExport(exportData);
    $(tableID).DataTable().page.len(previousPageLength).draw(false);
  }
}

/**
 * Delays the execution for the specified number of milliseconds.
 * @param {number} milliseconds - The number of milliseconds to delay.
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
