// warning: Not as efficient as using a Reverse Proxy
const server = require('fastify')();
const fetch = require('node-fetch');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';
const TARGET = process.env.TARGET || 'localhost:4000'; //target producer (server)

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
    console.log(`Consumer running at http://${HOST}:${PORT}/`);
});



