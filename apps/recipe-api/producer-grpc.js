const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('path');
const pkg_def = loader.loadSync(path.join(__dirname, '../shared/grpc-recipe.proto'));
const recipe = grpc.loadPackageDefinition(pkg_def).recipe; // give me recipe package
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '4000';
const server = new grpc.Server();

const recipeServiceConfig = {
    getMetaData: (_call, cb) => {
        cb(null, { pid: process.pid })
    },
    getRecipe: (call, cb) => {
        console.log('call.request: ', call.request);
        const { id } = call.request;
        if (id !== 42) return cb(new Error(`unknown recipe ${id}`));
        cb(null, {
            id,
            name: 'Chicken Tikka Masala',
            steps: 'Throw it in a pot',
            ingredients: [
                { id: 1, name: 'Chicken', quantity: '1 lb' },
                { id: 2, name: 'Sauce', quantity: '2 cups' }
            ]
        });
    }
};

server.addService(recipe.RecipeService.service, recipeServiceConfig);
server.bindAsync(
    `${HOST}:${PORT}`,
    grpc.ServerCredentials.createInsecure(), // disable TLS and authentication
    (err, port) => {
        if (err) throw err;
        /**
         * Listens for HTTP/2 requests on port 4000
         * HTTP routes are associated with service name and method names
         * e.g. getMetaData() lives at http://localhost:4000/recipe.RecipeService/GetMetaData 
         */
        server.start();
        console.log(`gRPC Producer running at http://${HOST}:${PORT}`);        
    }
);