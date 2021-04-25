const server = require('fastify')();
const fetch = require('node-fetch');
const PORT = process.env.PORT || '3000';
// instantiate a cache client to access a cache external to this process
// running Memcache in a docker container via another terminal
const memcache = require('memjs').Client.create('localhost:11211');

const getAccount = async (req, res) => {
    const { account } = req.params;
    const { value: cached } = await memcache.get(account);
    if (cached) {
        console.log('cache hit');
        return JSON.parse(cached);
    }
    console.log('cache miss');
    const result = await fetch(`https://api.github.com/users/${account}`);
    const body = await result.text();
    await memcache.set(account, body, {}); // update cache whenever new data is retrieved
    return JSON.parse(body);
};

server.get('/account/:account', getAccount);

server.listen(PORT, () => {
    console.log(`MEMCACHE Server running at http://localhost:${PORT}/`);
});



