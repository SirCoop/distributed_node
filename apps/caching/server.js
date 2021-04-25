const server = require('fastify')();
const fetch = require('node-fetch');
const PORT = process.env.PORT || '3000';
// create an in-process cache
const LRUCACHE = require('lru-cache');
const lru = new LRUCACHE({
    // cache will store approximately 4kb of data for up to 10 minutes
    max: 4096,
    length: (payload, key) => payload.length + key.length,
    maxAge: 10*60*1_000
});

const getAccount = async (req, res) => {
    const { account } = req.params;
    const cached = lru.get(account); // always check cache before making a request
    if (cached) {
        console.log('cache hit');
        return JSON.parse(cached);
    }
    console.log('cache miss');
    const result = await fetch(`https://api.github.com/users/${account}`);
    const body = await result.text();
    lru.set(account, body); // update cache whenever new data is retrieved
    return JSON.parse(body);
};

server.get('/account/:account', getAccount);

server.listen(PORT, () => {
    console.log(`LRU Cache Server running at http://localhost:${PORT}/`);
});



