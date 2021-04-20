// warning: Not as efficient as using a Reverse Proxy
const server = require('fastify')();
const fetch = require('node-fetch');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';
const TARGET = process.env.TARGET || 'localhost:4000'; //target producer (server)

const getHealth = async (webReq, webRes) => {
    console.log(`health check PORT ${PORT}`);
    return 'OK';
};

server.get('/health', getHealth);

server.listen(PORT, HOST, () => {
    console.log(`Consumer Health Check Endpoint running at http://${HOST}:${PORT}/`);
});



