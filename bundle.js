(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

if (global._6to5Polyfill) {
  throw new Error("only one instance of 6to5/polyfill is allowed");
}
global._6to5Polyfill = true;

require("core-js/shim");
require("regenerator-6to5/runtime");

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":2,"regenerator-6to5/runtime":3}],2:[function(require,module,exports){
/**
 * Core.js 0.4.10
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2015 Denis Pushkarev
 */
!function(global, framework, undefined){
'use strict';

/******************************************************************************
 * Module : common                                                            *
 ******************************************************************************/

  // Shortcuts for [[Class]] & property names
var OBJECT          = 'Object'
  , FUNCTION        = 'Function'
  , ARRAY           = 'Array'
  , STRING          = 'String'
  , NUMBER          = 'Number'
  , REGEXP          = 'RegExp'
  , DATE            = 'Date'
  , MAP             = 'Map'
  , SET             = 'Set'
  , WEAKMAP         = 'WeakMap'
  , WEAKSET         = 'WeakSet'
  , SYMBOL          = 'Symbol'
  , PROMISE         = 'Promise'
  , MATH            = 'Math'
  , ARGUMENTS       = 'Arguments'
  , PROTOTYPE       = 'prototype'
  , CONSTRUCTOR     = 'constructor'
  , TO_STRING       = 'toString'
  , TO_STRING_TAG   = TO_STRING + 'Tag'
  , TO_LOCALE       = 'toLocaleString'
  , HAS_OWN         = 'hasOwnProperty'
  , FOR_EACH        = 'forEach'
  , ITERATOR        = 'iterator'
  , FF_ITERATOR     = '@@' + ITERATOR
  , PROCESS         = 'process'
  , CREATE_ELEMENT  = 'createElement'
  // Aliases global objects and prototypes
  , Function        = global[FUNCTION]
  , Object          = global[OBJECT]
  , Array           = global[ARRAY]
  , String          = global[STRING]
  , Number          = global[NUMBER]
  , RegExp          = global[REGEXP]
  , Date            = global[DATE]
  , Map             = global[MAP]
  , Set             = global[SET]
  , WeakMap         = global[WEAKMAP]
  , WeakSet         = global[WEAKSET]
  , Symbol          = global[SYMBOL]
  , Math            = global[MATH]
  , TypeError       = global.TypeError
  , setTimeout      = global.setTimeout
  , setImmediate    = global.setImmediate
  , clearImmediate  = global.clearImmediate
  , process         = global[PROCESS]
  , nextTick        = process && process.nextTick
  , document        = global.document
  , html            = document && document.documentElement
  , navigator       = global.navigator
  , define          = global.define
  , ArrayProto      = Array[PROTOTYPE]
  , ObjectProto     = Object[PROTOTYPE]
  , FunctionProto   = Function[PROTOTYPE]
  , Infinity        = 1 / 0
  , DOT             = '.';

// http://jsperf.com/core-js-isobject
function isObject(it){
  return it != null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);

// Object internal [[Class]] or toStringTag
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
var buildIn = {
  Undefined: 1, Null: 1, Array: 1, String: 1, Arguments: 1,
  Function: 1, Error: 1, Boolean: 1, Number: 1, Date: 1, RegExp:1 
} , toString = ObjectProto[TO_STRING];
function setToStringTag(it, tag, stat){
  if(it && !has(it = stat ? it : it[PROTOTYPE], SYMBOL_TAG))hidden(it, SYMBOL_TAG, tag);
}
function cof(it){
  return it == undefined ? it === undefined
    ? 'Undefined' : 'Null' : toString.call(it).slice(8, -1);
}
function classof(it){
  var klass = cof(it), tag;
  return klass == OBJECT && (tag = it[SYMBOL_TAG]) ? has(buildIn, tag) ? '~' + tag : tag : klass;
}

// Function
var call  = FunctionProto.call
  , apply = FunctionProto.apply
  , REFERENCE_GET;
// Partial apply
function part(/* ...args */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , i = 0, j = 0, _args;
    if(!holder && !_length)return invoke(fn, args, that);
    _args = args.slice();
    if(holder)for(;length > i; i++)if(_args[i] === _)_args[i] = arguments[j++];
    while(_length > j)_args.push(arguments[j++]);
    return invoke(fn, _args, that);
  }
}
// Optional / simple context binding
function ctx(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    }
    case 2: return function(a, b){
      return fn.call(that, a, b);
    }
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    }
  } return function(/* ...args */){
      return fn.apply(that, arguments);
  }
}
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
function invoke(fn, args, that){
  var un = that === undefined;
  switch(args.length | 0){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
}
function construct(target, argumentsList /*, newTarget*/){
  var proto    = assertFunction(arguments.length < 3 ? target : arguments[2])[PROTOTYPE]
    , instance = create(isObject(proto) ? proto : ObjectProto)
    , result   = apply.call(target, instance, argumentsList);
  return isObject(result) ? result : instance;
}

// Object:
var create           = Object.create
  , getPrototypeOf   = Object.getPrototypeOf
  , setPrototypeOf   = Object.setPrototypeOf
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnDescriptor = Object.getOwnPropertyDescriptor
  , getKeys          = Object.keys
  , getNames         = Object.getOwnPropertyNames
  , getSymbols       = Object.getOwnPropertySymbols
  , isFrozen         = Object.isFrozen
  , has              = ctx(call, ObjectProto[HAS_OWN], 2)
  // Dummy, fix for not array-like ES3 string in es5 module
  , ES5Object        = Object
  , Dict;
function toObject(it){
  return ES5Object(assertDefined(it));
}
function returnIt(it){
  return it;
}
function returnThis(){
  return this;
}
function get(object, key){
  if(has(object, key))return object[key];
}
function ownKeys(it){
  assertObject(it);
  return getSymbols ? getNames(it).concat(getSymbols(it)) : getNames(it);
}
// 19.1.2.1 Object.assign(target, source, ...)
var assign = Object.assign || function(target, source){
  var T = Object(assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
function keyOf(object, el){
  var O      = toObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
}

// Array
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = ArrayProto.push
  , unshift = ArrayProto.unshift
  , slice   = ArrayProto.slice
  , splice  = ArrayProto.splice
  , indexOf = ArrayProto.indexOf
  , forEach = ArrayProto[FOR_EACH];
/*
 * 0 -> forEach
 * 1 -> map
 * 2 -> filter
 * 3 -> some
 * 4 -> every
 * 5 -> find
 * 6 -> findIndex
 */
function createArrayMethod(type){
  var isMap       = type == 1
    , isFilter    = type == 2
    , isSome      = type == 3
    , isEvery     = type == 4
    , isFindIndex = type == 6
    , noholes     = type == 5 || isFindIndex;
  return function(callbackfn/*, that = undefined */){
    var O      = Object(assertDefined(this))
      , that   = arguments[1]
      , self   = ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = isMap ? Array(length) : isFilter ? [] : undefined
      , val, res;
    for(;length > index; index++)if(noholes || index in self){
      val = self[index];
      res = f(val, index, O);
      if(type){
        if(isMap)result[index] = res;             // map
        else if(res)switch(type){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(isEvery)return false;           // every
      }
    }
    return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
  }
}
function createArrayContains(isContains){
  return function(el /*, fromIndex = 0 */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = toIndex(arguments[1], length);
    if(isContains && el != el){
      for(;length > index; index++)if(sameNaN(O[index]))return isContains || index;
    } else for(;length > index; index++)if(isContains || index in O){
      if(O[index] === el)return isContains || index;
    } return !isContains && -1;
  }
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof vs isFunction
  return typeof A == 'function' ? A : B;
}

// Math
var MAX_SAFE_INTEGER = 0x1fffffffffffff // pow(2, 53) - 1 == 9007199254740991
  , ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , random = Math.random
  , trunc  = Math.trunc || function(it){
      return (it > 0 ? floor : ceil)(it);
    }
// 20.1.2.4 Number.isNaN(number)
function sameNaN(number){
  return number != number;
}
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it) ? 0 : trunc(it);
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}
function toIndex(index, length){
  var index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
}

function createReplacer(regExp, replace, isStatic){
  var replacer = isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}
function createPointAt(toString){
  return function(pos){
    var s = String(assertDefined(this))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return toString ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? toString ? s.charAt(i) : a
      : toString ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  }
}

// Assertion & errors
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
function assertDefined(it){
  if(it == undefined)throw TypeError('Function called on null or undefined');
  return it;
}
function assertFunction(it){
  assert(isFunction(it), it, ' is not a function!');
  return it;
}
function assertObject(it){
  assert(isObject(it), it, ' is not an object!');
  return it;
}
function assertInstance(it, Constructor, name){
  assert(it instanceof Constructor, name, ": use the 'new' operator!");
}

// Property descriptors & Symbol
function descriptor(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  }
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return defineProperty(object, key, descriptor(bitmap, value));
  } : simpleSet;
}
function uid(key){
  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
}
function getWellKnownSymbol(name, setter){
  return (Symbol && Symbol[name]) || (setter ? Symbol : safeSymbol)(SYMBOL + DOT + name);
}
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC   = !!function(){try{return defineProperty({}, DOT, ObjectProto)}catch(e){}}()
  , sid    = 0
  , hidden = createDefiner(1)
  , set    = Symbol ? simpleSet : hidden
  , safeSymbol = Symbol || uid;
function assignHidden(target, src){
  for(var key in src)hidden(target, key, src[key]);
  return target;
}

var SYMBOL_UNSCOPABLES = getWellKnownSymbol('unscopables')
  , ArrayUnscopables   = ArrayProto[SYMBOL_UNSCOPABLES] || {}
  , SYMBOL_SPECIES     = getWellKnownSymbol('species');
function setSpecies(C){
  if(framework || !isNative(C))defineProperty(C, SYMBOL_SPECIES, {
    configurable: true,
    get: returnThis
  });
}

// Iterators
var SYMBOL_ITERATOR = getWellKnownSymbol(ITERATOR)
  , SYMBOL_TAG      = getWellKnownSymbol(TO_STRING_TAG)
  , SUPPORT_FF_ITER = FF_ITERATOR in ArrayProto
  , ITER  = safeSymbol('iter')
  , KEY   = 1
  , VALUE = 2
  , Iterators = {}
  , IteratorPrototype = {}
  , NATIVE_ITERATORS = SYMBOL_ITERATOR in ArrayProto
    // Safari define byggy iterators w/o `next`
  , BUGGY_ITERATORS = 'keys' in ArrayProto && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, returnThis);
function setIterator(O, value){
  hidden(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  SUPPORT_FF_ITER && hidden(O, FF_ITERATOR, value);
}
function createIterator(Constructor, NAME, next, proto){
  Constructor[PROTOTYPE] = create(proto || IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor[PROTOTYPE]
    , iter  = get(proto, SYMBOL_ITERATOR) || get(proto, FF_ITERATOR) || (DEFAULT && get(proto, DEFAULT)) || value;
  if(framework){
    // Define iterator
    setIterator(proto, iter);
    if(iter !== value){
      var iterProto = getPrototypeOf(iter.call(new Constructor));
      // Set @@toStringTag to native iterators
      setToStringTag(iterProto, NAME + ' Iterator', true);
      // FF fix
      has(proto, FF_ITERATOR) && setIterator(iterProto, returnThis);
    }
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = returnThis;
  return iter;
}
function defineStdIterators(Base, NAME, Constructor, next, DEFAULT, IS_SET){
  function createIter(kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  createIterator(Constructor, NAME, next);
  var entries = createIter(KEY+VALUE)
    , values  = createIter(VALUE);
  if(DEFAULT == VALUE)values = defineIterator(Base, NAME, values, 'values');
  else entries = defineIterator(Base, NAME, entries, 'entries');
  if(DEFAULT){
    $define(PROTO + FORCED * BUGGY_ITERATORS, NAME, {
      entries: entries,
      keys: IS_SET ? values : createIter(KEY),
      values: values
    });
  }
}
function iterResult(done, value){
  return {value: value, done: !!done};
}
function isIterable(it){
  var O      = Object(it)
    , Symbol = global[SYMBOL]
    , hasExt = (Symbol && Symbol[ITERATOR] || FF_ITERATOR) in O;
  return hasExt || SYMBOL_ITERATOR in O || has(Iterators, classof(O));
}
function getIterator(it){
  var Symbol  = global[SYMBOL]
    , ext     = it[Symbol && Symbol[ITERATOR] || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[classof(it)];
  return assertObject(getIter.call(it));
}
function stepCall(fn, value, entries){
  return entries ? invoke(fn, value) : fn(value);
}
function forOf(iterable, entries, fn, that){
  var iterator = getIterator(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done)if(stepCall(f, step.value, entries) === false)return;
}

// core
var NODE = cof(process) == PROCESS
  , core = {}
  , path = framework ? global : core
  , old  = global.core
  , exportGlobal
  // type bitmap
  , FORCED = 1
  , GLOBAL = 2
  , STATIC = 4
  , PROTO  = 8
  , BIND   = 16
  , WRAP   = 32;
function $define(type, name, source){
  var key, own, out, exp
    , isGlobal = type & GLOBAL
    , target   = isGlobal ? global : (type & STATIC)
        ? global[name] : (global[name] || ObjectProto)[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // there is a similar native
    own = !(type & FORCED) && target && key in target
      && (!isFunction(target[key]) || isNative(target[key]));
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & BIND && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & WRAP && !framework && target[key] == out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp[PROTOTYPE] = out[PROTOTYPE];
    } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
    // export
    if(exports[key] != out)hidden(exports, key, exp);
    // extend global
    if(framework && target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && hidden(target, key, out);
    }
  }
}
// CommonJS export
if(typeof module != 'undefined' && module.exports)module.exports = core;
// RequireJS export
else if(isFunction(define) && define.amd)define(function(){return core});
// Export to global object
else exportGlobal = true;
if(exportGlobal || framework){
  core.noConflict = function(){
    global.core = old;
    return core;
  }
  global.core = core;
}

/******************************************************************************
 * Module : global                                                            *
 ******************************************************************************/

$define(GLOBAL + FORCED, {global: global});

/******************************************************************************
 * Module : es6_symbol                                                        *
 ******************************************************************************/

// ECMAScript 6 symbols shim
!function(TAG, SymbolRegistry, AllSymbols, setter){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      assert(!(this instanceof Symbol), SYMBOL + ' is not a ' + CONSTRUCTOR);
      var tag = uid(description)
        , sym = set(create(Symbol[PROTOTYPE]), TAG, tag);
      AllSymbols[tag] = sym;
      DESC && setter && defineProperty(ObjectProto, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      return sym;
    }
    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
      return this[TAG];
    });
  }
  $define(GLOBAL + WRAP, {Symbol: Symbol});
  
  var symbolStatics = {
    // 19.4.2.1 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.4 Symbol.iterator
    iterator: SYMBOL_ITERATOR,
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: part.call(keyOf, SymbolRegistry),
    // 19.4.2.10 Symbol.species
    species: SYMBOL_SPECIES,
    // 19.4.2.13 Symbol.toStringTag
    toStringTag: SYMBOL_TAG = getWellKnownSymbol(TO_STRING_TAG, true),
    // 19.4.2.14 Symbol.unscopables
    unscopables: SYMBOL_UNSCOPABLES,
    pure: safeSymbol,
    set: set,
    useSetter: function(){setter = true},
    useSimple: function(){setter = false}
  };
  // 19.4.2.2 Symbol.hasInstance
  // 19.4.2.3 Symbol.isConcatSpreadable
  // 19.4.2.6 Symbol.match
  // 19.4.2.8 Symbol.replace
  // 19.4.2.9 Symbol.search
  // 19.4.2.11 Symbol.split
  // 19.4.2.12 Symbol.toPrimitive
  forEach.call(array('hasInstance,isConcatSpreadable,match,replace,search,split,toPrimitive'),
    function(it){
      symbolStatics[it] = getWellKnownSymbol(it);
    }
  );
  $define(STATIC, SYMBOL, symbolStatics);
  
  setToStringTag(Symbol, SYMBOL);
  
  $define(STATIC + FORCED * !isNative(Symbol), OBJECT, {
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
      return result;
    },
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
      return result;
    }
  });
}(safeSymbol('tag'), {}, {}, true);

