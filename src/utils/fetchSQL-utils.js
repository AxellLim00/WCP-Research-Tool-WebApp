/**
 * Fetch All Oem from SQL Database
 * @param {SocketIO.Socket} socket SocketIO socket
 * @param {String} [productID="All"] Product ID to fetch from database (default: All)
 * @returns {Promise<Array>} Return Array of OEM data
 * @throws {Error} - An array of error objects if an error occurs during the fetch operation.
 */
export async function fetchOemFromDatabase(socket, productID = "All") {
  return new Promise((resolve, reject) => {
    socket.emit("get object database", "Oem", productID, (ackData) => {
      if (ackData.status === "OK") {
        resolve(ackData.result);
      } else {
        console.log(
          `Error Occurred on getting Oem data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        showAlert(
          `Error Occurred on getting OEM data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        reject(ackData.error);
      }
    });
  });
}

/**
 * Fetch All Product Details from SQL Database
 * @param {SocketIO.Socket} socket SocketIO socket
 * @returns {Promise<Array>} Return Array of product data
 * @throws {Error} - An array of error objects if an error occurs during the fetch operation.
 */
export async function fetchProductDataFromDatabase(socket) {
  return new Promise((resolve, reject) => {
    socket.emit("get object database", "Product", "", (ackData) => {
      if (ackData.status === "OK") {
        resolve(ackData.result);
      } else {
        console.log(
          `Error Occurred on getting Product data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        showAlert(
          `Error Occurred on getting Product data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        reject(ackData.error);
      }
    });
  });
}

/**
 * Fetches alternate index data from the database.
 *
 * @param {SocketIO.Socket} socket - The socket object for communication with the server.
 * @param {string} [productID="All"] - The product ID to fetch alternate index data for. Defaults to "All".
 * @returns {Promise<Array>} - A promise that resolves with the fetched alternate index data.
 * @throws {Error} - An array of error objects if an error occurs during the fetch.
 */
export async function fetchAltIndexFromDatabase(socket, productID = "All") {
  return new Promise((resolve, reject) => {
    socket.emit(
      "get object database",
      "AlternateIndex",
      productID,
      (ackData) => {
        if (ackData.status === "OK") {
          resolve(ackData.result);
        } else {
          console.error(
            `Error Occurred on getting Alt Index data from Database: ${ackData.error
              .map((err) => `${err.code}: ${err.name}`)
              .join("\n")}`
          );
          showAlert(
            `Error Occurred on getting Alternate Index data from Database: ${ackData.error
              .map((err) => `${err.code}: ${err.name}`)
              .join("\n")}`
          );
          reject(ackData.error);
        }
      }
    );
  });
}

/**
 * Fetch Product Detail from SQL Database by Product ID (ResearchID or SKU)
 * @param {SocketIO.Socket} socket SocketIO socket
 * @returns {Promise<Array>} Return Array of One Product Detail
 * @throws {Error} - An array of error objects if an error occurs during the fetch operation.
 */
export async function fetchProductDetailFromDatabase(socket, productID) {
  return new Promise((resolve, reject) => {
    socket.emit(
      "get object database",
      "Product Detail",
      productID,
      (ackData) => {
        if (ackData.status === "OK") {
          resolve(ackData.result);
        } else {
          console.log(
            `Error Occurred on getting Product Detail data from Database: ${ackData.error
              .map((err) => `${err.code}: ${err.name}`)
              .join("\n")}`
          );
          showAlert(
            `Error Occurred on getting Product Detail data from Database: ${ackData.error
              .map((err) => `${err.code}: ${err.name}`)
              .join("\n")}`
          );
          reject(ackData.error);
        }
      }
    );
  });
}

/**
 * Fetch All Supplier from SQL Database
 * @param {SocketIO.Socket} socket SocketIO socket
 * @param {String} productID Product ID to fetch from database (default: All)
 * @returns {Promise<Array>} Return Array of Alternate Index data
 * @throws {Error} - An array of error objects if an error occurs during the fetch operation.
 */
export async function fetchSupplierFromDatabase(socket) {
  return new Promise((resolve, reject) => {
    socket.emit("get object database", "Supplier", "", (ackData) => {
      if (ackData.status === "OK") {
        resolve(ackData.result);
      } else {
        console.error(
          `Error Occurred on getting Supplier data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        showAlert(
          `Error Occurred on getting Supplier data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        reject(ackData.error);
      }
    });
  });
}

/**
 * Fetch All KType from SQL Database
 * @param {SocketIO.Socket} socket SocketIO socket
 * @param {String} productID Product ID to fetch from database (default: All)
 * @returns {Promise<Array>} Return Array of KType
 * @throws {Error} - An array of error objects if an error occurs during the fetch operation.
 */
export async function fetchKTypeFromDatabase(socket, productID) {
  return new Promise((resolve, reject) => {
    socket.emit("get object database", "KeyType", productID, (ackData) => {
      if (ackData.status === "OK") {
        resolve(ackData.result);
      } else {
        console.log(
          `Error Occurred on getting Key Type data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        showAlert(
          `Error Occurred on getting Key Type data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        reject(ackData.error);
      }
    });
  });
}

/**
 * Fetch All EPID from SQL Database
 * @param {SocketIO.Socket} socket SocketIO socket
 * @param {String} productID Product ID to fetch from database (default: All)
 * @returns {Promise<Array>} Return Array of EPID
 * @throws {Error} - An array of error objects if an error occurs during the fetch operation.
 */
export async function fetchEpidFromDatabase(socket, productID) {
  return new Promise((resolve, reject) => {
    socket.emit("get object database", "EPID", productID, (ackData) => {
      if (ackData.status === "OK") {
        resolve(ackData.result);
      } else {
        console.log(
          `Error Occurred on getting ePID data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        showAlert(
          `Error Occurred on getting ePID data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        reject(ackData.error);
      }
    });
  });
}

/**
 * Fetches user data from the database using the provided socket.
 * @param {SocketIO.Socket} socket - The socket connection to the server.
 * @returns {Promise<Array<Object>>} - A promise that resolves with an array of user data objects.
 * @throws {Error} - An array of error objects if an error occurs during the fetch operation.
 */
export async function fetchUserDataFromDatabase(socket) {
  return new Promise((resolve, reject) => {
    socket.emit("get object database", "Users", "", (ackData) => {
      if (ackData.status === "OK") {
        resolve(ackData.result);
      } else {
        console.log(
          `Error Occurred on getting User data from Database: ${ackData.error.code}: ${ackData.error.name}`
        );
        showAlert(
          `Error Occurred on getting User data from Database: ${ackData.error.code}: ${ackData.error.name}`
        );
        reject(ackData.error);
      }
    });
  });
}
