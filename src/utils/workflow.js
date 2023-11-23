import axios from "axios";
import { createWriteStream } from "fs";

const baseUrl = "https://workflow.wholesalecarparts.com.au/api";
const logFilePath = "./axios.log";
// Create a writable stream to the log file
const logStream = createWriteStream(logFilePath, { flags: "a" });

export async function authenticate(applicationName, applicationSecret) {
  const requestBody = {
    ApplicationName: applicationName,
    ApplicationSecret: applicationSecret,
  };

  return await axios
    .post(`${baseUrl}/auth/authenticate`, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
    .then(function (response) {
      return {
        status: "authenticated",
        token: response.data.token,
      };
    })
    .catch(function (error) {
      return {
        status: "error",
        error: error,
      };
    });
}

/**
 * Get Search Product Request History from Workflow API
 * @param {Number} pageNo Defaults to 1 ~ Page number for search page request history
 * @param {Number} pageSize Defaults to 5000 ~ Number of Product for each page
 * @param {String} partTypeCode (optional) Type of part requested to filter products
 * @param {String} interchangeNumber (optional) interchangeNumber to filter products
 * @param {String} interchangeVersion (optional) interchangeVersion to filter products
 * @param {Boolean} isGetAll Flag to get all product requests
 * @returns List of ProductRequestHistoryDto
 */
async function searchProduct(
  token,
  pageNo = 1,
  pageSize = 500,
  partTypeCode = null,
  interchangeNumber = null,
  interchangeVersion = null
) {
  const requestBody = {
    InterchangeNumber: interchangeNumber,
    InterchangeVersion: interchangeVersion,
    PartTypeCode: partTypeCode,
    PageNo: pageNo,
    PageSize: pageSize,
  };
  try {
    const response = await axios.post(
      `${baseUrl}/request-history/search`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
}
const _searchProduct = searchProduct;
export { _searchProduct as searchProduct };

export async function getAllProduct(
  socket,
  token,
  partTypeCode = null,
  interchangeNumber = null,
  interchangeVersion = null
) {
  const defaultPageSize = 500;
  let pageNo = 1;
  var allProducts = [];

  while (true) {
    try {
      const response = await searchProduct(
        token,
        pageNo,
        defaultPageSize,
        partTypeCode,
        interchangeNumber,
        interchangeVersion
      );

      // Append the products from the current page to the result array
      allProducts.push(...response.data.records);

      const totalPages = Math.ceil(response.data.recordCount / defaultPageSize);

      socket.emit("loading progress", {
        page: pageNo,
        totalPages: totalPages,
        productsLoaded: allProducts.length,
        totalProducts: response.data.recordCount,
      });
      console.log(
        `Loaded page ${pageNo} of ${totalPages} with ${allProducts.length} of ${response.data.recordCount} products`
      );
      // Check if there are more pages
      if (response.data.records.length < defaultPageSize) {
        break; // Exit the loop if no more pages
      }

      // Move on to the next page
      pageNo++;
    } catch (error) {
      throw error;
    }
  }

  return allProducts;
}