/******************************************************************************
 * Module : es6                                                               *
 ******************************************************************************/

// ECMAScript 6 shim
!function(RegExpProto, isFinite, tmp, NAME){
  var RangeError = global.RangeError
      // 20.1.2.3 Number.isInteger(number)
    , isInteger = Number.isInteger || function(it){
        return !isObject(it) && isFinite(it) && floor(it) === it;
      }
      // 20.2.2.28 Math.sign(x)
    , sign = Math.sign || function sign(x){
        return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
      }
    , E    = Math.E
    , pow  = Math.pow
    , abs  = Math.abs
    , exp  = Math.exp
    , log  = Math.log
    , sqrt = Math.sqrt
    , fcc  = String.fromCharCode
    , at   = createPointAt(true);
  
  var objectStatic = {
    // 19.1.3.1 Object.assign(target, source)
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: function(x, y){
      return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
    }
  };
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  '__proto__' in ObjectProto && function(buggy, set){
    try {
      set = ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set, 2);
      set({}, ArrayProto);
    } catch(e){ buggy = true }
    objectStatic.setPrototypeOf = setPrototypeOf = setPrototypeOf || function(O, proto){
      assertObject(O);
      assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
      if(buggy)O.__proto__ = proto;
      else set(O, proto);
      return O;
    }
  }();
  $define(STATIC, OBJECT, objectStatic);
  
  // 20.2.2.5 Math.asinh(x)
  function asinh(x){
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
  }
  // 20.2.2.14 Math.expm1(x)
  function expm1(x){
    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
  }
  
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: isInteger,
    // 20.1.2.4 Number.isNaN(number)
    isNaN: sameNaN,
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
  
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    acosh: function(x){
      return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
    },
    // 20.2.2.5 Math.asinh(x)
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    atanh: function(x){
      return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
    },
    // 20.2.2.9 Math.cbrt(x)
    cbrt: function(x){
      return sign(x = +x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32(x)
    clz32: function(x){
      return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    cosh: function(x){
      return (exp(x = +x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    expm1: expm1,
    // 20.2.2.16 Math.fround(x)
    // TODO: fallback for IE9-
    fround: function(x){
      return new Float32Array([x])[0];
    },
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    hypot: function(value1, value2){
      var sum  = 0
        , len1 = arguments.length
        , len2 = len1
        , args = Array(len1)
        , larg = -Infinity
        , arg;
      while(len1--){
        arg = args[len1] = +arguments[len1];
        if(arg == Infinity || arg == -Infinity)return Infinity;
        if(arg > larg)larg = arg;
      }
      larg = arg || 1;
      while(len2--)sum += pow(args[len2] / larg, 2);
      return larg * sqrt(sum);
    },
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var UInt16 = 0xffff
        , xn = +x
        , yn = +y
        , xl = UInt16 & xn
        , yl = UInt16 & yn;
      return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
    },
    // 20.2.2.20 Math.log1p(x)
    log1p: function(x){
      return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
    },
    // 20.2.2.21 Math.log10(x)
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    sinh: function(x){
      return (abs(x = +x) < 1) ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
    },
    // 20.2.2.33 Math.tanh(x)
    tanh: function(x){
      var a = expm1(x = +x)
        , b = expm1(-x);
      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
    },
    // 20.2.2.34 Math.trunc(x)
    trunc: trunc
  });
  // 20.2.1.9 Math[@@toStringTag]
  setToStringTag(Math, MATH, true);
  
  function assertNotRegExp(it){
    if(cof(it) == REGEXP)throw TypeError();
  }
  $define(STATIC, STRING, {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    fromCodePoint: function(x){
      var res = []
        , len = arguments.length
        , i   = 0
        , code
      while(len > i){
        code = +arguments[i++];
        if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
        res.push(code < 0x10000
          ? fcc(code)
          : fcc(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
        );
      } return res.join('');
    },
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function(callSite){
      var raw = toObject(callSite.raw)
        , len = toLength(raw.length)
        , sln = arguments.length
        , res = []
        , i   = 0;
      while(len > i){
        res.push(String(raw[i++]));
        if(i < sln)res.push(String(arguments[i]));
      } return res.join('');
    }
  });
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    codePointAt: createPointAt(false),
    // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString /*, endPosition = @length */){
      assertNotRegExp(searchString);
      var that = String(assertDefined(this))
        , endPosition = arguments[1]
        , len = toLength(that.length)
        , end = endPosition === undefined ? len : min(toLength(endPosition), len);
      searchString += '';
      return that.slice(end - searchString.length, end) === searchString;
    },
    // 21.1.3.7 String.prototype.includes(searchString, position = 0)
    includes: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      return !!~String(assertDefined(this)).indexOf(searchString, arguments[1]);
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var str = String(assertDefined(this))
        , res = ''
        , n   = toInteger(count);
      if(0 > n || n == Infinity)throw RangeError("Count can't be negative");
      for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
      return res;
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      var that  = String(assertDefined(this))
        , index = toLength(min(arguments[1], that.length));
      searchString += '';
      return that.slice(index, index + searchString.length) === searchString;
    }
  });
  // 21.1.3.27 String.prototype[@@iterator]()
  defineStdIterators(String, STRING, function(iterated){
    set(this, ITER, {o: String(iterated), i: 0});
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , index = iter.i
      , point;
    if(index >= O.length)return iterResult(1);
    point = at.call(O, index);
    iter.i += point.length;
    return iterResult(0, point);
  });
  
  $define(STATIC, ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
      var O       = Object(assertDefined(arrayLike))
        , result  = new (generic(this, Array))
        , mapfn   = arguments[1]
        , that    = arguments[2]
        , mapping = mapfn !== undefined
        , f       = mapping ? ctx(mapfn, that, 2) : undefined
        , index   = 0
        , length;
      if(isIterable(O))for(var iter = getIterator(O), step; !(step = iter.next()).done; index++){
        result[index] = mapping ? f(step.value, index) : step.value;
      } else for(length = toLength(O.length); length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
      result.length = index;
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/* ...args */){
      var index  = 0
        , length = arguments.length
        , result = new (generic(this, Array))(length);
      while(length > index)result[index] = arguments[index++];
      result.length = length;
      return result;
    }
  });
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    copyWithin: function(target /* = 0 */, start /* = 0, end = @length */){
      var O     = Object(assertDefined(this))
        , len   = toLength(O.length)
        , to    = toIndex(target, len)
        , from  = toIndex(start, len)
        , end   = arguments[2]
        , fin   = end === undefined ? len : toIndex(end, len)
        , count = min(fin - from, len - to)
        , inc   = 1;
      if(from < to && to < from + count){
        inc  = -1;
        from = from + count - 1;
        to   = to + count - 1;
      }
      while(count-- > 0){
        if(from in O)O[to] = O[from];
        else delete O[to];
        to += inc;
        from += inc;
      } return O;
    },
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value /*, start = 0, end = @length */){
      var O      = Object(assertDefined(this))
        , length = toLength(O.length)
        , index  = toIndex(arguments[1], length)
        , end    = arguments[2]
        , endPos = end === undefined ? length : toIndex(end, length);
      while(endPos > index)O[index++] = value;
      return O;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: createArrayMethod(5),
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: createArrayMethod(6)
  });
  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  defineStdIterators(Array, ARRAY, function(iterated, kind){
    set(this, ITER, {o: toObject(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , kind  = iter.k
      , index = iter.i++;
    if(!O || index >= O.length)return iter.o = undefined, iterResult(1);
    if(kind == KEY)  return iterResult(0, index);
    if(kind == VALUE)return iterResult(0, O[index]);
                     return iterResult(0, [index, O[index]]);
  }, VALUE);
  
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 24.3.3 JSON[@@toStringTag]
  setToStringTag(global.JSON, 'JSON', true);
  
  // Object static methods accept primitives
  function wrapObjectMethod(key, MODE){
    var fn  = Object[key]
      , exp = core[OBJECT][key]
      , f   = 0
      , o   = {};
    if(!exp || isNative(exp)){
      o[key] =
        MODE == 1 ? function(it){ return isObject(it) ? fn(it) : it } :
        MODE == 2 ? function(it){ return isObject(it) ? fn(it) : true } :
        MODE == 3 ? function(it){ return isObject(it) ? fn(it) : false } :
        MODE == 4 ? function(it, key){ return fn(toObject(it), key) } :
                    function(it){ return fn(toObject(it)) }
      try { fn(DOT) }
      catch(e){ f = 1}
      $define(STATIC + FORCED * f, OBJECT, o);
    }
  }
  wrapObjectMethod('freeze', 1);
  wrapObjectMethod('seal', 1);
  wrapObjectMethod('preventExtensions', 1);
  wrapObjectMethod('isFrozen', 2);
  wrapObjectMethod('isSealed', 2);
  wrapObjectMethod('isExtensible', 3);
  wrapObjectMethod('getOwnPropertyDescriptor', 4);
  wrapObjectMethod('getPrototypeOf');
  wrapObjectMethod('keys');
  wrapObjectMethod('getOwnPropertyNames');
  
  if(framework){
    // 19.1.3.6 Object.prototype.toString()
    tmp[SYMBOL_TAG] = DOT;
    if(cof(tmp) != DOT)hidden(ObjectProto, TO_STRING, function(){
      return '[object ' + classof(this) + ']';
    });
    
    // 19.2.4.2 name
    NAME in FunctionProto || defineProperty(FunctionProto, NAME, {
      configurable: true,
      get: function(){
        var match = String(this).match(/^\s*function ([^ (]*)/)
          , name  = match ? match[1] : '';
        has(this, NAME) || defineProperty(this, NAME, descriptor(5, name));
        return name;
      },
      set: function(value){
        has(this, NAME) || defineProperty(this, NAME, descriptor(0, value));
      }
    });
    
    // RegExp allows a regex with flags as the pattern
    if(DESC && !function(){try{return RegExp(/a/g, 'i') == '/a/i'}catch(e){}}()){
      var _RegExp = RegExp;
      RegExp = function RegExp(pattern, flags){
        return new _RegExp(cof(pattern) == REGEXP && flags !== undefined
          ? pattern.source : pattern, flags);
      }
      forEach.call(getNames(_RegExp), function(key){
        key in RegExp || defineProperty(RegExp, key, {
          configurable: true,
          get: function(){ return _RegExp[key] },
          set: function(it){ _RegExp[key] = it }
        });
      });
      RegExpProto[CONSTRUCTOR] = RegExp;
      RegExp[PROTOTYPE] = RegExpProto;
      hidden(global, REGEXP, RegExp);
    }
    
    // 21.2.5.3 get RegExp.prototype.flags()
    if(/./g.flags != 'g')defineProperty(RegExpProto, 'flags', {
      configurable: true,
      get: createReplacer(/^.*\/(\w*)$/, '$1')
    });
    
    // 22.1.3.31 Array.prototype[@@unscopables]
    forEach.call(array('find,findIndex,fill,copyWithin,entries,keys,values'), function(it){
      ArrayUnscopables[it] = true;
    });
    SYMBOL_UNSCOPABLES in ArrayProto || hidden(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);
  }
  
  setSpecies(RegExp);
  setSpecies(Array);
}(RegExp[PROTOTYPE], isFinite, {}, 'name');

/******************************************************************************
 * Module : immediate                                                         *
 ******************************************************************************/

// setImmediate shim
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || function(ONREADYSTATECHANGE){
  var postMessage      = global.postMessage
    , addEventListener = global.addEventListener
    , MessageChannel   = global.MessageChannel
    , counter          = 0
    , queue            = {}
    , defer, channel, port;
  setImmediate = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(NODE){
    defer = function(id){
      nextTick(part.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      html.appendChild(document[CREATE_ELEMENT]('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run(id);
      }
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(part.call(run, id), 0);
    }
  }
}('onreadystatechange');
$define(GLOBAL + BIND, {
  setImmediate:   setImmediate,
  clearImmediate: clearImmediate
});

/******************************************************************************
 * Module : es6_promise                                                       *
 ******************************************************************************/

// ES6 promises shim
// Based on https://github.com/getify/native-promise-only/
!function(Promise, test){
  isFunction(Promise) && isFunction(Promise.resolve)
  && Promise.resolve(test = new Promise(function(){})) == test
  || function(asap, DEF){
    function isThenable(o){
      var then;
      if(isObject(o))then = o.then;
      return isFunction(then) ? then : false;
    }
    function notify(def){
      var chain = def.chain;
      chain.length && asap(function(){
        var msg = def.msg
          , ok  = def.state == 1
          , i   = 0;
        while(chain.length > i)!function(react){
          var cb = ok ? react.ok : react.fail
            , ret, then;
          try {
            if(cb){
              ret = cb === true ? msg : cb(msg);
              if(ret === react.P){
                react.rej(TypeError(PROMISE + '-chain cycle'));
              } else if(then = isThenable(ret)){
                then.call(ret, react.res, react.rej);
              } else react.res(ret);
            } else react.rej(msg);
          } catch(err){
            react.rej(err);
          }
        }(chain[i++]);
        chain.length = 0;
      });
    }
    function resolve(msg){
      var def = this
        , then, wrapper;
      if(def.done)return;
      def.done = true;
      def = def.def || def; // unwrap
      try {
        if(then = isThenable(msg)){
          wrapper = {def: def, done: false}; // wrap
          then.call(msg, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
        } else {
          def.msg = msg;
          def.state = 1;
          notify(def);
        }
      } catch(err){
        reject.call(wrapper || {def: def, done: false}, err); // wrap
      }
    }
    function reject(msg){
      var def = this;
      if(def.done)return;
      def.done = true;
      def = def.def || def; // unwrap
      def.msg = msg;
      def.state = 2;
      notify(def);
    }
    function getConstructor(C){
      var S = assertObject(C)[SYMBOL_SPECIES];
      return S != undefined ? S : C;
    }
    // 25.4.3.1 Promise(executor)
    Promise = function(executor){
      assertFunction(executor);
      assertInstance(this, Promise, PROMISE);
      var def = {chain: [], state: 0, done: false, msg: undefined};
      hidden(this, DEF, def);
      try {
        executor(ctx(resolve, def, 1), ctx(reject, def, 1));
      } catch(err){
        reject.call(def, err);
      }
    }
    assignHidden(Promise[PROTOTYPE], {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function(onFulfilled, onRejected){
        var S = assertObject(assertObject(this)[CONSTRUCTOR])[SYMBOL_SPECIES];
        var react = {
          ok:   isFunction(onFulfilled) ? onFulfilled : true,
          fail: isFunction(onRejected)  ? onRejected  : false
        } , P = react.P = new (S != undefined ? S : Promise)(function(resolve, reject){
          react.res = assertFunction(resolve);
          react.rej = assertFunction(reject);
        }), def = this[DEF];
        def.chain.push(react);
        def.state && notify(def);
        return P;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function(onRejected){
        return this.then(undefined, onRejected);
      }
    });
    assignHidden(Promise, {
      // 25.4.4.1 Promise.all(iterable)
      all: function(iterable){
        var Promise = getConstructor(this)
          , values  = [];
        return new Promise(function(resolve, reject){
          forOf(iterable, false, push, values);
          var remaining = values.length
            , results   = Array(remaining);
          if(remaining)forEach.call(values, function(promise, index){
            Promise.resolve(promise).then(function(value){
              results[index] = value;
              --remaining || resolve(results);
            }, reject);
          });
          else resolve(results);
        });
      },
      // 25.4.4.4 Promise.race(iterable)
      race: function(iterable){
        var Promise = getConstructor(this);
        return new Promise(function(resolve, reject){
          forOf(iterable, false, function(promise){
            Promise.resolve(promise).then(resolve, reject);
          });
        });
      },
      // 25.4.4.5 Promise.reject(r)
      reject: function(r){
        return new (getConstructor(this))(function(resolve, reject){
          reject(r);
        });
      },
      // 25.4.4.6 Promise.resolve(x)
      resolve: function(x){
        return isObject(x) && DEF in x && getPrototypeOf(x) === this[PROTOTYPE]
          ? x : new (getConstructor(this))(function(resolve, reject){
            resolve(x);
          });
      }
    });
  }(nextTick || setImmediate, safeSymbol('def'));
  setToStringTag(Promise, PROMISE);
  setSpecies(Promise);
  $define(GLOBAL + FORCED * !isNative(Promise), {Promise: Promise});
}(global[PROMISE]);

/******************************************************************************
 * Module : es6_collections                                                   *
 ******************************************************************************/

// ECMAScript 6 collections shim
!function(){
  var UID   = safeSymbol('uid')
    , O1    = safeSymbol('O1')
    , WEAK  = safeSymbol('weak')
    , LEAK  = safeSymbol('leak')
    , LAST  = safeSymbol('last')
    , FIRST = safeSymbol('first')
    , SIZE  = DESC ? safeSymbol('size') : 'size'
    , uid   = 0
    , tmp   = {};
  
  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
    var ADDER = isMap ? 'set' : 'add'
      , proto = C && C[PROTOTYPE]
      , O     = {};
    function initFromIterable(that, iterable){
      if(iterable != undefined)forOf(iterable, isMap, that[ADDER], that);
      return that;
    }
    function fixSVZ(key, chain){
      var method = proto[key];
      if(framework)proto[key] = function(a, b){
        var result = method.call(this, a === 0 ? 0 : a, b);
        return chain ? this : result;
      };
    }
    if(!isNative(C) || !(isWeak || (!BUGGY_ITERATORS && has(proto, FOR_EACH) && has(proto, 'entries')))){
      // create collection constructor
      C = isWeak
        ? function(iterable){
            assertInstance(this, C, NAME);
            set(this, UID, uid++);
            initFromIterable(this, iterable);
          }
        : function(iterable){
            var that = this;
            assertInstance(that, C, NAME);
            set(that, O1, create(null));
            set(that, SIZE, 0);
            set(that, LAST, undefined);
            set(that, FIRST, undefined);
            initFromIterable(that, iterable);
          };
      assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);
      isWeak || defineProperty(C[PROTOTYPE], 'size', {get: function(){
        return assertDefined(this[SIZE]);
      }});
    } else {
      var Native = C
        , inst   = new C
        , chain  = inst[ADDER](isWeak ? {} : -0, 1)
        , buggyZero;
      // wrap to init collections from iterable
      if(!NATIVE_ITERATORS || !C.length){
        C = function(iterable){
          assertInstance(this, C, NAME);
          return initFromIterable(new Native, iterable);
        }
        C[PROTOTYPE] = proto;
        if(framework)proto[CONSTRUCTOR] = C;
      }
      isWeak || inst[FOR_EACH](function(val, key){
        buggyZero = 1 / key === -Infinity;
      });
      // fix converting -0 key to +0
      if(buggyZero){
        fixSVZ('delete');
        fixSVZ('has');
        isMap && fixSVZ('get');
      }
      // + fix .add & .set for chaining
      if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
    }
    setToStringTag(C, NAME);
    setSpecies(C);
    
    O[NAME] = C;
    $define(GLOBAL + WRAP + FORCED * !isNative(C), O);
    
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    isWeak || defineStdIterators(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        return iter.o = undefined, iterResult(1);
      }
      // return step by kind
      if(kind == KEY)  return iterResult(0, entry.k);
      if(kind == VALUE)return iterResult(0, entry.v);
                       return iterResult(0, [entry.k, entry.v]);   
    }, isMap ? KEY+VALUE : VALUE, !isMap);
    
    return C;
  }
  
  function fastKey(it, create){
    // return primitive with prefix
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // can't set id to frozen object
    if(isFrozen(it))return 'F';
    if(!has(it, UID)){
      // not necessary to add id
      if(!create)return 'E';
      // add missing object id
      hidden(it, UID, ++uid);
    // return object id with prefix
    } return 'O' + it[UID];
  }
  function getEntry(that, key){
    // fast case
    var index = fastKey(key), entry;
    if(index != 'F')return that[O1][index];
    // frozen object case
    for(entry = that[FIRST]; entry; entry = entry.n){
      if(entry.k == key)return entry;
    }
  }
  function def(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry)entry.v = value;
    // create new entry
    else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  }

  var collectionMethods = {
    // 23.1.3.1 Map.prototype.clear()
    // 23.2.3.2 Set.prototype.clear()
    clear: function(){
      for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
        entry.r = true;
        entry.p = entry.n = undefined;
        delete data[entry.i];
      }
      that[FIRST] = that[LAST] = undefined;
      that[SIZE] = 0;
    },
    // 23.1.3.3 Map.prototype.delete(key)
    // 23.2.3.4 Set.prototype.delete(value)
    'delete': function(key){
      var that  = this
        , entry = getEntry(that, key);
      if(entry){
        var next = entry.n
          , prev = entry.p;
        delete that[O1][entry.i];
        entry.r = true;
        if(prev)prev.n = next;
        if(next)next.p = prev;
        if(that[FIRST] == entry)that[FIRST] = next;
        if(that[LAST] == entry)that[LAST] = prev;
        that[SIZE]--;
      } return !!entry;
    },
    // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
    // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
    forEach: function(callbackfn /*, that = undefined */){
      var f = ctx(callbackfn, arguments[1], 3)
        , entry;
      while(entry = entry ? entry.n : this[FIRST]){
        f(entry.v, entry.k, this);
        // revert to the last existing entry
        while(entry && entry.r)entry = entry.p;
      }
    },
    // 23.1.3.7 Map.prototype.has(key)
    // 23.2.3.7 Set.prototype.has(value)
    has: function(key){
      return !!getEntry(this, key);
    }
  }
  
  // 23.1 Map Objects
  Map = getCollection(Map, MAP, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function(key){
      var entry = getEntry(this, key);
      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function(key, value){
      return def(this, key === 0 ? 0 : key, value);
    }
  }, collectionMethods, true);
  
  // 23.2 Set Objects
  Set = getCollection(Set, SET, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function(value){
      return def(this, value = value === 0 ? 0 : value, value);
    }
  }, collectionMethods);
  
  function defWeak(that, key, value){
    if(isFrozen(assertObject(key)))leakStore(that).set(key, value);
    else {
      has(key, WEAK) || hidden(key, WEAK, {});
      key[WEAK][that[UID]] = value;
    } return that;
  }
  function leakStore(that){
    return that[LEAK] || hidden(that, LEAK, new Map)[LEAK];
  }
  
  var weakMethods = {
    // 23.3.3.2 WeakMap.prototype.delete(key)
    // 23.4.3.3 WeakSet.prototype.delete(value)
    'delete': function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this)['delete'](key);
      return has(key, WEAK) && has(key[WEAK], this[UID]) && delete key[WEAK][this[UID]];
    },
    // 23.3.3.4 WeakMap.prototype.has(key)
    // 23.4.3.4 WeakSet.prototype.has(value)
    has: function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this).has(key);
      return has(key, WEAK) && has(key[WEAK], this[UID]);
    }
  };
  
  // 23.3 WeakMap Objects
  WeakMap = getCollection(WeakMap, WEAKMAP, {
    // 23.3.3.3 WeakMap.prototype.get(key)
    get: function(key){
      if(isObject(key)){
        if(isFrozen(key))return leakStore(this).get(key);
        if(has(key, WEAK))return key[WEAK][this[UID]];
      }
    },
    // 23.3.3.5 WeakMap.prototype.set(key, value)
    set: function(key, value){
      return defWeak(this, key, value);
    }
  }, weakMethods, true, true);
  
  // IE11 WeakMap frozen keys fix
  if(framework && DESC && new WeakMap([[Object.freeze(tmp), 7]]).get(tmp) != 7){
    forEach.call(array('delete,has,get,set'), function(key){
      var method = WeakMap[PROTOTYPE][key];
      WeakMap[PROTOTYPE][key] = function(a, b){
        // store frozen objects on leaky map
        if(isObject(a) && isFrozen(a)){
          var result = leakStore(this)[key](a, b);
          return key == 'set' ? this : result;
        // store all the rest on native weakmap
        } return method.call(this, a, b);
      };
    });
  }
  
  // 23.4 WeakSet Objects
  WeakSet = getCollection(WeakSet, WEAKSET, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function(value){
      return defWeak(this, value, true);
    }
  }, weakMethods, false, true);
}();

