/* fills up microtask queue, which never empties
*  cpu usage hits 99%
*  setInterval never runs because event loop gets stuck in process.nextTick microqueue
*/
// const nt_recursive = () => process.nextTick(nt_recursive);
// nt_recursive();

/*
 * setInterval actually runs
    cpu hits 35% indefinitely
 */
let count = 0;
const si_recursive = () => setImmediate(si_recursive);
si_recursive();

setInterval(() => {
    console.log(`hi ${count}`);
    count++;
}, 10);