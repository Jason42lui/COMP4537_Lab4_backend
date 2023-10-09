const http = require("http");
const url = require("url");
const port = process.env.PORT || 3000;

// Defining Word Class
class Word {
  constructor(word, definition) {
    this.word = word;
    this.definition = definition;
  }
}
// Initializing an empty dictionary and count variable
let dictionary = [];
let count = 0;

// Initialize HTTP server method, which is passing callback fucntion for incoming requests.
const server = http.createServer(function (req, res) {
  // Parsing URL
  let q = url.parse(req.url, true);
  // Handeling CORS preflight request and checks if the server is receiving CORS
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  
  // GET request with /api/ endpoint for calling the URL
  if (req.method === "GET" && q.pathname === "/api/") {
    // CORS header to allow request from anywhere "*"
    res.setHeader("Access-Control-Allow-Origin", "*");
    const word = q.query.word;
    // Search in the dictionary array that matches with the requested word. Find looks for the word and see if it matches with the requested word.
    const word_status = dictionary.find(entry => entry.word === word);
    console.log("word", word);
    console.log("wordstatus", word_status);
    // Good response for the JSON object for the requested word
    if (word_status) {
      count++;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          responseText: `Request #"${count}"\n\n Definition: "${word_status.definition}"`,
        })
      );
      return;
    } else {
      // Bad response for the JSON object for the requested word
      count++;
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          responseText: `Request #"${count}"\n\n Word not found in the dictionary`,
        })
      );
      return;
    }
    // POST request with /api/ endpoint
  } else if (req.method === "POST" && q.pathname === "/api/") {
    // Empty String to store new request body
    let body = "";

    // Listening if request body receives any data chucks
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    // Received request bdoy will set the CORS header to allow anyone
    req.on("end", () => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      const params = JSON.parse(body);
      const word = params.word;
      const definition = params.definition;

      console.log(params);
      console.log(word);

      // Checks for invalid input empty word, definiation, or word is a digit. (Already done in front end)
      if (!word || !definition || /\d/.test(word)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ responseText: "Invalid input" }));
        return;
      } else {
        // Checking if the word exists in the dictionary
        const wordExists = dictionary.some(entry => entry.word === word);
        // If it is, send a response to front-end as a warning msg
        if (wordExists) {
          count++;
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              responseText: `Request #"${count}"\n\nWarning! '${word}' already exists`,
            })
          );
        } else {
          // if words is not found, add it to the dictionary
          count++;
          const newWord = new Word(word, definition);
          dictionary.push(newWord);
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

// Start server and listen to 3000 port
server.listen(port, () => console.log(`Server Listening on ${port}`));
