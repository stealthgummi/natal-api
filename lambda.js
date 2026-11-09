const http = require('http');
const { Readable, Writable } = require('stream');

let capturedServer = null;
const origCreateServer = http.createServer;
http.createServer = function(...args) {
  const s = origCreateServer.apply(this, args);
  capturedServer = s;
  return s;
};
http.Server.prototype.listen = function() { return this; };

const mod = require('./server');
const server = (mod && typeof mod.emit === 'function') ? mod : capturedServer;

exports.handler = async (event, context) => {
  return new Promise((resolve) => {
    const httpContext = (event.requestContext && event.requestContext.http) || {};
    const method = httpContext.method || event.httpMethod || 'GET';
    const proxyPath = (event.pathParameters && event.pathParameters.proxy) ? ('/' + event.pathParameters.proxy) : null;
    const path = proxyPath || event.rawPath || event.path || '/';
    let queryString = '';
    if (event.rawQueryString) {
      queryString = '?' + event.rawQueryString;
    } else if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
      queryString = '?' + new URLSearchParams(event.queryStringParameters).toString();
    }
    const url = path + queryString;

    const req = new Readable({
      read() {
        if (event.body) {
          const bodyBuf = event.isBase64Encoded 
            ? Buffer.from(event.body, 'base64') 
            : Buffer.from(event.body, 'utf-8');
          this.push(bodyBuf);
        }
        this.push(null);
      }
    });

    req.method = method;
    req.url = url;
    req.headers = {};
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) {
        req.headers[k.toLowerCase()] = v;
      }
    }
    if (event.body) {
      const str = event.isBase64Encoded 
        ? Buffer.from(event.body, 'base64').toString('utf-8')
        : event.body;
      try { req.body = JSON.parse(str); } catch (_) { req.body = str; }
    }

    const resHeaders = {};
    const chunks = [];

    const res = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
        callback();
      }
    });

    res.statusCode = 200;
    res.setHeader = (key, value) => { resHeaders[key.toLowerCase()] = value; };
    res.getHeader = (key) => resHeaders[key.toLowerCase()];
    res.writeHead = (code, headers) => {
      res.statusCode = code;
      if (headers) {
        for (const [k, v] of Object.entries(headers)) {
          resHeaders[k.toLowerCase()] = v;
        }
      }
    };
    res.end = function(chunk, encoding) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      res.emit('finish');
    };

    res.on('finish', () => {
      resolve({
        statusCode: res.statusCode,
        headers: resHeaders,
        body: Buffer.concat(chunks).toString('utf-8')
      });
    });

    server.emit('request', req, res);
  });
};
