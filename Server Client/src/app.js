const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 5000;
const { join } = require("path");
const { authenticate, getAllProduct } = require("./utils/workflow");

// run server using "npm run dev"
app.use(express.static(join(__dirname + "/../public")));

app.get("/", (req, res) => {
  res.sendFile("public/html/login.html");
});

app.get("/research-tool", (req, res) => {
  res.sendFile(join(__dirname + "/../public/html/layout.html"));
});

io.on("connect", async function (socket) {
  console.log("A user has connected.");
  const credentials = socket.handshake.auth;
  if (Object.keys(credentials).length) {
    response = await authenticate(credentials.username, credentials.password);
    console.log(response);
    if (response.status == "authenticated") {
      console.log(`User ${credentials.username} has been Authenticated`);
      socket.emit("authenticated", response.token);
    } else {
      console.log(`User ${credentials.username} has Fail to be Authenticated`);
      socket.emit("fail authenticated", response.error);
    }
  }
  socket.on("disconnect", () => {
    console.log("A user disconnected.");
  });

  // socket.on("get all products", async (token, callback) => {
  //   console.log("Fetching products...");
  //   let promise = await getAllProduct(token);
  //   const fetchData = () => {
  //     promise.then(
  //       (result) => {
  //         console.log("Fetching successful");
  //         return {
  //           status: 200,
  //           data: result,
  //         };
  //       },
  //       (error) => {
  //         console.log("Fetching Failed", error.response.status);
  //         if (error.response && error.response.status === 401)
  //           return {
  //             status: 401,
  //             message:
  //               "Token has expired or invalidated. Bring user back to login page.",
  //           };
  //         console.error(
  //           "Error searching product request history:",
  //           error.message
  //         );
  //         // console.error(error);
  //         return {
  //           status: "error.response.status",
  //           message: `Error searching product request history: ${error.message}`,
  //           error: error,
  //         };
  //       }
  //     );
  //   };
  //   const fetch_Data_Promise = fetchData();
  //   fetch_Data_Promise.then((data) => {
  //     // Use the provided callback to send data back to the client
  //     callback(data);
  //   });
  // });
  socket.on("get all products", async (token, callback) => {
    console.log("Fetching products...");
    try {
      const result = await getAllProduct(socket, token);
      console.log("Fetching successful");
      const data = {
        status: 200,
        data: result,
      };
      callback(data);
    } catch (error) {
      console.log("Fetching Failed", error.status);
      let errorData;
      if (error.status === 401) {
        errorData = {
          status: 401,
          message:
            "Token has expired or invalidated. Bring user back to login page.",
        };
      } else {
        console.error(
          "Error searching product request history:",
          error.status,
          error.message
        );
        errorData = {
          status: error.status,
          message: `Error searching product request history: ${error.status} ${error.message}`,
          error: error,
        };
      }
      callback(errorData);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Listen on *:${PORT} for http://localhost:5000`);
});
