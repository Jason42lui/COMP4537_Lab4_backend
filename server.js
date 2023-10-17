const http = require("http");
const url = require("url");
const port = process.env.PORT || 3000;

const OPTIONS_STRING = "OPTIONS";
const POST_STRING = "POST";
const GET_STRING = "GET";
const ACCESS_CONTROL_ORIGIN_STRING = "Access-Control-Allow-Origin";
const ACCESS_CONTROL_METHODS_STRING = "Access-Control-Allow-Methods";
const ACCESS_CONTROL_HEADERS_STRING = "Access-Control-Allow-Headers";
const STAR_STRING = "*";
const CONTENT_TYPE_STRING = "Content-Type";
const APPLICATION_JSON_STRING = "application/json";
const API_STRING = "/api/";
const DATA_STRING = "data";
const END_STRING = "end";
const INVALID_INPUT_STRING = "Invalid input";

// Defining Word Class
class Word {
  constructor(word, definition) {
    this.word = word;
    this.definition = definition;
  }
}

// Initializing an empty dictionary and count variable
const dictionary = [];
let count = 0;

// Initialize HTTP server method, which is passing callback function for incoming requests.
const server = http.createServer(function (req, res) {
  // Parsing URL
  const q = url.parse(req.url, true);

  // Handling CORS preflight request and checks if the server is receiving CORS
  if (req.method === OPTIONS_STRING) {
    res.writeHead(200, {
      [ACCESS_CONTROL_ORIGIN_STRING]: STAR_STRING,
      [ACCESS_CONTROL_METHODS_STRING]: POST_STRING,
      [ACCESS_CONTROL_HEADERS_STRING]: CONTENT_TYPE_STRING,
    });
    res.end();
    return;
  }

  // GET request with /api/ endpoint for calling the URL
  if (req.method === GET_STRING && q.pathname === API_STRING) {
    // CORS header to allow request from anywhere "*"
    res.setHeader(ACCESS_CONTROL_ORIGIN_STRING, "*");
    const word = q.query.word;
    // Search in the dictionary array that matches with the requested word. Find looks for the word and see if it matches with the requested word.
    const word_status = dictionary.find((entry) => entry.word === word);

    // Good response for the JSON object for the requested word
    if (word_status) {
      count++;
      res.writeHead(200, { CONTENT_TYPE_STRING: APPLICATION_JSON_STRING });
      res.end(
        JSON.stringify({
          responseText: `Request #"${count}"\n\n Definition: "${word_status.definition}"`,
        })
      );
      return;
    } else {
      // Bad response for the JSON object for the requested word
      count++;
      res.writeHead(404, { CONTENT_TYPE_STRING: APPLICATION_JSON_STRING });
      res.end(
        JSON.stringify({
          responseText: `Request #"${count}"\n\n Word not found in the dictionary`,
        })
      );
      return;
    }
  } else if (req.method === POST_STRING && q.pathname === API_STRING) {
    // Empty String to store new request body
    let body = "";

    // Listening if request body receives any data chunks
    req.on(DATA_STRING, (chunk) => {
      body += chunk.toString();
    });

    // Received request body will set the CORS header to allow anyone
    req.on(END_STRING, () => {
      res.setHeader(ACCESS_CONTROL_ORIGIN_STRING, STAR_STRING);
      const params = JSON.parse(body);
      const word = params.word;
      const definition = params.definition;

      console.log(params);
      console.log(word);

      // Checks for invalid input empty word, definition, or word is a digit. (Already done in front end)
      if (!word || !definition || /\d/.test(word)) {
        res.writeHead(400, { CONTENT_TYPE_STRING: APPLICATION_JSON_STRING });
        res.end(JSON.stringify({ responseText: INVALID_INPUT_STRING }));
        return;
      } else {
        // Checking if the word exists in the dictionary
        const wordExists = dictionary.some((entry) => entry.word === word);

        // If it is, send a response to front-end as a warning message
        if (wordExists) {
          count++;
          res.writeHead(200, { CONTENT_TYPE_STRING: APPLICATION_JSON_STRING });
          return res.end(
            JSON.stringify({
              responseText: `Request #"${count}"\n\nWarning! '${word}' already exists`,
            })
          );
        } else {
          // if word is not found, add it to the dictionary
          count++;
          const newWord = new Word(word, definition);
          dictionary.push(newWord);
          res.writeHead(200, { CONTENT_TYPE_STRING: APPLICATION_JSON_STRING });
          res.end(
            JSON.stringify({
              responseText: `Request #${count}\n\nNew entry recorded:\n\n"${word} : ${definition}"`,
            })
          );
          return;
        }
      }
    });
  }
});

// Start server and listen to 3000 port
server.listen(port, () => console.log(`Server Listening on ${port}`));
