// warning: Not as efficient as using a Reverse Proxy
const server = require('fastify')();
const fetch = require('node-fetch');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';
const TARGET = process.env.TARGET || 'localhost:4000'; //target producer (server)
/**
 * I created this logger manually for pedagogical purposes
 * In reality, npm packages are better
 * e.g. @log4js-node/logstashudp
 */
const log = require('./logstash.js');

(async () => {
    await server.register(require('middie'));
    
    // this middleware mimicks access log for traditional web server
    server.use((req, res, next) => {
        log('info', 'request-incoming', {
            path: req.url,
            method: req.method,
            ip: req.ip,
            ua: req.headers['user-agent'] || null
        });
        next();
    });

    server.setErrorHandler(async (err, req) => {
        log('error', 'request-failure', {
            stack: err.stack,
            path: req.url,
            method: req.method
        });
        return { error: err.message };
    });

    server.get('/', async () => {
        const url = `http://${TARGET}/recipes/42`;
        log('info', 'request-outgoing', {
            url,
            svc: 'recipe-api'
        });
        const req = await fetch(url);
        const producer_data = await req.json();
        return {
            consumer_pid: process.pid,
            producer_data
        };
    });

    server.get('/error', async () => { throw new Error('oh no') });
    server.listen(PORT, HOST, () => log('verbose', 'listen', { host: HOST, port: PORT }));
})();

