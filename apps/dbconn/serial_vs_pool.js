// const { Client } = require('pg');
// const db = new Client({
//     host: 'localhost',
//     port: 5432,
//     user: 'user',
//     password: 'hunter2',
//     database: 'dbconn',
// });

const { Pool } = require('pg');
const db = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'user',
    password: 'hunter2',
    database: 'dbconn',
    max: process.env.MAX_CONN || 10
});

/**
 * Serial requests via one connection takes about 4.08 seconds
 * Pooling takes about 2.05 seconds
 */
db.connect();
(async () => {
    const start = Date.now();
    const query = `
        SELECT pg_sleep(2)
    `;
    await Promise.all([
        db.query(query),
        db.query(query)
    ]);
    console.log(`took ${(Date.now() - start) / 1000} seconds`);
    db.end();
})();