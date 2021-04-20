// fastify is more efficient than express or hapi
const server = require('fastify')();
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '4000';
const ZIPKIN = process.env.ZIPKIN || 'localhost:9411';
const Zipkin = require('zipkin-lite');
const zipkin = new Zipkin({
    zipkinHost: ZIPKIN,
    serviceName: 'recipe-api',
    servicePort: PORT,
    serviceIp: HOST,
});

/** 
     * outbound requests are manually instrumented
     * - a fancy way of saying that developers must call different hooks to 
     *   interact with the package (zipkin-lite package is manually instrumented)
**/
server.addHook('onRequest', zipkin.onRequest()); // hooks are called when requests start and finish
server.addHook('onResponse', zipkin.onResponse());

console.log(`app worker pid=${process.pid}`);

server.get('/recipes/:id', async (req, res) => {
    console.log(`route worker pid=${process.pid}`);
    req.zipkin.setName('get_recipe');
    const id = Number(req.params.id);
    console.log(`param id = ${id}`);
    if (id !== 42) {
        res.statusCode = 404;
        return { error: 'not_found' };
    }
    return {
        producer_pid: process.pid,
        recipe: {
            id,
            name: 'Chicken Tikka Masala',
            steps: 'Throw it in a pot',
            ingredients: [
                { id: 1, name: 'Chicken', quantity: '1 lb' },
                { id: 2, name: 'Sauce', quantity: '2 cups' }
            ]
        }
    };
});

server.listen(PORT, HOST, () => {
    console.log(`ZIPKIN Producer running at http://${HOST}:${PORT}`);
});