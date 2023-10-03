const http = require("http");
const url = require("url");

let dictionary = {};

const server = http.createServer(function (req, res) {
  let q = url.parse(req.url, true);
  console.log("q", q);
  console.log("q.pathname", q.pathname);
  console.log("q.query", q.query);

  if (req.method === "GET" && q.pathname === "/api/") {
    const word = q.query.word;
    const word_status = dictionary[word];
    console.log("word", word);
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");

    if (word_status) {
      res.writeHead(200, "Content-Type", "application/json");
      res.end(JSON.stringify(word_status));
    } else {
      res.writeHead(404, "Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Word not found" }));
    }
  } else if (req.method === "POST" && q.pathname === "/api/") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      console.log(params);
      const params = JSON.parse(body);
      const word = params.word;
      const definition = params.definition;

      if (!word || !definition || /\d/.test(word)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid input" }));
      } else {
        if (dictionary[word]) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: `Warning! '${word}' already exists` })
          );
        } else {
          dictionary[word] = definition;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: `Request #${
                Object.keys(dictionary).length
              }\n\nNew entry recorded:\n\n"${word} : ${definition}"`,
            })
          );
        }
      }
    });
  }
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
