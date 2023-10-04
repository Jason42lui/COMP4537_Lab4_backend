const http = require("http");
const url = require("url");

let dictionary = {};

let count = 0;

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
      count++;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          responseText: `Request #"${count}"\n\n Definition: "${word_status}"`,
        })
      );
      return;
    } else {
      count++;
      res.writeHead(404, { "Content-Type": "application/json" }); 
      res.end(
        JSON.stringify({
          responseText: `Request #"${count}"\n\n Word not found in the dictionary`,
        })
      );
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
          count++;
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              responseText: `Request #"${count}"\n\nWarning! '${word}' already exists`,
            })
          );
        } else {
          count++;
          dictionary[word] = definition;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              responseText: `Request #${count}\n\nNew entry recorded:\n\n"${word} : ${definition}"`,
            })
          );
          console.log("dict", dictionary);
          return;
        }
      }
    });
  }
});

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server Listening on ${PORT}`))