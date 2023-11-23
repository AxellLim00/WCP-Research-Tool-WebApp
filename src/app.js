import express from "express";
const app = express();
import { createServer } from "http";
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server);
const PORT = process.env.PORT || 5000;
import path from "path";
import { authenticate, getAllProduct } from "./utils/workflow.js";
import { FreeCurrencyAPI } from "./utils/class/freeCurrencyAPI.js";
const freeCurrencyAPI = new FreeCurrencyAPI();
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// run server using "npm run dev"
app.use(express.static(path.join(__dirname + "/../public")));

app.get("/", (_, res) => {
  res.sendFile("public/html/login.html");
});

app.get("/research-tool", (_, res) => {
  res.sendFile(path.join(__dirname + "/../public/html/layout.html"));
});

io.on("connect", async function (socket) {
  console.log("A user has connected.");
  const credentials = socket.handshake.auth;
  if (Object.keys(credentials).length) {
    const response = await authenticate(
      credentials.username,
      credentials.password
    );
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

  socket.on("get all currency", async (callback) => {
    var responseJSON;
    await freeCurrencyAPI
      .latest({
        base_currency: "AUD",
      })
      .then((response) => {
        responseJSON = response;
      });
    callback(responseJSON);
  });
});

server.listen(PORT, () => {
  console.log(`Listen on *:${PORT} for http://localhost:5000`);
});
