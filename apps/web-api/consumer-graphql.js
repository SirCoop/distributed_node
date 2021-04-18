const server = require('fastify')();
const fetch = require('node-fetch');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';
const TARGET = process.env.TARGET || 'localhost:4000'; //target producer (server)

// query determines actual response data
// producer can return as much data as it wants, but graphQL strips out everything
// that is not specified in this query e.g. recipe -> steps
const complex_query = `query kitchenSink ($id:ID) {
    recipe(id: $id) {
        id
        name
        ingredients {
            name quantity
        }
    }
    pid
}`;

const getRecipes = async (req, res) => {
    const { id  } = req.params;
    const config = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: complex_query,
            variables: { id }
        })
    };
    const producerReq = await fetch(`http://${TARGET}/graphql`, config);
    return {
        consumer_pid: process.pid,
        producer_data: await producerReq.json()
    };
};

server.get('/recipes/:id', getRecipes);

server.listen(PORT, HOST, () => {
    console.log(`Consumer running at http://${HOST}:${PORT}/`);
});