/******************************************************************************
 * Module : es6_reflect                                                       *
 ******************************************************************************/

!function(){
  function Enumerate(iterated){
    var keys = [], key;
    for(key in iterated)keys.push(key);
    set(this, ITER, {o: iterated, a: keys, i: 0});
  }
  createIterator(Enumerate, OBJECT, function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    do {
      if(iter.i >= keys.length)return iterResult(1);
    } while(!((key = keys[iter.i++]) in iter.o));
    return iterResult(0, key);
  });
  
  function wrap(fn){
    return function(it){
      assertObject(it);
      try {
        return fn.apply(undefined, arguments), true;
      } catch(e){
        return false;
      }
    }
  }
  
  function reflectGet(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = getOwnDescriptor(assertObject(target), propertyKey), proto;
    if(desc)return desc.get ? desc.get.call(receiver) : desc.value;
    return isObject(proto = getPrototypeOf(target)) ? reflectGet(proto, propertyKey, receiver) : undefined;
  }
  function reflectSet(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , desc = getOwnDescriptor(assertObject(target), propertyKey), proto;
    if(desc){
      if(desc.writable === false)return false;
      if(desc.set)return desc.set.call(receiver, V), true;
    }
    if(isObject(proto = getPrototypeOf(target)))return reflectSet(proto, propertyKey, V, receiver);
    desc = getOwnDescriptor(receiver, propertyKey) || descriptor(0);
    desc.value = V;
    return defineProperty(receiver, propertyKey, desc), true;
  }
  var isExtensible = Object.isExtensible || returnIt;
  
  var reflect = {
    // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
    apply: ctx(call, apply, 3),
    // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
    construct: construct,
    // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
    defineProperty: wrap(defineProperty),
    // 26.1.4 Reflect.deleteProperty(target, propertyKey)
    deleteProperty: function(target, propertyKey){
      var desc = getOwnDescriptor(assertObject(target), propertyKey);
      return desc && !desc.configurable ? false : delete target[propertyKey];
    },
    // 26.1.5 Reflect.enumerate(target)
    enumerate: function(target){
      return new Enumerate(assertObject(target));
    },
    // 26.1.6 Reflect.get(target, propertyKey [, receiver])
    get: reflectGet,
    // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
    getOwnPropertyDescriptor: function(target, propertyKey){
      return getOwnDescriptor(assertObject(target), propertyKey);
    },
    // 26.1.8 Reflect.getPrototypeOf(target)
    getPrototypeOf: function(target){
      return getPrototypeOf(assertObject(target));
    },
    // 26.1.9 Reflect.has(target, propertyKey)
    has: function(target, propertyKey){
      return propertyKey in target;
    },
    // 26.1.10 Reflect.isExtensible(target)
    isExtensible: function(target){
      return !!isExtensible(assertObject(target));
    },
    // 26.1.11 Reflect.ownKeys(target)
    ownKeys: ownKeys,
    // 26.1.12 Reflect.preventExtensions(target)
    preventExtensions: wrap(Object.preventExtensions || returnIt),
    // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
    set: reflectSet
  }
  // 26.1.14 Reflect.setPrototypeOf(target, proto)
  if(setPrototypeOf)reflect.setPrototypeOf = function(target, proto){
    return setPrototypeOf(assertObject(target), proto), true;
  };
  
  $define(GLOBAL, {Reflect: {}});
  $define(STATIC, 'Reflect', reflect);
}();

