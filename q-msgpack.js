/**
 * experimental msgpack coder
 *
 * Copyright (C) 2017 Andras Radics
 * Licensed under the Apache License, version 2.0
 *
 * 2017-05-08 - AR.
 */

'use strict';

var utf8 = require('q-utf8');

module.exports = {
    encode: mp_encode,
    // decode: null,
    pack: mp_encode,
    _lib: {
        mp_encode: mp_encode,
        mp_objectType: mp_objectType,
        mp_estimateSize: mp_estimateSize,
        mp_encodeNumber: mp_encodeNumber,
        mp_encodeString: mp_encodeString,
        mp_encodeArray: mp_encodeArray,
        mp_encodeMap: mp_encodeMap,
    }
};


var T_NIL = 0xC0;
var T_RESERVED = 0xC1;
var T_BOOLEAN_FALSE = 0xC2;
var T_BOOLEAN_TRUE = 0xC3;
var T_BIN_8 = 0xC4;
var T_BIN_16 = 0xC5;
var T_BIN_32 = 0xC6;
var T_UINT_8 = 0xCC;
var T_UINT_16 = 0xCD;
var T_UINT_32 = 0xCE;
var T_UINT_64 = 0xCF;
var T_INT_8 = 0xD0;
var T_INT_16 = 0xD1;
var T_INT_32 = 0xD2;
var T_INT_64 = 0xD3;
var T_FLOAT_32 = 0xCA;
var T_FLOAT_64 = 0xCB;
var T_STR_8 = 0xD9;
var T_STR_16 = 0xDA;
var T_STR_32 = 0xDB;
var T_ARRAY_16 = 0xDC;
var T_ARRAY = 0xDD;
var T_MAP_16 = 0xDE;
var T_MAP_32 = 0xDF;
var T_MAP = 0xDF;
var T_FIXINT = 0x00;            // 0 xxxxxxx 0..127
var T_FIXSTR = 0xA0;            // 101 xxxxx 0-31 bytes
var T_FIXARR = 0x90;            // 1001 xxxx
var T_FIXMAP = 0x80;            // 1000 xxxx
var T_NEG_FIXINT = 0xE0;        // 111 xxxxx -1..-32

function mp_encode( value ) {
    // for primitive values, avoiding the slice runs 50% faster
    // for most objects the slice is irrelevant, only 5% overhead

// ... but the estimated size runs only 5% faster ??
// so why is this code 10x faster than msgpack-js for objects?
// - utf8.utf8_byteLength is up to 25% faster than Buffer.byteLength (depends on string length)
// - estimateSize + slice is up to 20% faster than computeSize 

/**
    var buf = new Buffer(mp_computeSize(value));
    var bound = _mp_encode(value, buf, 0);
if (bound !== buf.length) console.log("AR: error: wrong size, computed %d but got %d", buf.length, bound);
    return buf;
/**/

    var buf = new Buffer(mp_estimateSize(value));
    var bound = _mp_encode(value, buf, 0);
    return buf.slice(0, bound);
}

function _mp_encode( value, buf, pos ) {
    var type = typeof value;

    switch (type) {
    case 'undefined': buf[pos] = T_NIL; return pos + 1;
    case 'number': return mp_encodeNumber(buf, pos, value);
    case 'string': return mp_encodeString(buf, pos, value);
    case 'boolean': buf[pos] = value ? T_BOOLEAN_TRUE : T_BOOLEAN_FALSE; return pos + 1;
    }

    // if (value && typeof value.toJSON === 'function') value = value.toJSON()

    switch (mp_objectType(value)) {
    case 'Nil':
        buf[pos] = T_NIL;
        pos += 1;
        break;
    case 'Boolean':
        buf[pos] = value ? T_BOOLEAN_TRUE : T_BOOLEAN_FALSE;
        pos += 1;
        break;
    case 'Number':
        pos = mp_encodeNumber(buf, pos, value);
        break;
    case 'Binary':
        buf[pos] = T_BIN_32;
        mp_putInt32(buf, pos+1, value.length);
        value.copy(buf, pos+5);
        pos += 5 + value.length;
    case 'Date':
        pos = mp_encodeString(buf, pos, value.toJSON());
        break;
    case 'String':
        pos = mp_encodeString(buf, pos, value);
        break;
    case 'Array':
        pos = mp_encodeArray(buf, pos, value);
        break;
    case 'Map':
        pos = mp_encodeMap(buf, pos, value);
        break;
    }

    return pos;
}

