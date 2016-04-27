var sha1 = require("sha1")

var maxPort = 65535, minPort = 10001

function hashPort(word) {
  var hash = parseInt(sha1(word).slice(0, 6), 16)
  return (hash % (maxPort - minPort)) + minPort
}

var args = process.argv, port = 8000, word = null, cache = Object.create(null)
for (var i = 2; i < args.length; i++) {
  var arg = args[i]
  if (arg == "--port") port = +args[++i]
  else if (arg == "--define") define(args[++i])
  else if (arg == "--help") usage(0)
  else if (word == null && arg[0] != "-") word = arg
  else usage(1)
}

function usage(status) {
  console.log("Usage: localport WORD\nUsage: localport [--port PORT] [--define WORD:PORT]")
  process.exit(status)
}

function define(expr) {
  var parsed = /^(\w+):(\d+)$/.exec(expr)
  if (!parsed) usage(1)
  cache[parsed[1]] = +parsed[2]
}

if (word != null) {
  console.log(hashPort(word))
  process.exit(0)
}

var httpProxy = require("http-proxy"), http = require("http")

var proxy = httpProxy.createProxyServer()

http.createServer(function(req, resp) {
  var subdomain = /^([^\.]+)/.exec(req.headers.host)[1]
  var port = cache[subdomain] || (cache[subdomain] = hashPort(subdomain))
  var target = "http://localhost:" + port
  proxy.web(req, resp, {target: target})
}).listen(port, "localhost")

proxy.on("error", function (err, req, res) {
  res.writeHead(500, {"Content-Type": "text/plain"})
  res.end("Request failed: " + err)
})