/******************************************************************************
 * Module : es7                                                               *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // https://github.com/domenic/Array.prototype.includes
    includes: createArrayContains(true)
  });
  $define(PROTO, STRING, {
    // https://github.com/mathiasbynens/String.prototype.at
    at: createPointAt(true)
  });
  
  function createObjectToArray(isEntries){
    return function(object){
      var O      = toObject(object)
        , keys   = getKeys(object)
        , length = keys.length
        , i      = 0
        , result = Array(length)
        , key;
      if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
      else while(length > i)result[i] = O[keys[i++]];
      return result;
    }
  }
  $define(STATIC, OBJECT, {
    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
    values: createObjectToArray(false),
    entries: createObjectToArray(true)
  });
  $define(STATIC, REGEXP, {
    // https://gist.github.com/kangax/9698100
    escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
  });
}();

/******************************************************************************
 * Module : es7_refs                                                          *
 ******************************************************************************/

// https://github.com/zenparsing/es-abstract-refs
!function(REFERENCE){
  REFERENCE_GET = getWellKnownSymbol(REFERENCE+'Get', true);
  var REFERENCE_SET = getWellKnownSymbol(REFERENCE+SET, true)
    , REFERENCE_DELETE = getWellKnownSymbol(REFERENCE+'Delete', true);
  
  $define(STATIC, SYMBOL, {
    referenceGet: REFERENCE_GET,
    referenceSet: REFERENCE_SET,
    referenceDelete: REFERENCE_DELETE
  });
  
  hidden(FunctionProto, REFERENCE_GET, returnThis);
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor[PROTOTYPE];
      hidden(MapProto, REFERENCE_GET, MapProto.get);
      hidden(MapProto, REFERENCE_SET, MapProto.set);
      hidden(MapProto, REFERENCE_DELETE, MapProto['delete']);
    }
  }
  setMapMethods(Map);
  setMapMethods(WeakMap);
}('reference');

/******************************************************************************
 * Module : dom_itarable                                                      *
 ******************************************************************************/

!function(NodeList){
  if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList[PROTOTYPE])){
    hidden(NodeList[PROTOTYPE], SYMBOL_ITERATOR, Iterators[ARRAY]);
  }
  Iterators.NodeList = Iterators[ARRAY];
}(global.NodeList);

/******************************************************************************
 * Module : array_statics                                                     *
 ******************************************************************************/

// JavaScript 1.6 / Strawman array statics shim
!function(arrayStatics){
  function setArrayStatics(keys, length){
    forEach.call(array(keys), function(key){
      if(key in ArrayProto)arrayStatics[key] = ctx(call, ArrayProto[key], length);
    });
  }
  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
                  'reduce,reduceRight,copyWithin,fill,turn');
  $define(STATIC, ARRAY, arrayStatics);
}({});
}(typeof self != 'undefined' && self.Math === Math ? self : Function('return this')(), true);
},{}],3:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryList) {
    return new Generator(innerFn, outerFn, self || null, tryList || []);
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, outerFn, self, tryList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryList);
      var callNext = step.bind(generator.next);
      var callThrow = step.bind(generator["throw"]);

      function step(arg) {
        var record = tryCatch(this, null, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function Generator(innerFn, outerFn, self, tryList) {
    var generator = outerFn ? Object.create(outerFn.prototype) : this;
    var context = new Context(tryList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;

            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedStart &&
              typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError(
              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
            );
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(record.arg);
          } else {
            arg = record.arg;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator["throw"] = invoke.bind(generator, "throw");
    generator["return"] = invoke.bind(generator, "return");

    return generator;
  }

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(triple) {
    var entry = { tryLoc: triple[0] };

    if (1 in triple) {
      entry.catchLoc = triple[1];
    }

    if (2 in triple) {
      entry.finallyLoc = triple[2];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry, i) {
    var record = entry.completion || {};
    record.type = i === 0 ? "normal" : "return";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    _findFinallyEntry: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") && (
              entry.finallyLoc === finallyLoc ||
              this.prev < entry.finallyLoc)) {
          return entry;
        }
      }
    },

    abrupt: function(type, arg) {
      var entry = this._findFinallyEntry();
      var record = entry ? entry.completion : {};

      record.type = type;
      record.arg = arg;

      if (entry) {
        this.next = entry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      var entry = this._findFinallyEntry(finallyLoc);
      return this.complete(entry.completion);
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry, i);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
module.exports = require("./lib/6to5/polyfill");

},{"./lib/6to5/polyfill":1}],5:[function(require,module,exports){
module.exports = require("6to5-core/polyfill");

},{"6to5-core/polyfill":4}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = assert;

function assert(condition) {
  var message = arguments[1] === undefined ? "Assertion failed" : arguments[1];

  if (!condition) {
    debugger;

    if (typeof Error !== "undefined") {
      throw new Error(message);
    }
    throw message; // Fallback
  }
}

module.exports = exports["default"];

},{}],7:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
/*
  Bindings for editing Territories
*/

var _assert = require('../assert');

var _assert2 = _interopRequireWildcard(_assert);

var _on$emit = require('../pubsub');

var _eventTarget = require('../event-target');

var _eventTarget2 = _interopRequireWildcard(_eventTarget);

var _Queue = require('../queue');

var _Queue2 = _interopRequireWildcard(_Queue);

// import undoManager from '../undo-manager';

var _Territory$Drawing$Node$Point = require('../drawing-class');

var _DirectionsService$LatLng = require('../map-class');

var _MapView = require('../map-view');

var directionsService = new _DirectionsService$LatLng.DirectionsService();

var CREATE_MODE = 0,
    EDIT_MODE = 1;

function latLngFromPoint(point) {
  _assert2['default'](point instanceof _Territory$Drawing$Node$Point.Point);

  return new _DirectionsService$LatLng.LatLng(point.y, point.x);
}

function pointFromLatLng(latLng) {
  _assert2['default'](typeof latLng.lat === 'function' && typeof latLng.lng === 'function');

  return new _Territory$Drawing$Node$Point.Point(latLng.lng(), latLng.lat());
}

function renderDrawing(_ref) {
  var drawing = _ref.drawing;
}

function renderNode(_ref2) {
  var node = _ref2.node;
}

function listenToNode(node) {
  return;

  node.on(_Territory$Drawing$Node$Point.Node.event.MOVED, renderNode);
}

function ignoreNode(node) {
  return;

  node.off(_Territory$Drawing$Node$Point.Node.event.MOVED, renderNode);
}

function listenToDrawing(drawing) {
  return;

  drawing.on(_Territory$Drawing$Node$Point.Drawing.event.POINTS_ADDED, renderDrawing);
  drawing.on(_Territory$Drawing$Node$Point.Drawing.event.POINTS_REMOVED, renderDrawing);
  drawing.on(_Territory$Drawing$Node$Point.Drawing.event.COLOR_CHANGED, renderDrawing);
  drawing.on(_Territory$Drawing$Node$Point.Drawing.event.FILL_CHANGED, renderDrawing);

  var nodes = drawing.nodes();

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var node = _step.value;

      listenToNode(node);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function ignoreDrawing(drawing) {
  return;

  drawing.off(_Territory$Drawing$Node$Point.Drawing.event.POINTS_ADDED, renderDrawing);
  drawing.off(_Territory$Drawing$Node$Point.Drawing.event.POINTS_REMOVED, renderDrawing);
  drawing.off(_Territory$Drawing$Node$Point.Drawing.event.COLOR_CHANGED, renderDrawing);
  drawing.off(_Territory$Drawing$Node$Point.Drawing.event.FILL_CHANGED, renderDrawing);

  var nodes = drawing.nodes();

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var node = _step2.value;

      ignoreNode(node);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
        _iterator2['return']();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

var TerritoryEditorCmp = (function () {
  function TerritoryEditorCmp() {
    var _this = this;

    _classCallCheck(this, TerritoryEditorCmp);

    this.territory = new _Territory$Drawing$Node$Point.Territory();

    this._state = {
      createNewDrawing: false,
      rigid: false,
      fill: false,
      color: '#ff0000',
      mode: CREATE_MODE,
      activeDrawingIndex: -1,
      activeNodeIndex: -1
    };

    this.queue = new _Queue2['default']();

    _on$emit.on(_MapView.MapView.event.MAP_PRESSED, function (eventName, event) {
      return _this.addNode(event);
    });
    // on( MapView.event.MARKER_PRESSED, this.editDrawing );
    _on$emit.on(_MapView.MapView.event.MARKER_DRAGENDED, function (eventName, event) {
      return _this.moveNode(event);
    });
    // on( MapView.event.POLY_PRESSED, this.editDrawing );

    // mapView.on( MapCanvas.event.PRESSED, this.addNode );
    // mapView.on( Marker.event.PRESSED, this.editDrawing );
    // mapView.on( Marker.event.DRAGGED, this.moveNode );
    // mapView.on( Poly.event.PRESSED, this.editDrawing );
  }

  _createClass(TerritoryEditorCmp, [{
    key: 'createNewDrawing',
    get: function () {
      return this._state.createNewDrawing;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'boolean', 'Value of createNewDrawing must be boolean');

      this._state.createNewDrawing = value;
    }
  }, {
    key: 'rigid',
    get: function () {
      return this._state.rigid;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'boolean', 'Value of rigid must be boolean');

      this._state.rigid = value;
    }
  }, {
    key: 'fill',
    get: function () {
      return this._state.fill;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'boolean', 'Value of fill must be boolean');

      this._state.fill = value;
    }
  }, {
    key: 'color',
    get: function () {
      return this._state.color;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'string', 'Value of color must be string');

      this._state.color = value;
    }
  }, {
    key: 'mode',
    get: function () {
      return this._state.mode;
    },
    set: function (value) {
      _assert2['default'](Number.isInteger(value), 'Value of mode must be a constant');

      this._state.mode = value;
    }
  }, {
    key: 'activeDrawingIndex',
    get: function () {
      return this._state.activeDrawingIndex;
    },
    set: function (value) {
      _assert2['default'](Number.isInteger(value), 'Value of activeDrawingIndex must be integer');

      this._state.activeDrawingIndex = value;
    }
  }, {
    key: 'activeNodeIndex',
    get: function () {
      return this._state.activeNodeIndex;
    },
    set: function (value) {
      _assert2['default'](Number.isInteger(value), 'Value of activeNodeIndex must be integer');

      this._state.activeNodeIndex = value;
    }
  }, {
    key: 'addDrawing',
    value: function addDrawing() {
      var _state = this._state;
      var rigid = _state.rigid;
      var fill = _state.fill;
      var color = _state.color;
      var drawing = new _Territory$Drawing$Node$Point.Drawing({ rigid: rigid, fill: fill, color: color });
      var atIndex = ++this.activeDrawingIndex;

      this.territory.addDrawing({
        atIndex: atIndex,
        drawing: drawing
      });

      listenToDrawing(drawing);
    }
  }, {
    key: 'removeDrawing',
    value: function removeDrawing() {
      var activeDrawingIndex = this.activeDrawingIndex--,
          drawing = this.territory.removeDrawingAtIndex(activeDrawingIndex);

      ignoreDrawing(drawing);
    }
  }, {
    key: 'fillPathAroundNode',
    value: function fillPathAroundNode(_ref3) {
      var drawing = _ref3.drawing;
      var node = _ref3.node;

      var _drawing$nodesAroundNode, start, end, _latLngs, _points$0, x, y, latLngs, points, _points$shift, _points$pop, _points$shift2, _points$pop2;

      return regeneratorRuntime.async(function fillPathAroundNode$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _assert2['default'](drawing instanceof _Territory$Drawing$Node$Point.Drawing);
            _assert2['default'](node instanceof _Territory$Drawing$Node$Point.Node);

            _drawing$nodesAroundNode = drawing.nodesAroundNode(node);
            start = _drawing$nodesAroundNode.start;
            end = _drawing$nodesAroundNode.end;

            if (drawing.rigid) {
              context$2$0.next = 68;
              break;
            }

            if (!(start === node && end === node)) {
              context$2$0.next = 23;
              break;
            }

            _latLngs = undefined;
            context$2$0.prev = 8;
            context$2$0.next = 11;
            return directionsService.route({
              origin: latLngFromPoint(node),
              destination: latLngFromPoint(node)
            });

          case 11:
            _latLngs = context$2$0.sent;
            context$2$0.next = 17;
            break;

          case 14:
            context$2$0.prev = 14;
            context$2$0.t0 = context$2$0['catch'](8);

            alert(context$2$0.t0);

          case 17:

            points = _latLngs.map(pointFromLatLng);

            _assert2['default'](points.length > 0);

            _points$0 = points[0];
            x = _points$0.x;
            y = _points$0.y;

            this.queue.add(node.moveTo.bind(node, x, y));

          case 23:
            latLngs = undefined, points = undefined;

            if (!(start !== node)) {
              context$2$0.next = 46;
              break;
            }

            context$2$0.prev = 25;
            context$2$0.next = 28;
            return directionsService.route({
              origin: latLngFromPoint(start),
              destination: latLngFromPoint(node)
            });

          case 28:
            latLngs = context$2$0.sent;
            context$2$0.next = 34;
            break;

          case 31:
            context$2$0.prev = 31;
            context$2$0.t1 = context$2$0['catch'](25);

            alert(context$2$0.t1);

          case 34:

            points = latLngs.map(pointFromLatLng);

            x = undefined, y = undefined;
            _points$shift = points.shift();
            x = _points$shift.x;
            y = _points$shift.y;

            start.moveTo(x, y);
            _points$pop = points.pop();
            x = _points$pop.x;
            y = _points$pop.y;

            node.moveTo(x, y);

            this.queue.add(drawing.removePointsBetweenNodes.bind(drawing, start, node));
            this.queue.add(drawing.addPointsAfterNode.bind(drawing, start, points));

          case 46:
            if (!(end !== node)) {
              context$2$0.next = 68;
              break;
            }

            context$2$0.prev = 47;
            context$2$0.next = 50;
            return directionsService.route({
              origin: latLngFromPoint(node),
              destination: latLngFromPoint(end)
            });

          case 50:
            latLngs = context$2$0.sent;
            context$2$0.next = 56;
            break;

          case 53:
            context$2$0.prev = 53;
            context$2$0.t2 = context$2$0['catch'](47);

            alert(context$2$0.t2);

          case 56:

            points = latLngs.map(pointFromLatLng);

            x = undefined, y = undefined;
            _points$shift2 = points.shift();
            x = _points$shift2.x;
            y = _points$shift2.y;

            node.moveTo(x, y);
            _points$pop2 = points.pop();
            x = _points$pop2.x;
            y = _points$pop2.y;

            end.moveTo(x, y);

            this.queue.add(drawing.removePointsBetweenNodes.bind(drawing, node, end));
            this.queue.add(drawing.addPointsAfterNode.bind(drawing, node, points));

          case 68:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[8, 14], [25, 31], [47, 53]]);
    }
  }, {
    key: 'addNode',
    value: function addNode(event) {
      var _this2 = this;

      if (this.createNewDrawing) {
        this.addDrawing();
        this.createNewDrawing = false;
      }

      var drawing = this.territory.atIndex(this.activeDrawingIndex);
      var activeNodeIndex = ++this.activeNodeIndex;var x = event.latLng.lng();

      var y = event.latLng.lat();
      var node = new _Territory$Drawing$Node$Point.Node(x, y);

      this.queue.add(function () {
        drawing.addNode(node, activeNodeIndex);

        _this2.fillPathAroundNode({ drawing: drawing, node: node });
        // undoManager.add({
        //   undo() {
        //     this.removeNode();
        //   },
        //   redo() {
        //     this.addNode( event );
        //   }
        // })
      });

      listenToNode(node);
    }
  }, {
    key: 'moveNode',
    value: function moveNode(_ref4) {
      var _this3 = this;

      var latLng = _ref4.latLng;
      var node = _ref4.node;

      _assert2['default'](node instanceof _Territory$Drawing$Node$Point.Node);

      var drawing = this.territory.find(function (drawing) {
        return drawing.indexOf(node) > -1;
      }),
          newPoint = pointFromLatLng(latLng);

      _assert2['default'](drawing instanceof _Territory$Drawing$Node$Point.Drawing);

      this.queue.add(function () {
        node.moveTo(newPoint.x, newPoint.y);

        return _this3.fillPathAroundNode({ drawing: drawing, node: node });
      });
    }
  }, {
    key: 'removeNode',
    value: function removeNode() {
      var _this4 = this;

      this.queue.add(function () {
        var drawing = _this4.territory.atIndex(_this4.activeDrawingIndex);

        var node = drawing.removeNodeAtIndex(_this4.activeNodeIndex);

        ignoreNode(node);
      });
    }
  }, {
    key: 'getTerritoryGeoJson',
    value: function getTerritoryGeoJson() {
      return this.territory.toGeoJson();
    }
  }, {
    key: 'detachedCallback',

    // Called when element is removed
    value: function detachedCallback() {
      // Remove bindings between territory and map
      this.territory.forEach(ignoreDrawing);
    }
  }]);

  return TerritoryEditorCmp;
})();

