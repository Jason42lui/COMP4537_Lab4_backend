const http = require("http");
const url = require("url");
const qs = require("querystring");

let dictionary = {};

const server = http.createServer(function (req, res) {
  let q = url.parse(req.url, true);
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && q.pathname === "/api/") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const word = q.query.word;
    const word_status = dictionary[word];
    console.log("word", word);
    console.log("wordstatus", word_status);

    if (word_status) {
      res.writeHead(200, "Content-Type", "application/json");
      res.end(JSON.stringify({ responseText: word_status }));
      return;
    } else {
      res.writeHead(404, "Content-Type", "application/json");
      res.end(JSON.stringify({ responseText: "Word not found" }));
      return;
    }
  } else if (req.method === "POST" && q.pathname === "/api/") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      const params = JSON.parse(body);
      const word = params.word;
      const definition = params.definition;

      console.log(params);
      console.log(word);

      if (!word || !definition || /\d/.test(word)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ responseText: "Invalid input" }));
        return;
      } else {
        if (dictionary[word]) {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              responseText: `Warning! '${word}' already exists`,
            })
          );
        } else {
          dictionary[word] = definition;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              responseText: `Request #${
                Object.keys(dictionary).length
              }\n\nNew entry recorded:\n\n"${word} : ${definition}"`,
            })
          );
          return;
        }
      }
    });
  }
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
