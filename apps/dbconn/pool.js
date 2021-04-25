const { Pool } = require('pg');
const db = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'user',
    password: 'hunter2',
    database: 'dbconn',
    max: process.env.MAX_CONN || 10
});
db.connect();

const server = require('fastify')();
server.get('/', async () => await db.query("SELECT NOW() AS time, 'world' AS HELLO").rows[0]);
server.get('/connections', async () => {
    const query = `
        SELECT *
        FROM pg_settings
        WHERE name = 'max_connections'`;
    return await db.query(query);
});
server.listen(3000, () => console.log(`DB with ${process.env.MAX_CONN} connection(s) pooled running at http://localhost:3000`));