exports['default'] = TerritoryEditorCmp;
module.exports = exports['default'];
/* syncedStorage */
// Single node

// Push to previous node

// Push to next node

// export function oldMain( mapView ) {
//   on( Drawing.event.COLOR_CHANGED, ( eventName, { color, context }) => {
//     changeDrawing( context, { color });
//   });

//   on( Drawing.event.FILL_CHANGED, ( eventName, { fill, context }) => {
//     changeDrawing( context, { fill });
//   });

//   on( Drawing.event.RIGID_CHANGED, ( eventName, { rigid, context }) =>  {

//   });

//   const CREATE_MODE = 'Mode.create',
//     EDIT_MODE = 'Mode.edit';

//   const queue = new Queue();

//   let territory = new Territory();

//   const directionsService = new DirectionsService(),
//     route = directionsService.route.bind( directionsService );

//   const drawings = new WeakMap(),
//     nodes = new WeakMap();

//   // let drawingMode = CREATE_MODE,
//   //   createNewDrawing = true,
//   //   rigid = false,
//   //   color = '#ff0000',
//   //   fill = true;

//   /*
//     ********** DEBUG ONLY **********
//     ********** DEBUG ONLY **********
//     ********** DEBUG ONLY **********
//     */
//   window.drawingMode = CREATE_MODE,
//     window.createNewDrawing = true,
//     window.rigid = false,
//     window.color = '#ff0000',
//     window.fill = true;

//   let geoJsons = JSON.parse(
//     localStorage.getItem( 'drawings' ) || '[]'
//   );

//   for ( let geoJson of geoJsons ) {
//     mapView.data.addGeoJson( geoJson );
//   }

//   window.saveDrawing = function() {
//     let geoJson = territory.toGeoJson(),
//       storedDrawings = JSON.parse(
//         localStorage.getItem( 'drawings' ) || '[]'
//       );

//     storedDrawings.push( geoJson );
//     localStorage.setItem( 'drawings', JSON.stringify( storedDrawings ) );

//     mapView.data.addGeoJson( geoJson );

//     for ( let i = territory.length - 1; i >= 0; i-- ) {
//       territory.removeDrawingAtIndex( i );
//     }

//     window.createNewDrawing = true;
//   };

//   function latLngFromPoint( point ) {
//     assert( point instanceof Point );

//     return new LatLng( point.y, point.x );
//   }

//   function pointFromLatLng( latLng ) {
//     assert( typeof latLng.lat === 'function' &&
//       typeof latLng.lng === 'function' );

//     return new Point( latLng.lng(), latLng.lat() );
//   }

//   function createNodeFromLatLng( latLng ) {
//     return new Node( latLng.lng(), latLng.lat() );
//   }

//   function createPointFromLatLng( latLng ) {
//     return new Point( latLng.lng(), latLng.lat() );
//   }

//   async function fillPathAroundNode({ drawing, node }) {
//     assert( drawing instanceof Drawing );
//     assert( node instanceof Node );

//     let { start, end } = drawing.nodesAroundNode( node );

//     if ( !drawing.rigid ) {
//       if ( start === node && end === node ) {
//         // Single node
//         let latLngs;
//         try {
//           latLngs = await route({
//             origin: latLngFromPoint( node ),
//             destination: latLngFromPoint( node )
//           });
//         } catch ( e ) {
//           alert( e );
//         }

//         points = latLngs.map( pointFromLatLng );

//         assert( points.length > 0 );

//         let { x, y } = points[ 0 ];
//         queue.add( node.moveTo.bind( node, x, y ) );
//       }

//       let latLngs, points;
//       if ( start !== node ) {
//         // Push to previous node
//         try {
//           latLngs = await route({
//             origin: latLngFromPoint( start ),
//             destination: latLngFromPoint( node )
//           });
//         } catch ( e ) {
//           alert( e );
//         }

//         points = latLngs.map( pointFromLatLng );

//         let x, y;
//         ({ x, y }) = points.shift();
//         start.moveTo( x, y );
//         ({ x, y }) = points.pop();
//         node.moveTo( x, y );

//         queue.add( drawing.removePointsBetweenNodes.bind( drawing, start, node ) );
//         queue.add( drawing.addPointsAfterNode.bind( drawing, start, points ) );
//       }

//       if ( end !== node ) {
//         // Push to next node
//         try {
//           latLngs = await route({
//             origin: latLngFromPoint( node ),
//             destination: latLngFromPoint( end )
//           });
//         } catch ( e ) {
//           alert( e );
//         }

//         points = latLngs.map( pointFromLatLng );

//         let x, y;
//         ({ x, y }) = points.shift();
//         node.moveTo( x, y );
//         ({ x, y }) = points.pop();
//         end.moveTo( x, y );

//         queue.add( drawing.removePointsBetweenNodes.bind( drawing, node, end ) );
//         queue.add( drawing.addPointsAfterNode.bind( drawing, node, points ) );
//       }
//     }
//   }

//   function pressed( eventName, { latLng, node }) {
//     if ( drawingMode === EDIT_MODE ) {
//       // Identify clicked segment
//       // Highlight segment on map
//     } else {
//       drawingMode = EDIT_MODE;
//     }
//   }

//   on( MapView.event.MARKER_PRESSED, pressed );
//   on( MapView.event.POLY_PRESSED, pressed );

//   mapView.on( MapView.event.MARKER_DRAGSTARTED, ({ latLng, node }) => {
//     assert( node instanceof Node );

//     let drawing = territory.find(( drawing ) => drawing.indexOf( node ) > -1 );

//     assert( drawing instanceof Drawing );

//     // queue.add( drawing.removeNode.bind( drawing, node ) );
//   });

//   on( MapView.event.MARKER_DRAGGED, ( eventName, { latLng, node }) => {
//     assert( node instanceof Node );

//     let point = createPointFromLatLng( latLng );

//     node.moveTo( point.x, point.y );
//   });

//   on( MapView.event.MARKER_DRAGENDED, ( eventName, { latLng, node }) => {
//     assert( node instanceof Node );

//     let drawing = territory.find(( drawing ) => drawing.indexOf( node ) > -1 ),
//       newPoint = createPointFromLatLng( latLng );

//     assert( drawing instanceof Drawing );

//     queue.add( node.moveTo.bind( node, newPoint.x, newPoint.y ) )
//       .add( fillPathAroundNode.bind( null, { drawing, node }) );
//   });

//   on( MapView.event.MAP_PRESSED, ( eventName, { latLng }) => {
//     if ( drawingMode === EDIT_MODE ) {
//       // Exit edit mode when map is pressed
//       drawingMode = CREATE_MODE;
//     } else if ( drawingMode === CREATE_MODE ) {
//       let node = createNodeFromLatLng( latLng );

//       if ( createNewDrawing ) {
//         // Add drawing to end of array
//         let drawing = new Drawing({
//           fill,
//           rigid,
//           color
//         });

//         queue.add( territory.addDrawing.bind( territory, {
//           atIndex: territory.length,
//           drawing
//         }) )
//           .add( drawing.addNode.bind( drawing, node, undefined ) )
//           .add(() => territory.activeDrawingIndex = territory.length - 1 )
//           .add( fillPathAroundNode.bind( null, {
//             drawing,
//             node
//           }) );

//         createNewDrawing = false;
//       } else {
//         // Add point to end of current drawing
//         let drawing = territory.activeDrawing;

//         queue.add( drawing.addNode.bind( drawing, node, undefined ) )
//           .add( fillPathAroundNode.bind( null, {
//             drawing,
//             node
//           }) );
//       }
//     }
//   });
// }

},{"../assert":6,"../drawing-class":9,"../event-target":10,"../map-class":12,"../map-view":13,"../pubsub":14,"../queue":15}],8:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/* global angular */

var _TerritoryEditorCmp = require('../components/territory-editor-cmp');

var _TerritoryEditorCmp2 = _interopRequireWildcard(_TerritoryEditorCmp);

exports['default'] = angular.module('bndry').directive('territoryEditor', function () {
  return {
    restrict: 'E',
    scope: {},
    controller: _TerritoryEditorCmp2['default'],
    controllerAs: 'territoryEditor',
    templateUrl: '../templates/territory-editor-tpl.html',
    bindToController: true
  };
});
module.exports = exports['default'];

},{"../components/territory-editor-cmp":7}],9:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _emit = require('./pubsub');

var _assert = require('./assert');

var _assert2 = _interopRequireWildcard(_assert);

/**
  Path should `extend Array`, but browsers don't support that yet
**/