function mp_encodeNumber( buf, pos, value ) {
    if ((value | 0) != value) {
        buf[pos] = T_FLOAT_64;
        buf.writeDoubleBE(value, pos+1);
        return pos + 9;
    }

    if (value >= -0x20 && value <= 0x7f) {
        buf[pos] = (value >= 0) ? (T_FIXINT | value) : (T_NEG_FIXINT | (value & 0x1f));
        return pos + 1;
    }
    else if (value >= -0x10000 && value <= 0xffff) {
        // the sign is encoded in UINT (positive) vs INT (negative),
        // thus keeping all 16 bits of precision
        if (value >= 0) {
            buf[pos] = T_UINT_16;
            mp_putInt16(buf, pos+1, value);
        } else {
            buf[pos] = T_UINT_16;
            mp_putInt16(buf, pos+1, value & 0xffff);
        }
        return pos + 3;
    }
    else {
        buf[pos] = T_INT_32;
        mp_putInt32(buf, pos+1, value);
        return pos + 5;
    }
}

function mp_encodeString( buf, pos, value ) {
    var size = utf8.utf8_byteLength(value, 0, value.length);
    if (size <= 31) {
        buf[pos] = T_FIXSTR | size;
        pos = mp_putString(buf, pos+1, value);
    }
    else if (size < 0x1000) {
        buf[pos] = T_STR_16;
        var pos2 = mp_putString(buf, pos+3, value);
        mp_putInt16(buf, pos+1, pos2 - pos - 3);
        pos = pos2;
    }
    else {
        buf[pos] = T_STR_32;
        var pos2 = mp_putString(buf, pos+5, value);
        mp_putInt32(buf, pos+1, pos2 - pos - 5);
        pos = pos2;
    }
    return pos;
}

function mp_encodeArray( buf, pos, value ) {
    if (value.length < 0x10) {
        buf[pos] = T_FIXARR | value.length;
        pos += 1;
    }
    else if (value.length < 0x10000) {
        buf[pos] = T_ARRAY_16;
        mp_putInt16(buf, pos+1, value.length);
        pos += 3;
    }
    else {
        buf[pos] = T_ARRAY;
        mp_putInt32(buf, pos+1, value.length);
        pos += 5;
    }
    for (var i=0; i<value.length; i++) {
        pos = _mp_encode(value[i], buf, pos);
    }
    return pos;
}

function mp_encodeMap( buf, pos, value ) {
    var keys = Object.keys(value), nkeys = keys.length;
    for (var i=0; i<nkeys; i++) {
        if (typeof value[keys[i]] === 'function') {
            keys[i] = undefined;
            nkeys -= 1;
        }
    }
    if (nkeys < 0x10) {
        buf[pos] = T_FIXMAP | nkeys;
        pos += 1;
    }
    else if (nkeys < 0x10000) {
        buf[pos] = T_MAP_16;
        mp_putInt16(buf, pos+1, nkeys);
        pos += 3;
    }
    else {
        buf[pos] = T_MAP;
        mp_putInt32(buf, pos+1, nkeys);
        pos += 5;
    }
    for (var i=0; i<keys.length; i++) {
        if (keys[i] !== undefined) {
            pos = mp_encodeString(buf, pos, keys[i]);
            pos = _mp_encode(value[keys[i]], buf, pos);
        }
    }
    return pos;
}

// estimate an upper bound for the number of bytes needed to encode value
function mp_estimateSize( value ) {
    switch (typeof value) {
    case 'undefined': return 1;
    case 'boolean': return 1;
    case 'number': return 9;
    case 'string': return value.length > 400 ? mp_sizeofString(value) : 5 + 3 * value.length;
    }

    // TODO: time w/ and w/o this test
    // if (value && typeof value.toJSON === 'function') value = value.toJSON()

    switch (mp_objectType(value)) {
    case 'Nil': return 1;
    case 'Boolean': return 1;
    case 'Number': return 9;
    case 'String': return value.length > 400 ? mp_sizeofString(value) : 5 + 3 * value.length;
    case 'Date': return 25;
    case 'Binary': return 5 + value.length;
    case 'Array':
        var size = 5;
        for (var i=0; i<value.length; i++) size += mp_estimateSize(value[i]);
        return size;
    case 'Map':
        var size = 5;
        for (var i in value) {
            size += i.length > 100 ? mp_sizeofString(i) : 5 + 3 * i.length;
            size += mp_estimateSize(value[i]);
        }
        return size;
    }

    return 0;
}

