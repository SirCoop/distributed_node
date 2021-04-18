const server = require('fastify')();
const graphql = require('fastify-gql');
const fs = require('fs');
const path = require('path');
// provide schema file
const schema = fs.readFileSync(path.join(__dirname, '../shared/graphql-schema.gql')).toString();

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;

const fetchRecipe = (root, args, context, info) => {
    console.log('root: ', root);
    console.log('args: ', args);
    // console.log('context: ', context); // nothing much useful here
    // console.log('info: ', info); // nothing much useful here
    const { id } = args;
    if (id !== '42') throw new Error(`recipe ${id} not found`);
    return {
        id,
        name: 'Chicken Tikka Masala',
        steps: 'Throw it in a pot'
    }
};

const fetchIngredients = obj => {
    console.log('fetchIngredients obj: ', obj);
    const { id } = obj;
    return (id !== '42') ? [] : [
        { id: 1, name: 'Chicken', quantity: '1 lb' },
        { id: 2, name: 'Sauce', quantity: '2 cups' }
    ];
};

const resolvers = { // resolvers object tells graphql how to build responses
    Query: { // top-level query
        pid: () => process.pid,
        recipe: async (root, args, context, info) => fetchRecipe(root, args, context, info)
    },
    Recipe: { // Recipe resolver is run when Recipe is retrieved
        ingredients: async obj => fetchIngredients(obj)
    }
};

server
    .register(
        // creates a route at /graphql that listens for incoming requests
        graphql,
        /**
         * The following object configures graphql with the content of the schema file,
         * a reference to the resolvers object,
         * and a final graphql flag which enables the graphiql console
         * 
         * console can be visited at http://localhost:4000/graphiql while service is running
         * NEVER set this flag to true for production
         */
        { schema, resolvers, graphql: true })
    .listen(PORT, HOST, () => {
        console.log(`Producer running at http://${HOST}:${PORT}`);
    });