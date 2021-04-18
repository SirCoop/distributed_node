// anti-pattern
function foo(count, cb) {
    if (count <= 0) {
        return cb(new TypeError('count > 0'));
    }
    myAsyncOperation(count, cb);
}