var Path = (function () {
  function Path() {
    for (var _len = arguments.length, points = Array(_len), _key = 0; _key < _len; _key++) {
      points[_key] = arguments[_key];
    }

    _classCallCheck(this, Path);

    this._points = points;
  }

  _createClass(Path, [{
    key: 'push',
    value: function push() {
      var _points;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_points = this._points).push.apply(_points, args);
    }
  }, {
    key: 'splice',
    value: function splice() {
      var _points2;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_points2 = this._points).splice.apply(_points2, args);
    }
  }, {
    key: 'filter',
    value: function filter(cb) {
      return this._points.filter(cb);
    }
  }, {
    key: 'find',
    value: function find(cb) {
      return this._points.find(cb);
    }
  }, {
    key: 'every',
    value: function every(cb) {
      return this._points.every(cb);
    }
  }, {
    key: 'some',
    value: function some(cb) {
      return this._points.some(cb);
    }
  }, {
    key: 'atIndex',
    value: function atIndex(i) {
      _assert2['default'](i < this._points.length, 'Out of bounds');
      return this._points[i];
    }
  }, {
    key: 'length',
    get: function () {
      return this._points.length;
    }
  }, {
    key: 'indexOf',
    value: function indexOf(point, fromIndex) {
      _assert2['default'](point instanceof Point);

      return this._points.indexOf(point, fromIndex);
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      var points = this._points;

      return (
        // Path can be empty
        points.length === 0 ||

        // Non-empty Path must start and end with a Node
        points[points.length - 1] instanceof Node && points[0] instanceof Node
      );
    }
  }]);

  return Path;
})();

var Point = (function () {
  function Point(x, y) {
    _classCallCheck(this, Point);

    _assert2['default'](typeof x === 'number');
    _assert2['default'](typeof y === 'number');

    this._x = x;
    this._y = y;
  }

  _createClass(Point, [{
    key: 'x',
    get: function () {
      return this._x;
    }
  }, {
    key: 'y',
    get: function () {
      return this._y;
    }
  }, {
    key: 'lat',
    get: function () {
      return this._y;
    }
  }, {
    key: 'lng',
    get: function () {
      return this._x;
    }
  }, {
    key: 'equals',
    value: function equals(point) {
      return this.x === point.x && this.y === point.y;
    }
  }]);

  return Point;
})();

var Node = (function (_Point) {
  function Node(x, y) {
    _classCallCheck(this, Node);

    _get(Object.getPrototypeOf(Node.prototype), 'constructor', this).call(this, x, y);
  }

  _inherits(Node, _Point);

  _createClass(Node, [{
    key: 'moveTo',
    value: function moveTo(x, y) {
      _assert2['default'](typeof x === 'number', 'X must be a number');
      _assert2['default'](typeof y === 'number', 'Y must be a number');

      this._x = x;
      this._y = y;

      _emit.emit(Node.event.MOVED, {
        x: x,
        y: y,
        context: this
      });
    }
  }]);

  return Node;
})(Point);

Node.event = {
  MOVED: 'Node.moved'
};

var Drawing = (function (_Path) {
  function Drawing(_ref) {
    var color = _ref.color;
    var fill = _ref.fill;
    var rigid = _ref.rigid;

    _classCallCheck(this, Drawing);

    _get(Object.getPrototypeOf(Drawing.prototype), 'constructor', this).call(this);

    _assert2['default'](typeof color === 'string');
    _assert2['default'](typeof fill === 'boolean');
    _assert2['default'](typeof rigid === 'boolean');
    this._color = color;
    this._fill = fill;
    this._rigid = rigid;

    _assert2['default'](this.isValid());
  }

  _inherits(Drawing, _Path);

  _createClass(Drawing, [{
    key: 'isValid',
    value: function isValid() {
      var valid = _get(Object.getPrototypeOf(Drawing.prototype), 'isValid', this).call(this),
          rigid = this.rigid ? this.every(function (point) {
        return point instanceof Node;
      }) : true,
          fill = this.fill ? this.length === 0 || this.atIndex(0) === this.atIndex(this.length - 1) : true;
      return valid && rigid && fill;
    }
  }, {
    key: 'color',
    get: function () {
      return this._color;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'string');
      this._color = value;

      _emit.emit(Drawing.event.COLOR_CHANGED, {
        color: value,
        context: this
      });
    }
  }, {
    key: 'fill',
    get: function () {
      return this._fill;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'boolean');

      var oldValue = this.fill;

      this._fill = value;

      if (value !== oldValue) {
        if (value && this.length > 0) {
          this._addPoints({
            atIndex: this.length,
            points: [this.atIndex(0)]
          });
        } else if (!value) {
          this.removeNode(this.atIndex(this.length - 1));
        }
      }

      _emit.emit(Drawing.event.FILL_CHANGED, {
        fill: value,
        context: this
      });
    }
  }, {
    key: 'rigid',
    get: function () {
      return this._rigid;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'boolean');

      var oldValue = this.rigid;

      this._rigid = value;

      if (value && value !== oldValue) {
        for (var i = 0; i < this.length; i++) {
          if (!(this.atIndex(i) instanceof Node)) {
            this.splice(i, 1);
          }
        }
      }

      _emit.emit(Drawing.event.RIGID_CHANGED, {
        rigid: value,
        context: this
      });
    }
  }, {
    key: 'nodesAroundNode',
    value: function nodesAroundNode(node) {
      var nodes = this.nodes(),
          index = nodes.indexOf(node);

      var _nodeIndicesAroundNodeIndex = this._nodeIndicesAroundNodeIndex(index);

      var start = _nodeIndicesAroundNodeIndex.start;
      var end = _nodeIndicesAroundNodeIndex.end;
      var hasFirst = _nodeIndicesAroundNodeIndex.hasFirst;
      var hasLast = _nodeIndicesAroundNodeIndex.hasLast;

      return {
        start: this.atIndex(start),
        end: this.atIndex(end),
        hasFirst: hasFirst,
        hasLast: hasLast
      };
    }
  }, {
    key: '_nodeIndicesAroundNodeIndex',
    value: function _nodeIndicesAroundNodeIndex(index) {
      var start = undefined,
          end = undefined,
          hasFirst = false,
          hasLast = false,
          positions = this.nodePositions();

      _assert2['default'](index >= 0 && index < positions.length);

      if (index === 0 && !this.fill) {
        // First node
        start = positions[index]; // Include Node at index in splice
        hasFirst = true;
      } else if (index === 0 && this.fill) {
        // Nodes at front and end are identical. Ignore last node
        _assert2['default'](positions.length >= 2);
        start = positions[positions.length - 2]; // Wrap to exclude Node at -2
      } else {
        start = positions[index - 1]; // Exclude previous Node from splice
      }

      if (index === positions.length - 1 && !this.fill) {
        // Last node
        end = positions[index]; // Include Node at index in splice
        hasLast = true;
      } else {
        end = positions[index + 1]; // Exclude next Node from splice
      }

      return { start: start, end: end, hasFirst: hasFirst, hasLast: hasLast };
    }
  }, {
    key: 'removePointsBetweenNodes',
    value: function removePointsBetweenNodes(node1, node2) {
      _assert2['default'](node1 instanceof Node);
      _assert2['default'](node2 instanceof Node);

      var start = this.indexOf(node1),
          end = this.indexOf(node2, start);

      _assert2['default'](start > -1, 'Node not found');
      _assert2['default'](end > -1, 'Node not found');
      _assert2['default'](start <= end);

      start++; // Exclude node itself from operation

      return this._removePoints({ start: start, end: end });
    }
  }, {
    key: 'addPointsAfterNode',
    value: function addPointsAfterNode(node, points) {
      _assert2['default'](node instanceof Node);
      _assert2['default'](Array.isArray(points));
      _assert2['default'](this.indexOf(node) > -1, 'Node not found');

      var atIndex = this.indexOf(node) + 1;

      return this._addPoints({ atIndex: atIndex, points: points });
    }
  }, {
    key: 'addNode',
    value: function addNode(node, nodeIndex) {
      var nodePositions = this.nodePositions(),
          atIndex = this.length;

      _assert2['default'](node instanceof Node);

      _assert2['default'](Number.isInteger(nodeIndex));
      _assert2['default'](nodeIndex > -1);

      if (nodePositions.length > 0 && nodeIndex >= 0 && nodeIndex < nodePositions.length) {
        atIndex = nodePositions[nodeIndex] + 1;
      }

      var points = [node];
      if (this.length === 0 && this.fill) {
        points.push(node);
      } else if (this.fill && atIndex === this.length) {
        atIndex--;
      }

      this._addPoints({
        atIndex: atIndex,
        points: points
      });
    }
  }, {
    key: 'removeNode',
    value: function removeNode(node) {
      _assert2['default'](node instanceof Node);

      var indexOnPath = this.indexOf(node),
          index = this.nodePositions().indexOf(indexOnPath);

      return this.removeNodeAtIndex(index);
    }
  }, {
    key: 'removeNodeAtIndex',
    value: function removeNodeAtIndex(index) {
      var _nodeIndicesAroundNodeIndex2 = this._nodeIndicesAroundNodeIndex(index);

      var start = _nodeIndicesAroundNodeIndex2.start;
      var end = _nodeIndicesAroundNodeIndex2.end;
      var hasFirst = _nodeIndicesAroundNodeIndex2.hasFirst;
      var hasLast = _nodeIndicesAroundNodeIndex2.hasLast;

      if (!hasFirst && (!this.fill || this.length > 2)) {
        start++;
      }

      if (hasLast || this.fill && this.length <= 2) {
        end++;
      }

      var removedPoints = this._removePoints({ start: start, end: end });

      return removedPoints;
    }
  }, {
    key: '_removePoints',
    value: function _removePoints(_ref2) {
      var start = _ref2.start;
      var end = _ref2.end;

      _assert2['default'](start >= 0);
      _assert2['default'](end <= this.length);
      _assert2['default'](start <= end || this.fill);

      var removeLength = 0,
          removedPoints = [];

      if (this.fill && start > end) {
        // assert( start < this.length - 1 );

        // removeLength = this.length - start - 1;
        removeLength = this.length - start;

        _assert2['default'](removeLength >= 0);

        removedPoints.push.apply(removedPoints, _toConsumableArray(this.splice(start, removeLength)));

        // Remove last point
        // @Why: This point is also the first point of
        //       the next operation. Removing the last point now
        //       prevents duplicates.
        removedPoints.pop();

        this.push(this.atIndex(end));

        start = 0;
      }

      removeLength = end - start;
      removedPoints.push.apply(removedPoints, _toConsumableArray(this.splice(start, removeLength)));

      _assert2['default'](this.isValid(), 'Invalid path operation');

      if (removedPoints.length === 2 && removedPoints[0] === removedPoints[1]) {
        removedPoints.pop();
      }

      _emit.emit(Drawing.event.POINTS_REMOVED, {
        start: start,
        end: end,
        removedPoints: removedPoints,
        context: this
      });

      return removedPoints;
    }
  }, {
    key: '_addPoints',
    value: function _addPoints(_ref3) {
      var atIndex = _ref3.atIndex;
      var points = _ref3.points;

      _assert2['default'](atIndex >= 0 && atIndex <= this.length, 'Out of bounds');
      _assert2['default'](Array.isArray(points), 'points must be an Array');

      this.splice.apply(this, [atIndex, 0].concat(_toConsumableArray(points)));

      // if ( this.fill && atIndex === 0 ) {
      //   if ( this.length === 1 && this.atIndex( 0 ) instanceof Node ) {
      //     this.push( this.atIndex( 0 ) );
      //   } else if ( this.length > 1 ) {
      //     this.removePoints({
      //       start: this.length - 1,
      //       end: this.length
      //     });
      //     this.push( this.atIndex( 0 ) );
      //   }
      // }

      _assert2['default'](this.isValid(), 'Invalid path operation');

      _emit.emit(Drawing.event.POINTS_ADDED, {
        atIndex: atIndex,
        addedPoints: points,
        context: this
      });
    }
  }, {
    key: 'pointAtIndex',
    value: function pointAtIndex(index) {
      return this.atIndex(index);
    }
  }, {
    key: 'nodePositions',
    value: function nodePositions() {
      var points = this,
          positions = [];

      for (var i = 0; i < points.length; i++) {
        var point = points.atIndex(i);

        if (point instanceof Node) {
          positions.push(i);
        }
      }

      return positions;
    }
  }, {
    key: 'points',
    value: function points() {
      return this.filter(function () {
        return true;
      });
    }
  }, {
    key: 'nodes',
    value: (function (_nodes) {
      function nodes() {
        return _nodes.apply(this, arguments);
      }

      nodes.toString = function () {
        return nodes.toString();
      };

      return nodes;
    })(function () {
      var nodes = this.filter(function (point) {
        return point instanceof Node;
      });
      if (this.fill) {
        nodes.pop();
      }

      return nodes;
    })
  }]);

  return Drawing;
})(Path);

Drawing.event = {
  COLOR_CHANGED: 'Drawing.colorChanged',
  FILL_CHANGED: 'Drawing.fillChanged',
  RIGID_CHANGED: 'Drawing.rigidChanged',
  POINTS_ADDED: 'Drawing.pointsAdded',
  POINTS_REMOVED: 'Drawing.pointsRemoved'
};

