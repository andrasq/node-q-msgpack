// npm install json-simple@0.9.6 bson@1.0.4 msgpack@1.0.2 msgpacklite@0.1.26 msgpackjs@0.9.0 git+ssh@github.com:andrasq/node-qbson#0.0.11

timeit = require('qtimeit')
jsonSimple = require('json-simple')
Bson = require('bson');
qbson = require('qbson');
BSON = new Bson();
//buffalo = require('buffalo')
msgpack = require('msgpack')                    // github.com msgpack-node
msgpack_js = require('msgpack-js')
msgpackjs = require('msgpackjs')
// fix msgpackjs.pack to return buffers
msgpackjs_pack = msgpackjs.pack; msgpackjs.pack = function(v){ return new Buffer(msgpackjs_pack(v)) }
msgpacklite = require('msgpack-lite')
nodemsgpack = require('/home/andras/src/node-msgpack.git/')           // same as msgpack-node?  readme and timings very similar
msgpackjavascript = require('/home/andras/src/msgpack-javascript.git/') // pure js, including r/w writeDoubleLE and all utf8 handling!!

var qmsgpack = require('./')

// ----------------------------------------------------------------
if (0) {

data = { 'abcdef' : 1, 'qqq' : 13, '19' : [1, 2, 3, 4] };
dataset = new Array(500000);
for (var i=0; i<dataset.length; i++) dataset[i] = data;


var x, y, z;
//timeit(1, function() { x = JSON.stringify(dataset) });
// 675k/s singly; encode: 1.56 sec, 0.69 sec 4.2.5 (and 0.11.13)
//timeit(1, function() { y = JSON.parse(x) });
// parse: 1.39 sec 0.10.29, 1.41 4.2.5
//timeit(1, function() { y = JSON.parse(JSON.stringify(dataset)) });
// 2.64 sec encode/decode 500k, 1.99 sec 4.2.5

//timeit(1, function() { x = jsonSimple.encode(dataset) });
// 438k/s singly; 2.24 sec 0.10.29, 1.14 sec 4.2.5
// 0.11.13: 2.08 sec

//timeit(1, function() { x = BSON.serialize({x: dataset}) });
// 70k/s singly; 9.15 sec 0.10.29; 5.92 sec 4.2.5 sw only!!
//timeit(1, function() { x = BSON.deserialize(BSON.serialize({x: dataset})) });

//timeit(1, function() { x = buffalo.serialize({x: dataset}) });
// 7.96 sec 0.10.29; 4.81 4.2.5
//timeit(1, function() { y = buffalo.parse(x) });
// 4.26 sec 0.10.29, 5.73 sec 4.2.5
//timeit(1, function() { y = buffalo.parse(buffalo.serialize({x: dataset})) });
// 11.85 sec 0.10.29, 10.29 sec 4.2.5

//timeit(100000, function() { x = JSON.stringify(data) });

//timeit(100000, function() { x = msgpack.pack(data) });
//timeit(1, function() { x = msgpack.pack(dataset) });
// 146k/s singly; 1.69 sec

}

// ----------------------------------------------------------------
var data = -1;
var data = {a:{b:[1,2,3,,5]}};
var data = [1, 2, 3, "foo" ];
var data = {a: [1, 2, 3, "foo" ]};
var data = "foobar";
var data = -10;
var data = new Array(79).join("x");
var data = {a: 1.5, b: "foo", c: [1,2], d: true, e: {}};

//timeit(1000000, function(){ x = mp_typeof(data) });
//timeit(1000000, function(){ x = mp_objectType(data) });
//timeit(1000000, function(){ x = mp_type(data) });

