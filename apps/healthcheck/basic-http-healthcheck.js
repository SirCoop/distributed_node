const server = require('fastify')();
const HOST = '0.0.0.0';
const PORT = 3300;
const REDIS = require('ioredis'); // connect and issue queries to redis
const redis = new (REDIS)({ enableOfflineQueue: false }); // redis requests will fail when offline
const PGClient = require('pg').Client;
const postgres = new (PGClient)();

/**
 * Postgres connection variables provided as environment variables
 * e.g., PGUSER=tmp PGPASSWORD=hunter2 PGDATABASE=tmp
 */
postgres.connect(); // PostGres will not reconnect on failure

server.get('/health', async (req, res) => {
    try {
        const reply = await postgres.query('SELECT $1::text as status', ['ACK']);
        if (reply.rows[0].status !== 'ACK') reply.code(500).send('Down');
    } catch(error) {
        res.code(500).send({ error, reason_phrase: 'Down' }); // completely fail if Postgres cannot be reached
    }
    // ... other down checks ...
    let status = 'OK';
    try {
        if (await redis.ping() !== 'PONG') status = 'DEGRADED';
    } catch (error) {
        status = 'DEGRADED'; // pass with a degraded state if Redis cannot be reached
    }
    // ... other degraded checks ...
    res.code(200).send(status);
});

server.listen(PORT, HOST, () => console.log(`HEALTH Endpoint running at http://${HOST}:${PORT}`));