var Territory = (function () {
  function Territory() {
    _classCallCheck(this, Territory);

    this._drawings = [];
    this._activeDrawingIndex = -1;
  }

  _createClass(Territory, [{
    key: 'length',
    get: function () {
      return this._drawings.length;
    }
  }, {
    key: 'find',
    value: function find(cb) {
      return this._drawings.find(cb);
    }
  }, {
    key: 'atIndex',
    value: function atIndex(index) {
      _assert2['default'](Number.isInteger(index));
      _assert2['default'](index >= 0 && index < this._drawings.length);

      return this._drawings[index];
    }
  }, {
    key: 'addDrawing',
    value: function addDrawing(_ref4) {
      var atIndex = _ref4.atIndex;
      var drawing = _ref4.drawing;

      _assert2['default'](Number.isInteger(atIndex));
      _assert2['default'](drawing instanceof Drawing);

      _emit.emit(Territory.event.DRAWING_ADDED, {
        atIndex: atIndex,
        drawing: drawing,
        context: this
      });

      return this._drawings.splice(atIndex, 0, drawing);
    }
  }, {
    key: 'removeDrawing',
    value: function removeDrawing(drawing) {
      _assert2['default'](drawing instanceof Drawing);

      var index = this._drawings.indexOf(drawing);
      _assert2['default'](index > -1, 'Drawing not found');

      return this.removeDrawingAtIndex(index);
    }
  }, {
    key: 'removeDrawingAtIndex',
    value: function removeDrawingAtIndex(index) {
      _assert2['default'](index >= 0 && index < this._drawings.length, 'Out of bounds');

      var removedDrawing = this._drawings.splice(index, 1)[0],
          nodes = removedDrawing.nodes();

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          removedDrawing.removeNode(node);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      _emit.emit(Territory.event.DRAWING_REMOVED, {
        atIndex: index,
        drawing: removedDrawing,
        context: this
      });

      return removedDrawing;
    }
  }, {
    key: 'toGeoJson',
    value: function toGeoJson() {
      var geoJson = {
        type: 'FeatureCollection'
      };

      geoJson.features = this._drawings.map(function (drawing) {
        var feature = {
          type: 'Feature'
        };

        var coordinates = drawing._points.map(function (point) {
          var x = point.x;
          var y = point.y;

          return [x, y];
        });

        feature.geometry = {
          type: drawing.fill ? 'Polygon' : 'LineString',
          coordinates: drawing.fill ? [coordinates] : coordinates
        };

        var color = drawing.color;
        var rigid = drawing.rigid;
        var fill = drawing.fill;

        feature.properties = { color: color, rigid: rigid, fill: fill };
        feature.properties.nodePositions = drawing.nodePositions();

        return feature;
      });

      return geoJson;
    }
  }], [{
    key: 'fromGeoJson',
    value: function fromGeoJson(geoJson) {
      _assert2['default'](typeof geoJson === 'object');
      var drawings = new Territory();

      _assert2['default'](Array.isArray(geoJson.features));
      geoJson.features.forEach(function (feature, i) {
        _assert2['default'](typeof feature.properties === 'object');
        _assert2['default'](typeof feature.geometry === 'object');

        var _feature$properties = feature.properties;
        var color = _feature$properties.color;
        var rigid = _feature$properties.rigid;
        var fill = _feature$properties.fill;
        var nodePositions = _feature$properties.nodePositions;

        _assert2['default'](typeof color === 'string');
        _assert2['default'](typeof rigid === 'boolean');
        _assert2['default'](typeof fill === 'boolean');
        _assert2['default'](Array.isArray(nodePositions));

        var drawing = new Drawing({ color: color, rigid: rigid, fill: fill });

        drawings.addDrawings({
          atIndex: -1,
          drawing: drawing
        });

        var coordinates = undefined;
        if (fill) {
          coordinates = feature.geometry.coordinates[0];
        } else {
          coordinates = feature.geometry.coordinates;
        }
        _assert2['default'](Array.isArray(coordinates));

        var points = coordinates.map(function (coordinate, i) {
          var _coordinate = _slicedToArray(coordinate, 2);

          var x = _coordinate[0];
          var y = _coordinate[1];

          if (nodePositions.indexOf(i) === -1) {
            return new Point(x, y);
          } else {
            return new Node(x, y);
          }
        });

        drawing.addPoints({
          atIndex: 0,
          points: points
        });

        return drawing;
      });

      return drawings;
    }
  }]);

  return Territory;
})();

Territory.event = {
  DRAWING_ADDED: 'Territory.drawingAdded',
  DRAWING_REMOVED: 'Territory.drawingRemoved'
};

exports.Point = Point;
exports.Node = Node;
exports.Drawing = Drawing;
exports.Territory = Territory;

},{"./assert":6,"./pubsub":14}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
"use strict";

var PREFIX = "@@",
    EventTarget = {},
    descriptor = {
  // in ES5 does not bother with enumeration
  configurable: true,
  value: null
},
    defineProperty = Object.defineProperty || function defineProperty(obj, prop, desc) {
  // in ES3 obj.hasOwnProperty() in for/in loops
  // is still mandatory since there's no way
  // to simulate non enumerable properties
  obj[prop] = desc.value;
},
    indexOf = [].indexOf || function indexOf(value) {
  var i = this.length;
  while (i-- && this[i] !== value) {}
  return i;
},
    has = EventTarget.hasOwnProperty;

function configure(obj, prop, value) {
  descriptor.value = value;
  defineProperty(obj, prop, descriptor);
  descriptor.value = null;
}

function on(self, type, listener) {
  var array;
  if (has.call(self, type)) {
    array = self[type];
  } else {
    configure(self, type, array = []);
  }
  if (indexOf.call(array, listener) < 0) {
    array.push(listener);
  }
}

function dispatch(self, type, evt) {
  var array, current, i;
  if (has.call(self, type)) {
    evt.target = self;
    array = self[type].slice(0);
    for (i = 0; i < array.length; i++) {
      current = array[i];
      if (typeof current === "function") {
        current.call(self, evt);
      } else if (typeof current.handleEvent === "function") {
        current.handleEvent(evt);
      }
    }
  }
}

function off(self, type, listener) {
  var array, i;
  if (has.call(self, type)) {
    array = self[type];
    i = indexOf.call(array, listener);
    if (-1 < i) {
      array.splice(i, 1);
      if (!array.length) {
        delete self[type];
      }
    }
  }
}

configure(EventTarget, "addEventListener", function addEventListener(type, listener) {
  on(this, PREFIX + type, listener);
});

configure(EventTarget, "dispatchEvent", function dispatchEvent(evt) {
  dispatch(this, PREFIX + evt.type, evt);
});

configure(EventTarget, "removeEventListener", function removeEventListener(type, listener) {
  off(this, PREFIX + type, listener);
});

exports["default"] = EventTarget;
module.exports = exports["default"];

},{}],11:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _MapCanvas = require('./map-class');

var _territoryEditorDir = require('./directives/territory-editor-dir');

var _territoryEditorDir2 = _interopRequireWildcard(_territoryEditorDir);

var _MapView = require('./map-view');

var _MapView2 = _interopRequireWildcard(_MapView);

/* global angular */

angular.module('bndry', []);
require('6to5ify/polyfill');

window.mapCanvas = new _MapCanvas.MapCanvas(document.querySelector('#map_canvas'), {
  center: {
    lat: 41.123728,
    lng: -84.864721
  },
  zoom: 17,
  disableDefaultUI: true
});

window.mapView = new _MapView2['default'](window.mapCanvas);
// let territorEditorCmp = new TerritoryEditorCmp( mapView );

},{"./directives/territory-editor-dir":8,"./map-class":12,"./map-view":13,"6to5ify/polyfill":5}],12:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _assert = require('./assert');

var _assert2 = _interopRequireWildcard(_assert);

var _emit = require('./pubsub');

var addListener = google.maps.event.addListener,
    clearListeners = google.maps.event.clearListeners;

var MapCanvas = (function (_google$maps$Map) {
  function MapCanvas() {
    var _this2 = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, MapCanvas);

    _get(Object.getPrototypeOf(MapCanvas.prototype), 'constructor', this).apply(this, args);

    this._markers = [];
    this._polys = [];

    addListener(this, 'click', function (event) {
      return _emit.emit(MapCanvas.event.PRESSED, {
        event: event,
        context: _this2
      });
    });
  }

  _inherits(MapCanvas, _google$maps$Map);

  _createClass(MapCanvas, [{
    key: 'addMarker',

    // get center() {
    //   return super.getCenter();
    // }
    // set center( latLng ) {
    //   assert( latLng instanceof LatLng,
    //     'Center must be a LatLng' );
    //   super.setCenter( latLng );
    // }

    // get zoom() {
    //   return super.getZoom();
    // }
    // set zoom( value ) {
    //   assert( typeof value === 'number',
    //     'Zoom must be a number' );
    //   super.setZoom( value );
    // }

    value: function addMarker(_ref) {
      var atIndex = _ref.atIndex;
      var marker = _ref.marker;

      _assert2['default'](Number.isInteger(atIndex));
      _assert2['default'](atIndex >= 0 && atIndex <= this._markers.length);
      _assert2['default'](marker instanceof Marker);

      marker.setMap(this);

      this._markers.splice(atIndex, 0, marker);
    }
  }, {
    key: 'removeMarker',
    value: function removeMarker(marker) {
      _assert2['default'](marker instanceof Marker);

      var index = this._markers.indexOf(marker);
      _assert2['default'](index > -1, 'Poly not found');

      return this.removePolyAtIndex(index);
    }
  }, {
    key: 'removeMarkerAtIndex',
    value: function removeMarkerAtIndex(index) {
      _assert2['default'](Number.isInteger(index));
      _assert2['default'](index >= 0 && index < this._markers.length);

      var marker = this._markers.splice(index, 1)[0];
      _assert2['default'](marker instanceof Marker);

      marker.destroy();
    }
  }, {
    key: 'addPoly',
    value: function addPoly(_ref2) {
      var atIndex = _ref2.atIndex;
      var poly = _ref2.poly;

      _assert2['default'](Number.isInteger(atIndex));
      _assert2['default'](atIndex >= 0 && atIndex <= this._polys.length);
      _assert2['default'](poly instanceof Poly);

      poly.setMap(this);

      this._polys.splice(atIndex, 0, poly);
    }
  }, {
    key: 'removePoly',
    value: function removePoly(poly) {
      _assert2['default'](poly instanceof Poly);

      var index = this._polys.indexOf(poly);
      _assert2['default'](index > -1, 'Poly not found');

      return this.removePolyAtIndex(index);
    }
  }, {
    key: 'removePolyAtIndex',
    value: function removePolyAtIndex(index) {
      _assert2['default'](Number.isInteger(index));
      _assert2['default'](index >= 0 && index < this._polys.length);

      var poly = this._polys.splice(index, 1)[0];
      _assert2['default'](poly instanceof Poly);

      poly.destroy();
    }
  }]);

  return MapCanvas;
})(google.maps.Map);

MapCanvas.event = {
  PRESSED: 'MapCanvas.pressed'
};

var Marker = (function (_google$maps$Marker) {
  function Marker() {
    var _this3 = this;

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _classCallCheck(this, Marker);

    _get(Object.getPrototypeOf(Marker.prototype), 'constructor', this).apply(this, args);

    addListener(this, 'click', function (event) {
      return _emit.emit(Marker.event.PRESSED, {
        event: event,
        context: _this3
      });
    });
    addListener(this, 'dragstart', function (event) {
      return _emit.emit(Marker.event.DRAGSTARTED, {
        event: event,
        context: _this3
      });
    });
    addListener(this, 'drag', function (event) {
      return _emit.emit(Marker.event.DRAGGED, {
        event: event,
        context: _this3
      });
    });
    addListener(this, 'dragend', function (event) {
      return _emit.emit(Marker.event.DRAGENDED, {
        event: event,
        context: _this3
      });
    });
  }

  _inherits(Marker, _google$maps$Marker);

  _createClass(Marker, [{
    key: 'setOptions',
    value: function setOptions(options) {
      _assert2['default'](typeof options === 'object');

      if (options.color) {}
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      clearListeners(this);
      this.setMap(null);
    }
  }]);

  return Marker;
})(google.maps.Marker);

Marker.event = {
  PRESSED: 'Marker.pressed',
  DRAGSTARTED: 'Marker.dragstarted',
  DRAGGED: 'Marker.dragged',
  DRAGENDED: 'Marker.dragended'
};

var Poly = (function () {
  function Poly(options) {
    var _this4 = this;

    _classCallCheck(this, Poly);

    _assert2['default'](typeof options === 'object');

    if (options.fillColor || options.fillOpacity !== undefined) {
      this._poly = new google.maps.Polygon(options);
    } else {
      this._poly = new google.maps.Polyline(options);
    }

    addListener(this._poly, 'click', function (event) {
      return _emit.emit(Poly.event.PRESSED, {
        event: event,
        context: _this4
      });
    });
  }

  _createClass(Poly, [{
    key: 'length',
    get: function () {
      return this._poly.getPath().getLength();
    }
  }, {
    key: 'setMap',
    value: function setMap(map) {
      this._poly.setMap(map);
    }
  }, {
    key: 'addLatLngs',
    value: function addLatLngs(_ref3) {
      var atIndex = _ref3.atIndex;
      var latLngs = _ref3.latLngs;

      var path = this._poly.getPath();

      _assert2['default'](Number.isInteger(atIndex));
      _assert2['default'](atIndex >= 0 && atIndex <= path.getLength());
      _assert2['default'](Array.isArray(latLngs));

      latLngs.forEach(function (latLng, i) {
        path.insertAt(atIndex + i, latLng);
      });
    }
  }, {
    key: 'removeLatLngs',
    value: function removeLatLngs(_ref4) {
      var start = _ref4.start;
      var end = _ref4.end;

      var path = this._poly.getPath();

      _assert2['default'](Number.isInteger(start));
      _assert2['default'](Number.isInteger(end));
      _assert2['default'](start >= 0 && start <= end);
      _assert2['default'](end <= path.getLength());

      var removeLength = end - start;

      for (var i = end - 1; i >= start; i--) {
        path.removeAt(i);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      clearListeners(this._poly);
      this._poly.setMap(null);
    }
  }]);

  return Poly;
})();

Poly.event = {
  PRESSED: 'Poly.pressed'
};

var DirectionsService = (function (_google$maps$DirectionsService) {
  function DirectionsService() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    _classCallCheck(this, DirectionsService);

    _get(Object.getPrototypeOf(DirectionsService.prototype), 'constructor', this).apply(this, args);
  }

  _inherits(DirectionsService, _google$maps$DirectionsService);

  _createClass(DirectionsService, [{
    key: 'route',
    value: function route(_ref5) {
      var origin = _ref5.origin;
      var destination = _ref5.destination;

      var _this = this;

      _assert2['default'](origin instanceof LatLng);
      _assert2['default'](destination instanceof LatLng);

      return new Promise(function (resolve, reject) {
        _get(Object.getPrototypeOf(DirectionsService.prototype), 'route', _this).call(_this, {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING
        }, function (result, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            resolve(result.routes[0].overview_path);
          } else {
            reject(status);
          }
        });
      });
    }
  }]);

  return DirectionsService;
})(google.maps.DirectionsService);

