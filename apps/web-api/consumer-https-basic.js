// warning: Not as efficient as using a Reverse Proxy
const server = require('fastify')();
const path = require('path');
const fetch = require('node-fetch');
const https = require('https');
const fs = require('fs');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';
const TARGET = process.env.TARGET || 'localhost:4000'; //target producer (server)

const options = {
    agent: new https.Agent({
        ca: fs.readFileSync(path.join(__dirname, '../shared/tls/basic-certificate.cert')),
    })
};

const getRecipes = async (webReq, webRes) => {
    const { id  } = webReq.params;
    const producerReq = await fetch(`http://${TARGET}/recipes/${id}`);
    const producer_data = await producerReq.json();

    return {
        consumer_pid: process.pid,
        producer_data
    };
};

server.get('/recipes/:id', getRecipes);

server.listen(PORT, HOST, () => {
    console.log(`SECURE Consumer running at http://${HOST}:${PORT}/`);
});



