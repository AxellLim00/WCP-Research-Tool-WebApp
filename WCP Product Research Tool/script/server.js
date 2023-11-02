import http from "http";
import fs from "fs";

var server = http.createServer(function (request, response) {
  if (req.url === "/" || req.url.startsWith("/")) {
    // Redirect to "/login"
    res.writeHead(302, { Location: "/login" });
    res.end();
  } else if (req.url === "/login") {
    // Read the HTML file and serve it
    fs.readFile("login.html", (err, data) => {
      if (err) {
        // Handle errors (e.g., file not found)
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        // Set the response header
        res.writeHead(200, { "Content-Type": "text/html" });

        // Send the HTML content as the response
        res.end(data);
      }
    });
  } else if (req.url === "/tool") {
    // Read the HTML file and serve it
    fs.readFile("layout.html", (err, data) => {
      if (err) {
        // Handle errors (e.g., file not found)
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        // Set the response header
        res.writeHead(200, { "Content-Type": "text/html" });

        // Send the HTML content as the response
        res.end(data);
      }
    });
  }
});

const port = 5000;
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
