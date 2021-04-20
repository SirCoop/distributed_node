// warning: Not as efficient as using a Reverse Proxy
const server = require('fastify')();
const fetch = require('node-fetch');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';
const TARGET = process.env.TARGET || 'localhost:4000'; //target producer (server)
const middie = require('middie');
const SDC = require('statsd-client');
const statsd = new (SDC)({ host: 'localhost', port: 8125, prefix: 'web-api' });

const v8 = require('v8');
const fs = require('fs');

(async () => {
    await server.register(middie);
    server.use(statsd.helpers.getExpressMiddleware('inbound', {
        timeByUrl: true
    }));
    server.get('/', async () => {
        const begin = new Date();
        const req = await fetch(`http://${TARGET}/recipes/42`);
        statsd.timing('outbound.recipe-api.request-time', begin);
        statsd.increment('outbound.recipe-api.request-count');
        const producer_data = await req.json();

        return {
            consumer_pid: process.pid,
            producer_data
        };
    });
    server.get('/error', async () => { throw new Error('oh no') });
    server.listen(PORT, HOST, () => {
        console.log(`METRICS Consumer running at http://${HOST}:${PORT}/`);
    });
}
)();

setInterval(() => {
    statsd.gauge('server.conn', server.server._connections); // num server connections

    const m = process.memoryUsage(); // process heap utilization
    statsd.gauge('server.memory.used', m.heapUsed);
    statsd.gauge('server.memory.total', m.heapTotal);

    const h = v8.getHeapStatistics(); // v8 heap utilization
    statsd.gauge('server.heap.size', h.used_heap_size);
    statsd.gauge('server.heap.limit', h.heap_size_limit);

    fs.readdir('/proc/self/fd', (err, list) => {
        if (err) return;
        statsd.gauge('server.descriptors', list.length); // open file descriptors
    });

    const begin = new Date();
    setTimeout(() => {
        statsd.timing('eventlag', begin); // event loop lag
    }, 0);
}, 10_000);



