const DatabaseReconnection = require('./db.js');
const db = new DatabaseReconnection({
    host: 'localhost',
    port: 5432,
    user: 'user',
    password: 'hunter2',
    database: 'dbconn',
    retry: 1_000
});
db.connect();
db.on('error', err => console.log('db error', err.message));
db.on('reconnect', () => console.log('reconnecting...'));
db.on('connect', () => console.log('DB connected.'));
db.on('disconnect', () => console.log('disconnected.'));

const server = require('fastify')();

const getFooByID = async (req, reply) => {
    let dbResponse;
    try {
        dbResponse = await db.query(
            'SELECT NOW() AS time, $1 AS echo', [req.params.foo_id]
        );
    } catch (error) {
        reply.statusCode = 503;
        return error;
    }
    console.log('dbResponse ROWS: ', dbResponse);
    return dbResponse.rows;
};
server.get('/foo/:foo_id', getFooByID);

const getHealth = async (req, reply) => {
    if (!db.connected) throw new Error('no db connection');
    return 'OK';
};
server.get('/health', getHealth);

server.listen(3000, () => console.log(`DB Connection server running at http://localhost:3000`));