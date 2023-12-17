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
 * @returns {Promise<Object>} Return Array of Alternate Index data or Array of error
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
 * @returns {Promise<Object>} Return Array of KType or Array of error
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
 * @returns {Promise<Object>} Return Array of EPID or Array of error
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
