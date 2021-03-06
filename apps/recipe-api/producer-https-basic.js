// fastify is more efficient than express or hapi
const fs = require('fs');
const path = require('path');
const server = require('fastify')({
    https: {
        key: fs.readFileSync(path.join(__dirname, './tls/basic-private-key.key')),
        cert: fs.readFileSync(path.join(__dirname, '../shared/tls/basic-certificate.cert')),
    }
});
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '4000';

console.log(`app worker pid=${process.pid}`);

server.get('/recipes/:id', async (req, res) => {
    console.log(`route worker pid=${process.pid}`);
    const id = Number(req.params.id);
    console.log(`param id = ${id}`);
    if (id !== 42) {
        res.statusCode = 404;
        return { error: 'not_found' };
    }
    return {
        producer_pid: process.pid,
        recipe: {
            id,
            name: 'Chicken Tikka Masala',
            steps: 'Throw it in a pot',
            ingredients: [
                { id: 1, name: 'Chicken', quantity: '1 lb' },
                { id: 2, name: 'Sauce', quantity: '2 cups' }
            ]
        }
    };
});

server.listen(PORT, HOST, () => {
    console.log(`SECURE Producer running at http://${HOST}:${PORT}`);
});