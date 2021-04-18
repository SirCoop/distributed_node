const cluster = require('cluster'); // cluster module needed in parent process
const path = require('path');
console.log(`MASTER pid=${process.pid}`);
cluster.setupMaster({
    exec: path.join(__dirname, './producer-http-basic.js') // override default app entry point
});
cluster.fork(); // called each time a worker needs to be created i.e. two workers produced here
cluster.fork();

// cluster events emitted and listened to
cluster
    .on('disconnect', worker => console.log('disconnect', worker.id))
    .on('exit', (worker, code, signal) => {
        console.log('worker exit', worker.id, code, signal);
        // uncomment this to make workers difficult to kill - must kill master to kill workers
        // cluster.fork()
    })
    .on('listening', (worker, {address, port}) => console.log('listening', worker.id, `${address}${port}`));