// sample dataset used by the `msgpack` benchmark
if (0) {
    var hugePack = new Array(500000);
    for (var i=0; i<hugePack.length; i++) hugePack[i] = {'abcdef' : 1, 'qqq' : 13, '19' : [1, 2, 3, 4]};

    timeit(1, function(){ x = qmsgpack.pack(hugePack) });
    timeit(1, function(){ x = JSON.stringify(hugePack) });
    timeit(1, function(){ x = JSON.parse(JSON.stringify(hugePack)) });
    timeit(1, function(){ x = msgpack.pack(hugePack) });
    timeit(1, function(){ x = msgpack.unpack(msgpack.pack(hugePack)) });
    // BSON.serialize crashes with "RangeError: Attempt to write outside buffer bounds"
    timeit(1, function(){ x = qbson.encode(hugePack) });
    timeit(1, function(){ x = qbson.decode(qbson.encode(hugePack)) });
/**
"function (){ x = qmsgpack.pack(hugePack) }": 1 loops in 0.5847 of 0.58 sec: 1.71 / sec, 584.675791 ms each
"function (){ x = JSON.stringify(hugePack) }": 1 loops in 0.4439 of 0.44 sec: 2.25 / sec, 443.874884 ms each
"function (){ x = JSON.parse(JSON.stringify(hugePack)) }": 1 loops in 1.0388 of 1.04 sec: 0.96 / sec, 1038.825301 ms each
"function (){ x = msgpack.pack(hugePack) }": 1 loops in 1.4661 of 1.47 sec: 0.68 / sec, 1466.142639 ms each
"function (){ x = msgpack.unpack(msgpack.pack(hugePack)) }": 1 loops in 3.0564 of 3.06 sec: 0.33 / sec, 3056.424505 ms each

msgpack                 0 ops/sec (1 runs of 10 calls in 15.019 out of 23.948 sec, +/- 0.00%)    1000 >>>>>
msgpack-js              0 ops/sec (1 runs of 10 calls in 32.190 out of 51.617 sec, +/- 0.00%)     467 >>
msgpack-lite            0 ops/sec (1 runs of 10 calls in 10.509 out of 16.818 sec, +/- 0.00%)    1429 >>>>>>>
msgpackjavascript       1 ops/sec (1 runs of 10 calls in 5.591 out of 8.975 sec, +/- 0.00%)      2686 >>>>>>>>>>>>>
nodemsgpack             0 ops/sec (1 runs of 10 calls in 15.211 out of 24.192 sec, +/- 0.00%)     987 >>>>>
q-msgpack               1 ops/sec (1 runs of 10 calls in 6.491 out of 10.321 sec, +/- 0.00%)     2314 >>>>>>>>>>>>
qbson                   1 ops/sec (1 runs of 10 calls in 6.334 out of 10.467 sec, +/- 0.00%)     2371 >>>>>>>>>>>>
json                    2 ops/sec (1 runs of 10 calls in 4.563 out of 7.204 sec, +/- 0.00%)      3292 >>>>>>>>>>>>>>>>
**/
}

// ----------------------------------------------------------------
var dataset = [
    -10,
    1000,
    "foobar",
    new Array(101).join('x'),
    new Date('2001-01-01T00:00:00.000Z'),
    {a:1, b:2, c:3},
    {a:{aa:1,bb:2,cc:3}, b:{aa:1,bb:2,cc:3}, c:{aa:1,bb:2,cc:3}},
    [1,2,3,"foo"],
    {a: [1,2,3,"foo"]},
    {a: 1.5, b: "foo", c: [1,2], d: true, e: {}},
    {a: "ABC", b: 1, c: "DEFGHI\xff", d: 12345.67e-1, e: null, f: new Date(), g: {zz:12.5}, h: [1,2]},
];

for (var i=0; i<dataset.length; i++) {
data = dataset[i];
    console.log("-------");
    console.log(JSON.stringify(data).slice(0, 100));

    x = qmsgpack.pack(data);
    y = msgpack_js.encode(data);
    z = msgpackjs.pack(data);
    if (JSON.stringify(x) !== JSON.stringify(y)) console.log("AR: CODING ERROR: got", x, ", wanted ", y);
    //console.log("AR: encoded as", JSON.stringify(x.slice(0, 200)));
    //console.log("AR: expected  ", JSON.stringify(msgpack_js.encode(data).slice(0, 200)));
    //console.log("AR: len", x.length);
    //process.exit();

    var x;
    timeit.bench.timeGoal = 0.40;
    timeit.bench.visualize = true;
    timeit.bench({
        'msgpack': function(){ x = msgpack.pack(data) },
        'msgpack-js': function(){ x = msgpack_js.encode(data) },
        'msgpack-lite': function(){ x = msgpacklite.encode(data) },
        'msgpackjavascript': function(){ x = msgpackjavascript.pack(data) },
        'msgpackjavascript Buf': function(){ x = new Buffer(msgpackjavascript.pack(data)) },
        'msgpackjs': function(){ x = msgpackjs.pack(data) },
        'nodemsgpack': function(){ x = nodemsgpack.pack(data) },
        'q-msgpack': function(){ x = qmsgpack.pack(data) },
        'bson': function(){ x = BSON.serialize(data) },
        'qbson': function(){ x = qbson.encode(data) },
        'json': function(){ x = JSON.stringify(data) },
    });

    timeit.bench.showPlatformInfo = false;
}


// ----------------------------------------------------------------
/**
var data = {a: 1.5, b: "foo", c: [1,2], d: true, e: {}};

timeit(1000000, function(){ x = JSON.stringify(data) });
// 3.3m/s
console.log(x);

// timeit(1000000, function(){ x = msgpack.pack(data); });
// 700k/s
console.log(x);

timeit(1000000, function(){ x = qmsgpack.pack(data); });
// 2.9m/s
console.log(x);

timeit(1000000, function(){ x = msgpack_js.encode(data); });
// 1.0m/s
console.log(x);
**/