var AutocompleteService = (function (_google$maps$places$AutocompleteService) {
  function AutocompleteService() {
    _classCallCheck(this, AutocompleteService);

    if (_google$maps$places$AutocompleteService != null) {
      _google$maps$places$AutocompleteService.apply(this, arguments);
    }
  }

  _inherits(AutocompleteService, _google$maps$places$AutocompleteService);

  return AutocompleteService;
})(google.maps.places.AutocompleteService);

;

var LatLng = google.maps.LatLng;

exports.MapCanvas = MapCanvas;
exports.Marker = Marker;
exports.Poly = Poly;
exports.LatLng = LatLng;
exports.DirectionsService = DirectionsService;

// Generate new icon

},{"./assert":6,"./pubsub":14}],13:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _assert = require('./assert');

var _assert2 = _interopRequireWildcard(_assert);

var _emit$on = require('./pubsub');

var _EventTarget = require('./event-target');

var _EventTarget2 = _interopRequireWildcard(_EventTarget);

var _MapCanvas$Marker$Poly$LatLng = require('./map-class');

var _Node$Drawing$Territory = require('./drawing-class');

var MapView = {
  event: {
    MAP_PRESSED: 'MapView.mapPressed',
    POLY_PRESSED: 'MapView.polyPressed',
    MARKER_PRESSED: 'MapView.markerPressed',
    MARKER_DRAGSTARTED: 'MapView.markerDragstart',
    MARKER_DRAGGED: 'MapView.markerDrag',
    MARKER_DRAGENDED: 'MapView.markerDragend'
  }
};

exports.MapView = MapView;

exports['default'] = function () {
  var polys = new Map(),
      markers = new Map(),
      markerIndices = new Map();

  function createLatLngFromPoint(point) {
    return new _MapCanvas$Marker$Poly$LatLng.LatLng(point.y, point.x);
  }

  function createLatLngsFromPoints(points) {
    return points.map(createLatLngFromPoint);
  }

  function createPolyFromDrawing(drawing) {
    var options = {
      clickable: true,
      draggable: false,
      editable: false,
      geodesic: false,
      visible: true
    };

    options.strokeOpacity = 0.5;
    options.strokeColor = drawing.color;

    if (drawing.fill) {
      options.fillColor = drawing.color;
      options.fillOpacity = 0.25;
      options.strokeWeight = 8;
    } else {
      options.strokeWeight = 8;
    }

    return new _MapCanvas$Marker$Poly$LatLng.Poly(options);
  }

  function createIconFromColor(color) {
    return {
      fillColor: color,
      fillOpacity: 0,
      path: 'M-16,0 a 16,16 0 1,0 32,0a16,16 0 1,0 -32,0 M-2,0 a 2,2 0 1,0 4,0a2,2 0 1,0 -4,0',
      scale: 1,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 4
    };
  }

  function createMarker(_ref) {
    var point = _ref.point;
    var color = _ref.color;

    var latLng = {
      lat: point.y,
      lng: point.x
    };

    return new _MapCanvas$Marker$Poly$LatLng.Marker({
      clickable: true,
      crossOnDrag: false,
      cursor: 'pointer',
      draggable: true,
      icon: createIconFromColor(color),
      opacity: 1,
      position: latLng,
      visible: true
    });
  }

  function findKeyByValue(_ref2) {
    var map = _ref2.map;
    var searchValue = _ref2.searchValue;

    var entries = map.entries(),
        entry = undefined;

    while (entry = entries.next()) {
      _assert2['default'](!entry.done);

      var _entry$value = _slicedToArray(entry.value, 2);

      var key = _entry$value[0];
      var value = _entry$value[1];

      if (value === searchValue) {
        return key;
      }
    }
  }

  function nodeForMarker(marker) {
    return findKeyByValue({
      map: markers,
      searchValue: marker
    });
  }

  function drawingForPoly(poly) {
    return findKeyByValue({
      map: polys,
      searchValue: poly
    });
  }

  window.mapCanvas.data.setStyle(function (feature) {
    var color = feature.getProperty('color'),
        fill = feature.getProperty('fill');

    if (fill) {
      return {
        strokeColor: color,
        strokeOpacity: 0.25,
        strokeWeight: 5,
        fillColor: color,
        fillOpacity: 0.25
      };
    } else {
      return {
        strokeColor: color,
        strokeWeight: 5
      };
    }
  });

  _emit$on.on(_Node$Drawing$Territory.Territory.event.DRAWING_ADDED, function (eventName, _ref3) {
    var atIndex = _ref3.atIndex;
    var drawing = _ref3.drawing;
    var context = _ref3.context;

    var poly = createPolyFromDrawing(drawing);

    window.mapCanvas.addPoly({ atIndex: atIndex, poly: poly });
    polys.set(drawing, poly);
  });

  _emit$on.on(_Node$Drawing$Territory.Territory.event.DRAWING_REMOVED, function (eventName, _ref4) {
    var drawing = _ref4.drawing;

    var poly = polys.get(drawing);
    _assert2['default'](poly instanceof _MapCanvas$Marker$Poly$LatLng.Poly);

    window.mapCanvas.removePoly(poly);
    polys['delete'](drawing);
  });

  _emit$on.on(_Node$Drawing$Territory.Drawing.event.COLOR_CHANGED, function (eventName, _ref5) {
    var color = _ref5.color;
    var context = _ref5.context;

    _assert2['default'](polys.has(context));

    var poly = polys.get(context);

    poly.setOptions({ color: color });

    var nodes = context.nodes();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var node = _step.value;

        _assert2['default'](markers.has(node));

        var marker = markers.get(node);
        marker.setOptions({ strokeColor: color });
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });

  _emit$on.on(_Node$Drawing$Territory.Drawing.event.FILL_CHANGED, function (eventName, _ref6) {
    var fill = _ref6.fill;
    var context = _ref6.context;

    _assert2['default'](polys.has(context));

    var poly = createPolyFromDrawing(context);

    polys.set(context, poly);
  });

  _emit$on.on(_Node$Drawing$Territory.Drawing.event.POINTS_ADDED, function (eventName, _ref7) {
    var atIndex = _ref7.atIndex;
    var addedPoints = _ref7.addedPoints;
    var context = _ref7.context;

    _assert2['default'](polys.has(context));

    var poly = polys.get(context);

    var latLngs = createLatLngsFromPoints(addedPoints);
    poly.addLatLngs({ atIndex: atIndex, latLngs: latLngs });

    var color = context.color,
        nodes = context.nodes(),
        len = addedPoints.length,
        skipLastPoint = context.fill && atIndex + len === context.length;

    addedPoints.forEach(function (point, i) {
      if (skipLastPoint && i === len - 1) return;

      if (point instanceof _Node$Drawing$Territory.Node) {
        var markerIndex = nodes.indexOf(point);

        var marker = createMarker({ point: point, color: color });

        window.mapCanvas.addMarker({ atIndex: markerIndex, marker: marker });
        markers.set(point, marker);
        markerIndices.set(marker, atIndex + i);
      }
    });

    // for ( let point of addedPoints ) {
    //   if ( point instanceof Node ) {
    //     let atIndex = nodes.indexOf( point );

    //     let marker = createMarker({ point, color });
    //     window.mapCanvas.addMarker({ atIndex, marker });
    //     markers.set( point, marker );
    //   }
    // }
  });

  _emit$on.on(_Node$Drawing$Territory.Drawing.event.POINTS_REMOVED, function (eventName, _ref8) {
    var start = _ref8.start;
    var end = _ref8.end;
    var removedPoints = _ref8.removedPoints;
    var context = _ref8.context;

    _assert2['default'](polys.has(context));

    var poly = polys.get(context),
        len = removedPoints.length,
        skipLastPoint = context.fill && end === context.length;

    poly.removeLatLngs({ start: start, end: end });

    removedPoints.forEach(function (point, i) {
      if (skipLastPoint && i === len) return;

      if (point instanceof _Node$Drawing$Territory.Node) {
        _assert2['default'](markers.has(point));

        var marker = markers.get(point);

        marker.destroy();
        markers['delete'](point);
        markerIndices['delete'](marker);
      }
    });
  });

  _emit$on.on(_Node$Drawing$Territory.Node.event.MOVED, function (eventName, _ref9) {
    var x = _ref9.x;
    var y = _ref9.y;
    var context = _ref9.context;

    _assert2['default'](context instanceof _Node$Drawing$Territory.Node);
    _assert2['default'](markers.has(context));

    var marker = markers.get(context),
        index = markerIndices.get(marker);

    marker.setPosition(createLatLngFromPoint(context));

    var entries = polys.entries(),
        entry = undefined;

    while (entry = entries.next()) {
      _assert2['default'](!entries.done, 'Poly not found');

      var _entry$value2 = _slicedToArray(entry.value, 2);

      var drawing = _entry$value2[0];
      var poly = _entry$value2[1];
      var _index = drawing.indexOf(context);
      if (_index > -1) {
        if (drawing.fill && _index === 0) {
          poly.removeLatLngs({
            start: _index,
            end: _index + 1
          });
          poly.removeLatLngs({
            start: poly.length - 1,
            end: poly.length
          });

          var latLng = createLatLngFromPoint({ x: x, y: y });
          poly.addLatLngs({
            atIndex: _index,
            latLngs: [latLng]
          });
          poly.addLatLngs({
            atIndex: poly.length,
            latLngs: [latLng]
          });
        } else {
          poly.removeLatLngs({
            start: _index,
            end: _index + 1
          });

          poly.addLatLngs({
            atIndex: _index,
            latLngs: [createLatLngFromPoint({ x: x, y: y })]
          });
        }

        return;
      }
    }
  });

  _emit$on.on(_MapCanvas$Marker$Poly$LatLng.MapCanvas.event.PRESSED, function (eventName, _ref10) {
    var event = _ref10.event;
    return _emit$on.emit(MapView.event.MAP_PRESSED, event);
  });

  _emit$on.on(_MapCanvas$Marker$Poly$LatLng.Poly.event.PRESSED, function (eventName, _ref11) {
    var event = _ref11.event;
    var context = _ref11.context;
    return _emit$on.emit(MapView.event.POLY_PRESSED, {
      latLng: event.latLng,
      node: drawingForPoly(context)
    });
  });

  _emit$on.on(_MapCanvas$Marker$Poly$LatLng.Marker.event.PRESSED, function (eventName, _ref12) {
    var event = _ref12.event;
    var context = _ref12.context;
    return _emit$on.emit(MapView.event.MARKER_PRESSED, {
      latLng: event.latLng,
      node: nodeForMarker(context)
    });
  });

  _emit$on.on(_MapCanvas$Marker$Poly$LatLng.Marker.event.DRAGSTARTED, function (eventName, _ref13) {
    var event = _ref13.event;
    var context = _ref13.context;
    return _emit$on.emit(MapView.event.MARKER_DRAGSTARTED, {
      latLng: event.latLng,
      node: nodeForMarker(context)
    });
  });

  _emit$on.on(_MapCanvas$Marker$Poly$LatLng.Marker.event.DRAGGED, function (eventName, _ref14) {
    var event = _ref14.event;
    var context = _ref14.context;

    var node = nodeForMarker(context),
        entries = polys.entries(),
        entry = undefined;

    while (entry = entries.next()) {
      _assert2['default'](!entries.done, 'Poly not found');

      var _entry$value3 = _slicedToArray(entry.value, 2);

      var drawing = _entry$value3[0];
      var poly = _entry$value3[1];
      var index = drawing.indexOf(node);
      if (index > -1) {
        if (drawing.fill && index === 0) {
          poly.removeLatLngs({
            start: index,
            end: index + 1
          });
          poly.removeLatLngs({
            start: poly.length - 1,
            end: poly.length
          });

          var latLng = context.getPosition();
          poly.addLatLngs({
            atIndex: index,
            latLngs: [latLng]
          });
          poly.addLatLngs({
            atIndex: poly.length,
            latLngs: [latLng]
          });
        } else {
          poly.removeLatLngs({
            start: index,
            end: index + 1
          });

          poly.addLatLngs({
            atIndex: index,
            latLngs: [context.getPosition()]
          });
        }

        return;
      }
    }

    _emit$on.emit(MapView.event.MARKER_DRAGGED, {
      latLng: event.latLng,
      node: nodeForMarker(context)
    });
  });

  _emit$on.on(_MapCanvas$Marker$Poly$LatLng.Marker.event.DRAGENDED, function (eventName, _ref15) {
    var event = _ref15.event;
    var context = _ref15.context;
    return _emit$on.emit(MapView.event.MARKER_DRAGENDED, {
      latLng: event.latLng,
      node: nodeForMarker(context)
    });
  });
};

},{"./assert":6,"./drawing-class":9,"./event-target":10,"./map-class":12,"./pubsub":14}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var emit = PubSub.publishSync.bind(PubSub);
var on = PubSub.subscribe.bind(PubSub);
var off = PubSub.unsubscribe.bind(PubSub);
exports.emit = emit;
exports.on = on;
exports.off = off;

},{}],15:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Queue = (function () {
  function Queue() {
    _classCallCheck(this, Queue);

    this._q = Promise.resolve(true);
  }

  _createClass(Queue, [{
    key: "add",
    value: function add(cb) {
      this._q = this._q.then(cb);

      return this;
    }
  }]);

  return Queue;
})();

exports["default"] = Queue;
module.exports = exports["default"];

},{}]},{},[11]);
