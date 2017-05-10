q-msgpack
=========

Experimental msgpack encoder to play with the format and compare to JSON and BSON.
Written in javascript, no compiled modules.

No decoder yet, very limited testing by comparing Buffers, no unit tests.


Benchmark
---------

The speed of `{"a":1.5,"b":"foo","c":[1,2],"d":true,"e":{}}` encoded into msgpack format:

    qtimeit=0.18.2 node=6.10.2 v8=5.1.281.98 platform=linux kernel=3.16.0-4-amd64 up_threshold=11
    arch=ia32 mhz=4419 cpuCount=8 cpu="Intel(R) Core(TM) i7-6700K CPU @ 4.00GHz"
    name                      speed         (stats)                                                       rate
    msgpack                 209,324 ops/sec (2 runs of 50k calls in 0.478 out of 0.522 sec, +/- 1.23%)    1000 >>>>>
    msgpack-js              101,333 ops/sec (5 runs of 10k calls in 0.493 out of 0.516 sec, +/- 0.37%)     484 >>
    msgpack-lite            222,591 ops/sec (2 runs of 50k calls in 0.449 out of 0.482 sec, +/- 0.25%)    1063 >>>>>
    msgpackjavascript     1,022,449 ops/sec (1 runs of 500k calls in 0.489 out of 0.562 sec, +/- 0.00%)   4885 >>>>>>>>>>>>>>>>>>>>>>>>
    nodemsgpack             209,653 ops/sec (2 runs of 50k calls in 0.477 out of 0.514 sec, +/- 1.06%)    1002 >>>>>
    q-msgpack             1,040,444 ops/sec (1 runs of 500k calls in 0.481 out of 0.551 sec, +/- 0.00%)   4970 >>>>>>>>>>>>>>>>>>>>>>>>>
    bson                    198,164 ops/sec (2 runs of 50k calls in 0.505 out of 0.546 sec, +/- 0.21%)     947 >>>>>
    qbson                 1,022,698 ops/sec (1 runs of 500k calls in 0.489 out of 0.560 sec, +/- 0.00%)   4886 >>>>>>>>>>>>>>>>>>>>>>>>
    json                  1,275,670 ops/sec (2 runs of 500k calls in 0.784 out of 0.844 sec, +/- 0.02%)   6094 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


Related Work
------------

- [`msgpack`](https://npmjs.com/package/msgpack) - compiled msgpack plugin for nodejs
- [`msgpack-js`](https://npmjs.com/package/msgpack-js) - javascript msgpack coder
- [`msgpack-lite`](https://npmjs.com/package/msgpack-lite) - claims to be 90% faster but is slower than msgpack
- [`node-msgpack`](https://github.com/pgriess/node-msgpack) - possibly a diverged version of msgpack
- [`msgpack-javascript`](https://github.com/msgpack/msgpack-javascript) - pure javascript, not nodejs, but very fast
- [`bson`](https://npmjs.com/package/bson) - the official nodejs mongodb BSON format encoder / decoder
- [`qbson`](https://github.com/andrasq/node-qbson) - experimental fast BSON encoder / decoder
- [`q-utf8`](https://npmjs.com/package/q-utf8) - fast javascript utf8 to/from bytes conversion
- [`qtimeit`](https://npmjs.com/package/qtimeit) - accurate benchmarking
- `JSON.stringify` - JavaScript built-in
