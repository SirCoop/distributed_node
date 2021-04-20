const { ServerDuplexStreamImpl } = require('@grpc/grpc-js/build/src/server-call');

const server = require('fastify')();
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '4000';

console.log(`fibonacci worker pid=${process.pid}`);

const fibonacci = limit => {
    let prev = 1n;
    let next = 0n;
    let swap;

    while (limit) {
        swap = prev;
        prev = prev + next;
        next = swap;
        limit--;
    }
    return next;
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getFibonacci = async (req, res) => {
    await sleep(10);
    const { params: { limit } } = req;
    return String(fibonacci(Number(limit)));
};

server.get('/fib/:limit', getFibonacci);

server.listen(PORT, HOST, () => {
    console.log(`Fibonacci Producer running at http://${HOST}:${PORT}`);
});
