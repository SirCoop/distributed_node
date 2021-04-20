const server = require('fastify')();
const fetch = require('node-fetch');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';
const TARGET = process.env.TARGET || 'localhost:4000'; //target producer (server)
const ZIPKIN = process.env.ZIPKIN || 'localhost:9411';
const Zipkin = require('zipkin-lite');
const zipkin = new Zipkin({
    zipkinHost: ZIPKIN,
    serviceName: 'web-api',
    servicePort: PORT,
    serviceIp: HOST,
    init: 'short' // web-api accepts outside requests and can generate trace IDs
});

/** 
     * outbound requests are manually instrumented
     * - a fancy way of saying that developers must call different hooks to 
     *   interact with the package (zipkin-lite package is manually instrumented)
**/
server.addHook('onRequest', zipkin.onRequest()); // hooks are called when requests start and finish
server.addHook('onResponse', zipkin.onResponse());

const getRecipes = async (webReq, webRes) => {
    webReq.zipkin.setName('get_root'); // each endpoint will need to specify its name
    const url = `http://${TARGET}/recipes/42`;
    const zreq = webReq.zipkin.prepare(); // apply zipkin headers and newly generated spanID
    const recipe = await fetch(url, { headers: zreq.headers });
    zreq.complete('GET', url); // calculate overall time and send CLIENT message to zipkin server
    const producer_data = await recipe.json();

    return {
        pid: process.pid,
        producer_data,
        trace: webReq.zipkin.trace
    };
};

server.get('/', getRecipes);

server.listen(PORT, HOST, () => {
    console.log(`ZIPKIN Consumer running at http://${HOST}:${PORT}/`);
});