// compute the exact number of bytes needed to encode value
function mp_computeSize( value ) {
    switch (typeof value) {
    case 'undefined': return 1;
    case 'boolean': return 1;
    case 'string': return mp_sizeofString(value);
    case 'number': return mp_sizeofNumber(value);
    }

    if (value == null) return 1;

    switch (mp_objectType(value)) {
    case 'Nil': return 1;
    case 'Boolean': return 1;
    case 'Number': return mp_sizeofNumber(value);
    case 'String': return mp_sizeofString(value);
    case 'Date': return 25;
    case 'Binary': return 5 + value.length;
// FIXME: mp_sizeofBinary(value) since it too has a var-len prefix
    case 'Array':
        var size = 5;
        if (value.length < 0x10000) size = 3;
        if (value.length < 16) size = 1;
        for (i=0; i<value.length; i++) size += mp_computeSize(value[i]);
        return size;
    case 'Map':
        var keys = Object.keys(value), nkeys = keys.length;
        for (var i=0; i<nkeys; i++) {
            if (typeof value[keys[i]] === 'function') {
                keys[i] = undefined;
                nkeys -= 1;
            }
        }
        size = 5;
        if (nkeys < 0x10000) size = 3;
        if (nkeys < 16) size = 1;
        for (i=0; i<keys.length; i++) {
            if (keys[i] === undefined) continue;
            var sz = mp_computeSize(keys[i]);
            size += sz;
            sz = mp_computeSize(value[keys[i]]);
            size += sz;
        }
        return size;
    }

    return 0;
}

function mp_typeof( value ) {
    var type = typeof value;

// TODO: return Date to convert as toJSON()

    switch (type) {
    case 'number': return 'Number';
    case 'string': return 'String';
    case 'boolean': return 'Boolean';
    case 'function': return 'Map';
    }

    if (value == null) return 'Nil';

    if (type == 'object') switch (value.constructor.name) {
    case 'Array': return 'Array';
    case 'Number': return 'Number';
    case 'String': return 'String';
    case 'Symbol': return 'String';
    case 'Date': return 'Date';
    case 'Function': return 'Map';
    case 'Boolean': return 'Boolean';
    case 'Buffer': return 'Binary';
    default: return 'Map';
    }
}

function mp_sizeofNumber( value ) {
    if ((value | 0) != value) return 9;
    if (value >= -32 && value < 128) return 1;
    if (value >= -0x10000 && value < 0x8000) return 3;
    return 5;
}

function mp_sizeofString( value ) {
    if (value.length < 75) {
        // utf8.byteLength is 25% faster than Buffer.byteLength
        var size = utf8.utf8_byteLength(value, 0, value.length);
    } else {
        var size = Buffer.byteLength(value);
    }
    if (size <= 31) return 1 + size;
    if (size < 0x10000) return 3 + size;
    return 5 + size;
}

function mp_type( value ) {
    switch (typeof value) {
    case 'number': return 'Number';
    case 'string': return 'String';
    case 'boolean': return 'Boolean';
    case 'undefined': return 'Nil';
    case 'object': mp_objectType(value);
    }
}

function mp_objectType( value ) {
    if (!value) return 'Nil';

    switch (value.constructor.name) {
    case 'Array': return 'Array';
    case 'Number': return 'Number';
    case 'String': return 'String';
    case 'Boolean': return 'Boolean';
    case 'Buffer': return 'Binary';
    case 'Date': return 'Date';
    default: return 'Map';
    }
}

function mp_putInt16( buf, pos, value ) {
    buf[pos  ] = (value >>> 8) & 0xff;
    buf[pos+1] = (value) & 0xff;
    return;
}

function mp_putInt32( buf, pos, value ) {
    buf[pos  ] = (value >>> 24) & 0xFF;
    buf[pos+1] = (value >>> 16) & 0xFF;
    buf[pos+2] = (value >>> 8) & 0xFF;
    buf[pos+3] = (value) & 0xFF;
}

function mp_putString( buf, pos, value ) {
    if (value.length < 150) {
        pos = utf8.utf8_encode(value, 0, value.length, buf, pos);
    } else {
        pos += buf.write(value, pos);
    }
    return pos;
}
