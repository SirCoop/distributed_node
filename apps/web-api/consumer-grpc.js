const util = require('util');
const server = require('fastify')();
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('path');
// client and server share schema
const pkg_def = loader.loadSync(path.join(__dirname, '../shared/grpc-recipe.proto'));
const recipe = grpc.loadPackageDefinition(pkg_def).recipe; // give me recipe package
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';
const TARGET = process.env.TARGET || 'localhost:4000'; //target producer (server)

// create a local client that represents recipe service
const client = new recipe.RecipeService(TARGET, grpc.credentials.createInsecure());
// bind client to as invocation context to service methods, then assign to local method
// gives us feeling of calling remote methods locally
const getMetaData = util.promisify(client.getMetaData.bind(client));
const getRecipe = util.promisify(client.getRecipe.bind(client));

const fetchRecipe = async (req, res) => {
    const { id } = req.params;
    const [meta, recipe] = await Promise.all([
        // calling remote methods via local methods
        getMetaData({}),
        getRecipe({id})
    ]);
    return {
        consumer_pid: process.pid,
        producer_data: meta, recipe
    };
};

server.get('/recipes/:id', fetchRecipe);
server.listen(PORT, HOST, () => {
    console.log(`gRPC Consumer running at http://${HOST}:${PORT}/`);
});