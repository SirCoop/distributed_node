// warning: Not as efficient as using a Reverse Proxy

const zlib = require('zlib');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const raw = fs.createReadStream(path.join(__dirname, '/test-index.html'));
    const acceptEncoding = req.headers['accept-encoding'] || '';
    res.setHeader('Content-Type', 'text/plain');
    console.log('acceptEncoding: ', acceptEncoding);

    if (acceptEncoding) {
        console.log('encoding with gzip');
        res.setHeader('Content-Encoding', 'gzip');
        raw.pipe(zlib.createGzip()).pipe(res);
    } else {
        console.log('no encoding');
        raw.pipe(res);
    }
});

server.listen(process.env.PORT || 1337);

