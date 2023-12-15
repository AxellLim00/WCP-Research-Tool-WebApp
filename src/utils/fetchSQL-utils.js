/**
 * Fetch All Oem from SQL Database
 * @param {SocketIO.Socket} socket SocketIO socket
 * @param {String} productID Product ID to fetch from database (default: All)
 * @returns {Promise<Object>} Return Array of OEM or Array of error
 */
export async function fetchOemFromDatabase(socket, productID = "All") {
  return new Promise((resolve, reject) => {
    socket.emit("get object database", "Oem", productID, (ackData) => {
      if (ackData.status === "OK") {
        resolve(ackData.result);
      } else {
        console.log(
          `Error Occurred on getting Period data from Database: ${ackData.error
            .map((err) => `${err.code}: ${err.name}`)
            .join("\n")}`
        );
        showAlert(
          `Error Occurred on getting Period data from Database: ${ackData.error
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
 * @returns {Promise<Object>} Return Array of product data or Array of error
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
 * Fetch All Alternate Index from SQL Database
 * @param {SocketIO.Socket} socket SocketIO socket
 * @param {String} productID Product ID to fetch from database (default: All)
 * @returns {Promise<Object>} Return Array of Alternate Index data or Array of error
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
          console.log(
            `Error Occurred on getting Period data from Database: ${ackData.error
              .map((err) => `${err.code}: ${err.name}`)
              .join("\n")}`
          );
          showAlert(
            `Error Occurred on getting Period data from Database: ${ackData.error
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
 * @returns {Promise<Object>} Return Array of One Product Detail or Array of Error
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
      }
    );
  });
}
