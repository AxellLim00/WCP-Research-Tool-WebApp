const axios = require("axios");
const fs = require("fs");

const baseUrl = "https://workflow.wholesalecarparts.com.au/api";
const logFilePath = "./axios.log";
// Create a writable stream to the log file
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
// Custom logger function that writes to the file
const customLogger = (level, ...messages) => {
  const formattedMessage = `[${level}] ${new Date().toISOString()} - ${messages.join(
    " "
  )}\n`;
  logStream.write(formattedMessage);
};
// Set the custom logger for Axios
axios.defaults.logger = customLogger;

module.exports.authenticate = async function (
  applicationName,
  applicationSecret
) {
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
};

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
module.exports.searchProduct = searchProduct;

module.exports.getAllProduct = async function (
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
  // console.log("Getting First Page...");
  // // Get first page
  // let promiseResponse = await searchProduct(
  //   token,
  //   1,
  //   500,
  //   partTypeCode,
  //   interchangeNumber,
  //   interchangeVersion
  // );
  // // Get all products
  // if (
  //   isGetAll &&
  //   promiseResponse.data.currentPage === 1 &&
  //   promiseResponse.data.pageSize < promiseResponse.data.recordCount
  // ) {
  //   let loopsToGetTotal = Math.ceil(
  //     promiseResponse.data.recordCount / promiseResponse.data.pageSize
  //   );
  //   // let loadingMessage = $(".loading p").text();
  //   // Update Loading screen message
  //   console.log(`Loading ${1}/${loopsToGetTotal}`);
  //   // skip first iteration
  //   for (let i = 2; i <= loopsToGetTotal; i++) {
  //     let response = await searchProduct(
  //       token,
  //       i,
  //       500,
  //       partTypeCode,
  //       interchangeNumber,
  //       interchangeVersion
  //     );
  //     let toAdd = response.data.records;
  //     jsonArray.push(...toAdd);
  //     console.log(`Loading ${i}/${loopsToGetTotal}`);
  //   }
  //   // Return loading screen text
  // }
  // // return list of
  // return jsonArray;
};
