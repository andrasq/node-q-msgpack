q-msgpack
=========

Experimental msgpack encoder to play with the format and compare to JSON and BSON.
Written in javascript, no compiled modules.

No decoder yet, very limited testing by comparing Buffers, no unit tests.


Benchmark
---------

The speed of `{"a":1.5,"b":"foo","c":[1,2],"d":true,"e":{}}` encoded into msgpack format:

    qtimeit=0.18.2 node=6.7.0 v8=5.1.281.83 platform=linux kernel=3.16.0-4-amd64 up_threshold=11
    arch=ia32 mhz=4416 cpuCount=8 cpu="Intel(R) Core(TM) i7-6700K CPU @ 4.00GHz"
    name               speed         (stats)                                                       rate
    msgpack          204,738 ops/sec (5 runs of 50k calls in 1.221 out of 1.269 sec, +/- 0.40%)    1000 >>>>>
    msgpack-js       101,337 ops/sec (11 runs of 10k calls in 1.085 out of 1.107 sec, +/- 0.18%)    495 >>
    q-msgpack        988,553 ops/sec (10 runs of 100k calls in 1.012 out of 1.037 sec, +/- 0.08%)  4828 >>>>>>>>>>>>>>>>>>>>>>>>
    json           1,249,325 ops/sec (3 runs of 500k calls in 1.201 out of 1.265 sec, +/- 0.10%)   6102 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


Related Work
------------

- [`msgpack`](https://npmjs.com/package/msgpack) - compiled msgpack plugin for nodejs
- [`msgpack-js`](https://npmjs.com/package/msgpack-js) - javascript msgpack coder
- [`qbson`](https://github.com/andrasq/node-qbson) - experimental fast BSON encoder / decoder
- [`q-utf8`](https://npmjs.com/package/q-utf8) - fast javascript utf8 to/from bytes conversion
- [`qtimeit`](https://npmjs.com/package/qtimeit) - accurate benchmarking
- `JSON.stringify` - JavaScript built-in
