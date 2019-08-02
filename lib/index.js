'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var assert = _interopDefault(require('assert'));
var util$1 = _interopDefault(require('util'));
var os$1 = _interopDefault(require('os'));
var events = _interopDefault(require('events'));

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime_1 = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

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
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
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

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
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

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
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

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
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

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var regenerator = runtime_1;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

var asyncToGenerator = _asyncToGenerator;

var q = createCommonjsModule(function (module, exports) {
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else {
        module.exports = definition();

    // RequireJS
    }

})(function () {

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined$1, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined$1, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined$1, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined$1, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});
});

var readdir = createCommonjsModule(function (module) {
(function(exports) {

   var fs$1 = fs;
   var Q = q;

   /**
    * For the supplied paths list, matches against the supplied filters and returns a new array of paths that
    * are ordered as the list of filters would imply they should be. The filters can include * as a match-anything in
    * one directory or ** for match any file in any directory. All filters are treated as an ends-with match.
    *
    * @param {String[]} paths
    * @param {String[]} filters
    * @return String[]
    */
   function file_list_filter(paths, filters) {
      var result = [];
      filters.forEach(function(filter) {
         var filterRegex = new RegExp('^' +
            filter.replace(/\./g, '\\.')
               .replace(/(\*?)(\*)(?!\*)/g, function(match, prefix) {
                  if(prefix == '*') {
                     return match;
                  }
                  return '[^\\/]*';
               })
               .replace(/\*\*/g, '\.*') + '$'
            , 'i');

         paths.forEach(function(path) {
            if(result.indexOf(path) < 0 && path.match(filterRegex)) {
               result.push(path);
            }
         });

      });
      return result;
   }

   /**
    * Gets a flag that identifies whether the supplied path is a directory or a file, true when a directory. In the
    * case that the file doesn't exist the result will be false.
    *
    * @param path
    * @return {Boolean}
    */
   function is_dir(path) {
      try {
         return fs$1.statSync(path).isDirectory();
      }
      catch (e) {
         return false;
      }
   }

   /**
    * Given the name of the directory about to be traversed, checks whether it should be - allows for the automatic
    * removal of "hidden" directories.
    *
    * @param {String} base
    * @param {String} directoryName
    * @param {Number} options
    * @return {Boolean}
    */
   function should_read_directory(base, directoryName, options) {
      return !(exports.NON_RECURSIVE & options) && !!(directoryName.charAt(0) != '.' || (exports.INCLUDE_HIDDEN & options));
   }

   /**
    * Reads the supplied directory path and builds an array of files within the directory. This will work recursively
    * on each sub directory found. The optional appendTo argument can be used to merge file paths onto an existing
    * array, and is used internally for recursion.
    *
    * @param {String} dir
    * @param {String[]} appendTo
    * @param {Number} prefixLength
    * @param {Number} options
    */
   function read_dir_sync(dir, appendTo, prefixLength, options) {
      var contents = fs$1.readdirSync(dir),
         result = appendTo || [];

      contents.forEach(function(itm) {
         var newPath = dir + itm;
         if(is_dir(newPath)) {
            if(should_read_directory(dir, itm, options)) {
               read_dir_sync(newPath + '/', result, prefixLength, options);
            }
            if(exports.INCLUDE_DIRECTORIES & options) {
               result.push(newPath.substring(prefixLength) + '/');
            }
         }
         else {
            result.push(newPath.substring(prefixLength));
         }
      });

      return result;
   }

   function read_dir(dir, appendTo, prefixLength, options) {
      var deferred = Q.defer();

      fs$1.readdir(dir, function (err, contents) {
         if (err) deferred_error(deferred, err, options);
         else if (!contents.length) {
            deferred.resolve();
         }
         else {
            Q.all(contents.map(function (itm) {
               var deferred = Q.defer();
               var newPath = dir.replace(/\/$/, '') + '/' + itm;

               fs$1.stat(newPath, function (err, stat) {
                  var isDirectory = stat && stat.isDirectory();

                  if (err) deferred_error(deferred, err, options);
                  else if (isDirectory) {
                     if(exports.INCLUDE_DIRECTORIES & options) {
                        appendTo.push(newPath.substring(prefixLength) + '/');
                     }
                     if (should_read_directory(dir, itm, options)) {
                        read_dir(newPath, appendTo, prefixLength, options).then(deferred.resolve, deferred.reject);
                     }
                     else {
                        deferred.resolve();
                     }
                  }
                  else {
                     deferred.resolve(appendTo.push(newPath.substring(prefixLength) + (isDirectory ? '/' : '')));
                  }
               });

               return deferred.promise;
            })).then(deferred.resolve, deferred.reject);
         }
      });

      return deferred.promise;
   }

   function deferred_error(deferred, error, options) {
      if (exports.IGNORE_ERRORS & options) {
         deferred.resolve();
      }
      else {
         deferred.reject(error);
      }
   }

   /**
    * Changes the values in the supplied paths array to be absolute URIs
    *
    * @param {String} prefix
    * @param {String[]} paths
    */
   function prepend_paths(prefix, paths) {
      paths.forEach(function(path, index) {
         paths[index] = prefix + path;
      });
   }

   function sort_paths(paths, sorter) {
      return paths.sort(sorter);
   }

   function caseless_sort(pathA, pathB) {
      var a = ('' + pathA).toLowerCase(),
          b = ('' + pathB).toLowerCase();

      if(a == b) {
         return 0;
      }
      else {
         return a > b ? 1 : -1;
      }
   }

   function case_sort(pathA, pathB) {
      if(pathA == pathB) {
         return 0;
      }
      else {
         return pathA > pathB ? 1 : -1;
      }
   }

   function apply_filters(basePath, allFiles, includeFilters, options) {
      if(Array.isArray(includeFilters)) {
         allFiles = file_list_filter(allFiles, includeFilters);
      }

      if(exports.ABSOLUTE_PATHS & options) {
         prepend_paths(path.resolve(process.cwd(), basePath) + '/', allFiles);
      }

      if(exports.CASELESS_SORT & options) {
         allFiles = sort_paths(allFiles, caseless_sort);
      }

      if(exports.CASE_SORT & options) {
         allFiles = sort_paths(allFiles, case_sort);
      }

      return allFiles;
   }

   /**
    *
    * @param {String} basePath
    * @param {String[]} [includeFilters]
    * @param {Number} [options]
    */
   exports.readSync = function(basePath, includeFilters, options) {
      var rootDir = basePath.replace(/\/$/, '') + '/';
      if (!fs$1.existsSync(rootDir)) {
         return [];
      }
      else {
         return apply_filters(basePath, read_dir_sync(rootDir, [], rootDir.length, options), includeFilters, options);
      }
   };

   /**
    *
    * @param {string} basePath
    * @param {string[]} includeFilters
    * @param {number} options
    * @param {Function} handler
    */
   exports.read = function(basePath, includeFilters, options, handler) {
      var callback = handler;
      var assert$1 = assert;

      assert$1.equal(typeof basePath, 'string', 'basePath must be a string');
      assert$1.equal(typeof arguments[arguments.length - 1], 'function', 'last argument must be a function');

      switch (arguments.length) {
         case 2:
            callback = includeFilters;
            includeFilters = null;
            options = 0;
            break;
         case 3:
            callback = options;
             if (typeof includeFilters === "number") {
                options = includeFilters;
                includeFilters = null;
             }
             else {
                options = 0;
             }
      }

      assert$1.ok(Array.isArray(includeFilters) || includeFilters === null, 'includeFilters must be null or an array of filters');
      assert$1.equal(typeof options, 'number', 'options must be set as a number');

      var rootDir = basePath.replace(/\/$/, '') + '/',
          allFiles = [];

      read_dir(rootDir, allFiles, rootDir.length, options).then(function () {
         callback(null, apply_filters(basePath, allFiles, includeFilters, options));
      }, function (err) {
         callback(err, []);
      });
   };

   exports.isDir = is_dir;

   /**
    * Bitwise option for making the return paths absolute URIs instead of being from the supplied base path
    * @type {Number}
    */
   exports.ABSOLUTE_PATHS = 1;

   /**
    * Bitwise option for making the return array sorted case insensitively
    * @type {Number}
    */
   exports.CASELESS_SORT = 2;

   /**
    * Bitwise option for making the return array sorted case sensitively
    * @type {Number}
    */
   exports.CASE_SORT = 4;

   /**
    * Bitwise option for making the return array sorted case sensitively
    * @type {Number}
    */
   exports.INCLUDE_DIRECTORIES = 8;

   /**
    * Bitwise option for preventing the automatic removal of paths that start with a dot
    * @type {Number}
    */
   exports.INCLUDE_HIDDEN = 16;

   /**
    * Bitwise option for preventing the directory reader running recursively
    * @type {Number}
    */
   exports.NON_RECURSIVE = 32;

   /**
    * Bitwise option for preventing errors reading directories from aborting the scan whenever possible - includes
    * incorrectly rooted relative symlinks and missing root directory.
    * @type {number}
    */
   exports.IGNORE_ERRORS = 64;

}( module.exports));
});

function _interopDefault$1(u){return u&&"object"==typeof u&&"default"in u?u.default:u}var util=_interopDefault$1(util$1),os=_interopDefault$1(os$1);function createCommonjsModule$1(u,e){return u(e={exports:{}},e.exports),e.exports}function getCjsExportFromNamespace(u){return u&&u.default||u}var vendors=[{name:"AppVeyor",constant:"APPVEYOR",env:"APPVEYOR",pr:"APPVEYOR_PULL_REQUEST_NUMBER"},{name:"Bamboo",constant:"BAMBOO",env:"bamboo_planKey"},{name:"Bitbucket Pipelines",constant:"BITBUCKET",env:"BITBUCKET_COMMIT"},{name:"Bitrise",constant:"BITRISE",env:"BITRISE_IO",pr:"BITRISE_PULL_REQUEST"},{name:"Buddy",constant:"BUDDY",env:"BUDDY_WORKSPACE_ID",pr:"BUDDY_EXECUTION_PULL_REQUEST_ID"},{name:"Buildkite",constant:"BUILDKITE",env:"BUILDKITE",pr:{env:"BUILDKITE_PULL_REQUEST",ne:"false"}},{name:"CircleCI",constant:"CIRCLE",env:"CIRCLECI",pr:"CIRCLE_PULL_REQUEST"},{name:"Cirrus CI",constant:"CIRRUS",env:"CIRRUS_CI",pr:"CIRRUS_PR"},{name:"AWS CodeBuild",constant:"CODEBUILD",env:"CODEBUILD_BUILD_ARN"},{name:"Codeship",constant:"CODESHIP",env:{CI_NAME:"codeship"}},{name:"Drone",constant:"DRONE",env:"DRONE",pr:{DRONE_BUILD_EVENT:"pull_request"}},{name:"dsari",constant:"DSARI",env:"DSARI"},{name:"GitLab CI",constant:"GITLAB",env:"GITLAB_CI"},{name:"GoCD",constant:"GOCD",env:"GO_PIPELINE_LABEL"},{name:"Hudson",constant:"HUDSON",env:"HUDSON_URL"},{name:"Jenkins",constant:"JENKINS",env:["JENKINS_URL","BUILD_ID"],pr:{any:["ghprbPullId","CHANGE_ID"]}},{name:"Magnum CI",constant:"MAGNUM",env:"MAGNUM"},{name:"Sail CI",constant:"SAIL",env:"SAILCI",pr:"SAIL_PULL_REQUEST_NUMBER"},{name:"Semaphore",constant:"SEMAPHORE",env:"SEMAPHORE",pr:"PULL_REQUEST_NUMBER"},{name:"Shippable",constant:"SHIPPABLE",env:"SHIPPABLE",pr:{IS_PULL_REQUEST:"true"}},{name:"Solano CI",constant:"SOLANO",env:"TDDIUM",pr:"TDDIUM_PR_ID"},{name:"Strider CD",constant:"STRIDER",env:"STRIDER"},{name:"TaskCluster",constant:"TASKCLUSTER",env:["TASK_ID","RUN_ID"]},{name:"Solano CI",constant:"TDDIUM",env:"TDDIUM",pr:"TDDIUM_PR_ID",deprecated:!0},{name:"TeamCity",constant:"TEAMCITY",env:"TEAMCITY_VERSION"},{name:"Team Foundation Server",constant:"TFS",env:"TF_BUILD"},{name:"Travis CI",constant:"TRAVIS",env:"TRAVIS",pr:{env:"TRAVIS_PULL_REQUEST",ne:"false"}}],vendors$1=Object.freeze({default:vendors}),vendors$2=getCjsExportFromNamespace(vendors$1),ciInfo=createCommonjsModule$1(function(u,e){var t=process.env;function D(u){return "string"==typeof u?!!t[u]:Object.keys(u).every(function(e){return t[e]===u[e]})}Object.defineProperty(e,"_vendors",{value:vendors$2.map(function(u){return u.constant})}),e.name=null,e.isPR=null,vendors$2.forEach(function(u){var r=(Array.isArray(u.env)?u.env:[u.env]).every(function(u){return D(u)});if(e[u.constant]=r,r)switch(e.name=u.name,typeof u.pr){case"string":e.isPR=!!t[u.pr];break;case"object":"env"in u.pr?e.isPR=u.pr.env in t&&t[u.pr.env]!==u.pr.ne:"any"in u.pr?e.isPR=u.pr.any.some(function(u){return !!t[u]}):e.isPR=D(u.pr);break;default:e.isPR=null;}}),e.isCI=!!(t.CI||t.CONTINUOUS_INTEGRATION||t.BUILD_NUMBER||t.RUN_ID||e.name);}),ciInfo_1=ciInfo.name,ciInfo_2=ciInfo.isPR,ciInfo_3=ciInfo.isCI,isCI=!1,debug=!1,tty=!1,nodeENV="development",browser="undefined"!=typeof window,platform="",minimal=!1;function toBoolean(u){return !(!u||"false"===u)}"undefined"!=typeof process&&(process.platform&&(platform=String(process.platform)),process.stdout&&(tty=toBoolean(process.stdout.isTTY)),isCI=Boolean(ciInfo.isCI),process.env&&(process.env.NODE_ENV&&(nodeENV=process.env.NODE_ENV),debug=toBoolean(process.env.DEBUG),minimal=toBoolean(process.env.MINIMAL)));var env={browser:browser,test:"test"===nodeENV,dev:"development"===nodeENV||"dev"===nodeENV,production:"production"===nodeENV,debug:debug,ci:isCI,tty:tty,minimal:void 0,minimalCLI:void 0,windows:/^win/i.test(platform),darwin:/^darwin/i.test(platform),linux:/^linux/i.test(platform)};env.minimal=minimal||env.ci||env.test||!env.tty,env.minimalCLI=env.minimal;var stdEnv=Object.freeze(env),Types={fatal:{level:0},error:{level:0},warn:{level:1},log:{level:2},info:{level:3},success:{level:3},debug:{level:4},trace:{level:5},silent:{level:1/0},ready:{level:3},start:{level:3}};function isPlainObject(u){return "[object Object]"===Object.prototype.toString.call(u)}function isLogObj(u){return !!isPlainObject(u)&&(!(!u.message&&!u.args)&&!u.stack)}let paused=!1;const queue=[];class Consola{constructor(u={}){this._reporters=u.reporters||[],this._types=u.types||Types,this._level=null!=u.level?u.level:3,this._defaults=u.defaults||{},this._async=void 0!==u.async?u.async:null,this._stdout=u.stdout,this._stderr=u.stdout,this._mockFn=u.mockFn,this._throttle=u.throttle||2e3;for(const u in this._types)this[u]=this._wrapLogFn(Object.assign({type:u},this._types[u],this._defaults));this._mockFn&&this.mockTypes(),this._lastLogSerialized=null,this._lastLog=null,this._lastLogTime=null,this._lastLogCount=0;}get level(){return this._level}set level(u){let e=0,t=0;for(const u in this._types){const D=this._types[u];D.level>t?t=D.level:D.level<e&&(e=D.level);}this._level=Math.min(t,Math.max(e,u));}get stdout(){return this._stdout||console._stdout}get stderr(){return this._stderr||console._stderr}create(u){return new Consola(Object.assign({reporters:this._reporters,level:this._level,types:this._types,defaults:this._defaults,stdout:this._stdout,stderr:this._stderr,mockFn:this._mockFn},u))}withDefaults(u){return this.create({defaults:Object.assign({},this._defaults,u)})}withTag(u){return this.withDefaults({tag:this._defaults.tag?this._defaults.tag+":"+u:u})}addReporter(u){return this._reporters.push(u),this}removeReporter(u){if(u){const e=this._reporters.indexOf(u);if(e>=0)return this._reporters.splice(e,1)}else this._reporters.splice(0);return this}setReporters(u){return this._reporters=Array.isArray(u)?u:[u],this}wrapAll(){this.wrapConsole(),this.wrapStd();}restoreAll(){this.restoreConsole(),this.restoreStd();}wrapConsole(){for(const u in this._types)console["__"+u]||(console["__"+u]=console[u]),console[u]=this[u];}restoreConsole(){for(const u in this._types)console["__"+u]&&(console[u]=console["__"+u],delete console["__"+u]);}wrapStd(){this._wrapStream(this.stdout,"log"),this._wrapStream(this.stderr,"log");}_wrapStream(u,e){u&&(u.__write||(u.__write=u.write),u.write=(u=>{this[e](String(u).trim());}));}restoreStd(){this._restoreStream(this.stdout),this._restoreStream(this.stderr);}_restoreStream(u){u&&u.__write&&(u.write=u.__write,delete u.__write);}pauseLogs(){paused=!0;}resumeLogs(){paused=!1;const u=queue.splice(0);for(const e of u)e[0]._logFn(e[1],e[2]);}mockTypes(u){if(this._mockFn=u||this._mockFn,"function"==typeof this._mockFn)for(const u in this._types)this[u]=this._mockFn(u,this._types[u])||this[u];}_wrapLogFn(u){return function(){if(!paused)return this._logFn(u,arguments);queue.push([this,u,arguments]);}.bind(this)}_logFn(u,e){if(u.level>this._level)return !!this._async&&Promise.resolve(!1);const t=Object.assign({date:new Date,args:[]},u);1===e.length&&isLogObj(e[0])?Object.assign(t,e[0]):t.args=Array.from(e),t.message&&(t.args.unshift(t.message),delete t.message),t.additional&&(Array.isArray(t.additional)||(t.additional=t.additional.split("\n")),t.args.push("\n"+t.additional.join("\n")),delete t.additional),t.type&&(t.type=t.type.toLowerCase()),t.tag&&(t.tag=t.tag.toLowerCase());const D=this._lastLogTime?t.date-this._lastLogTime:0;if(this._lastLogTime=t.date,D<this._throttle)try{const u=JSON.stringify([t.type,t.tag,t.args]),e=this._lastLogSerialized===u;if(this._lastLogSerialized=u,e)return void this._lastLogCount++}catch(u){}if(this._lastLogCount&&(this._log({...this._lastLog,args:[...this._lastLog.args,`(repeated ${this._lastLogCount} times)`]}),this._lastLogCount=0),this._lastLog=t,this._async)return this._logAsync(t);this._log(t);}_log(u){for(const e of this._reporters)e.log(u,{async:!1,stdout:this.stdout,stderr:this.stderr});}_logAsync(u){return Promise.all(this._reporters.map(e=>e.log(u,{async:!0,stdout:this.stdout,stderr:this.stderr})))}}function parseStack(u){const e=process.cwd()+path.sep;return u.split("\n").splice(1).map(u=>u.trim().replace("file://","").replace(e,""))}function writeStream(u,e,t="default"){const D=e.__write||e.write;switch(t){case"async":return new Promise(t=>{!0===D.call(e,u)?t():e.once("drain",()=>{t();});});case"sync":return fs.writeSync(e.fd,u);default:return D.call(e,u)}}Consola.prototype.add=Consola.prototype.addReporter,Consola.prototype.remove=Consola.prototype.removeReporter,Consola.prototype.clear=Consola.prototype.removeReporter,Consola.prototype.withScope=Consola.prototype.withTag,Consola.prototype.mock=Consola.prototype.mockTypes,Consola.prototype.pause=Consola.prototype.pauseLogs,Consola.prototype.resume=Consola.prototype.resumeLogs;var dayjs_min=createCommonjsModule$1(function(u,e){u.exports=function(){var u="millisecond",e="second",t="minute",D="hour",r="day",n="week",o="month",s="quarter",i="year",a=/^(\d{4})-?(\d{1,2})-?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/,l=/\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,c=function(u,e,t){var D=String(u);return !D||D.length>=e?u:""+Array(e+1-D.length).join(t)+u},h={s:c,z:function(u){var e=-u.utcOffset(),t=Math.abs(e),D=Math.floor(t/60),r=t%60;return (e<=0?"+":"-")+c(D,2,"0")+":"+c(r,2,"0")},m:function(u,e){var t=12*(e.year()-u.year())+(e.month()-u.month()),D=u.clone().add(t,o),r=e-D<0,n=u.clone().add(t+(r?-1:1),o);return Number(-(t+(e-D)/(r?D-n:n-D))||0)},a:function(u){return u<0?Math.ceil(u)||0:Math.floor(u)},p:function(a){return {M:o,y:i,w:n,d:r,h:D,m:t,s:e,ms:u,Q:s}[a]||String(a||"").toLowerCase().replace(/s$/,"")},u:function(u){return void 0===u}},C={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},F="en",p={};p[F]=C;var f=function(u){return u instanceof m},E=function(u,e,t){var D;if(!u)return null;if("string"==typeof u)p[u]&&(D=u),e&&(p[u]=e,D=u);else{var r=u.name;p[r]=u,D=r;}return t||(F=D),D},g=function(u,e,t){if(f(u))return u.clone();var D=e?"string"==typeof e?{format:e,pl:t}:e:{};return D.date=u,new m(D)},d=h;d.l=E,d.i=f,d.w=function(u,e){return g(u,{locale:e.$L,utc:e.$u})};var m=function(){function c(u){this.$L=this.$L||E(u.locale,null,!0)||F,this.parse(u);}var h=c.prototype;return h.parse=function(u){this.$d=function(u){var e=u.date,t=u.utc;if(null===e)return new Date(NaN);if(d.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var D=e.match(a);if(D)return t?new Date(Date.UTC(D[1],D[2]-1,D[3]||1,D[4]||0,D[5]||0,D[6]||0,D[7]||0)):new Date(D[1],D[2]-1,D[3]||1,D[4]||0,D[5]||0,D[6]||0,D[7]||0)}return new Date(e)}(u),this.init();},h.init=function(){var u=this.$d;this.$y=u.getFullYear(),this.$M=u.getMonth(),this.$D=u.getDate(),this.$W=u.getDay(),this.$H=u.getHours(),this.$m=u.getMinutes(),this.$s=u.getSeconds(),this.$ms=u.getMilliseconds();},h.$utils=function(){return d},h.isValid=function(){return !("Invalid Date"===this.$d.toString())},h.isSame=function(u,e){var t=g(u);return this.startOf(e)<=t&&t<=this.endOf(e)},h.isAfter=function(u,e){return g(u)<this.startOf(e)},h.isBefore=function(u,e){return this.endOf(e)<g(u)},h.$g=function(u,e,t){return d.u(u)?this[e]:this.set(t,u)},h.year=function(u){return this.$g(u,"$y",i)},h.month=function(u){return this.$g(u,"$M",o)},h.day=function(u){return this.$g(u,"$W",r)},h.date=function(u){return this.$g(u,"$D","date")},h.hour=function(u){return this.$g(u,"$H",D)},h.minute=function(u){return this.$g(u,"$m",t)},h.second=function(u){return this.$g(u,"$s",e)},h.millisecond=function(e){return this.$g(e,"$ms",u)},h.unix=function(){return Math.floor(this.valueOf()/1e3)},h.valueOf=function(){return this.$d.getTime()},h.startOf=function(u,s){var a=this,l=!!d.u(s)||s,c=d.p(u),h=function(u,e){var t=d.w(a.$u?Date.UTC(a.$y,e,u):new Date(a.$y,e,u),a);return l?t:t.endOf(r)},C=function(u,e){return d.w(a.toDate()[u].apply(a.toDate(),(l?[0,0,0,0]:[23,59,59,999]).slice(e)),a)},F=this.$W,p=this.$M,f=this.$D,E="set"+(this.$u?"UTC":"");switch(c){case i:return l?h(1,0):h(31,11);case o:return l?h(1,p):h(0,p+1);case n:var g=this.$locale().weekStart||0,m=(F<g?F+7:F)-g;return h(l?f-m:f+(6-m),p);case r:case"date":return C(E+"Hours",0);case D:return C(E+"Minutes",1);case t:return C(E+"Seconds",2);case e:return C(E+"Milliseconds",3);default:return this.clone()}},h.endOf=function(u){return this.startOf(u,!1)},h.$set=function(n,s){var a,l=d.p(n),c="set"+(this.$u?"UTC":""),h=(a={},a[r]=c+"Date",a.date=c+"Date",a[o]=c+"Month",a[i]=c+"FullYear",a[D]=c+"Hours",a[t]=c+"Minutes",a[e]=c+"Seconds",a[u]=c+"Milliseconds",a)[l],C=l===r?this.$D+(s-this.$W):s;if(l===o||l===i){var F=this.clone().set("date",1);F.$d[h](C),F.init(),this.$d=F.set("date",Math.min(this.$D,F.daysInMonth())).toDate();}else h&&this.$d[h](C);return this.init(),this},h.set=function(u,e){return this.clone().$set(u,e)},h.get=function(u){return this[d.p(u)]()},h.add=function(u,s){var a,l=this;u=Number(u);var c=d.p(s),h=function(e){var t=g(l);return d.w(t.date(t.date()+Math.round(e*u)),l)};if(c===o)return this.set(o,this.$M+u);if(c===i)return this.set(i,this.$y+u);if(c===r)return h(1);if(c===n)return h(7);var C=(a={},a[t]=6e4,a[D]=36e5,a[e]=1e3,a)[c]||1,F=this.valueOf()+u*C;return d.w(F,this)},h.subtract=function(u,e){return this.add(-1*u,e)},h.format=function(u){var e=this;if(!this.isValid())return "Invalid Date";var t=u||"YYYY-MM-DDTHH:mm:ssZ",D=d.z(this),r=this.$locale(),n=this.$H,o=this.$m,s=this.$M,i=r.weekdays,a=r.months,c=function(u,D,r,n){return u&&(u[D]||u(e,t))||r[D].substr(0,n)},h=function(u){return d.s(n%12||12,u,"0")},C=r.meridiem||function(u,e,t){var D=u<12?"AM":"PM";return t?D.toLowerCase():D},F={YY:String(this.$y).slice(-2),YYYY:this.$y,M:s+1,MM:d.s(s+1,2,"0"),MMM:c(r.monthsShort,s,a,3),MMMM:a[s]||a(this,t),D:this.$D,DD:d.s(this.$D,2,"0"),d:String(this.$W),dd:c(r.weekdaysMin,this.$W,i,2),ddd:c(r.weekdaysShort,this.$W,i,3),dddd:i[this.$W],H:String(n),HH:d.s(n,2,"0"),h:h(1),hh:h(2),a:C(n,o,!0),A:C(n,o,!1),m:String(o),mm:d.s(o,2,"0"),s:String(this.$s),ss:d.s(this.$s,2,"0"),SSS:d.s(this.$ms,3,"0"),Z:D};return t.replace(l,function(u,e){return e||F[u]||D.replace(":","")})},h.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},h.diff=function(u,a,l){var c,h=d.p(a),C=g(u),F=6e4*(C.utcOffset()-this.utcOffset()),p=this-C,f=d.m(this,C);return f=(c={},c[i]=f/12,c[o]=f,c[s]=f/3,c[n]=(p-F)/6048e5,c[r]=(p-F)/864e5,c[D]=p/36e5,c[t]=p/6e4,c[e]=p/1e3,c)[h]||p,l?f:d.a(f)},h.daysInMonth=function(){return this.endOf(o).$D},h.$locale=function(){return p[this.$L]},h.locale=function(u,e){if(!u)return this.$L;var t=this.clone();return t.$L=E(u,e,!0),t},h.clone=function(){return d.w(this.toDate(),this)},h.toDate=function(){return new Date(this.$d)},h.toJSON=function(){return this.toISOString()},h.toISOString=function(){return this.$d.toISOString()},h.toString=function(){return this.$d.toUTCString()},c}();return g.prototype=m.prototype,g.extend=function(u,e){return u(e,m,g),g},g.locale=E,g.isDayjs=f,g.unix=function(u){return g(1e3*u)},g.en=p[F],g.Ls=p,g}();});function formatDate(u,e){return dayjs_min(e).format(u)}const DEFAULTS={dateFormat:"HH:mm:ss",formatOptions:{colors:!1,compact:!0}},bracket=u=>u?`[${u}]`:"";class BasicReporter{constructor(u){this.options=Object.assign({},DEFAULTS,u);}formatStack(u){return "  "+parseStack(u).join("\n  ")}formatArgs(u){const e=u.map(u=>u&&"string"==typeof u.stack?u.message+"\n"+this.formatStack(u.stack):u);return "function"==typeof util.formatWithOptions?util.formatWithOptions(this.options.formatOptions,...e):util.format(...e)}formatDate(u){return formatDate(this.options.dateFormat,u)}filterAndJoin(u){return u.filter(u=>u).join(" ")}formatLogObj(u){const e=this.formatArgs(u.args);return this.filterAndJoin([bracket(u.type),bracket(u.tag),e])}log(u,{async:e,stdout:t,stderr:D}={}){return writeStream(this.formatLogObj(u,{width:t.columns||0})+"\n",u.level<2?D:t,e?"async":"default")}}var ansiRegex=u=>{u=Object.assign({onlyFirst:!1},u);const e=["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)","(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|");return new RegExp(e,u.onlyFirst?void 0:"g")};const stripAnsi=u=>"string"==typeof u?u.replace(ansiRegex(),""):u;var stripAnsi_1=stripAnsi,default_1=stripAnsi;stripAnsi_1.default=default_1;const isFullwidthCodePoint=u=>!Number.isNaN(u)&&(u>=4352&&(u<=4447||9001===u||9002===u||11904<=u&&u<=12871&&12351!==u||12880<=u&&u<=19903||19968<=u&&u<=42182||43360<=u&&u<=43388||44032<=u&&u<=55203||63744<=u&&u<=64255||65040<=u&&u<=65049||65072<=u&&u<=65131||65281<=u&&u<=65376||65504<=u&&u<=65510||110592<=u&&u<=110593||127488<=u&&u<=127569||131072<=u&&u<=262141));var isFullwidthCodePoint_1=isFullwidthCodePoint,default_1$1=isFullwidthCodePoint;isFullwidthCodePoint_1.default=default_1$1;var emojiRegex=function(){return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g};const stringWidth=u=>{if("string"!=typeof(u=u.replace(emojiRegex(),"  "))||0===u.length)return 0;u=stripAnsi_1(u);let e=0;for(let t=0;t<u.length;t++){const D=u.codePointAt(t);D<=31||D>=127&&D<=159||(D>=768&&D<=879||(D>65535&&t++,e+=isFullwidthCodePoint_1(D)?2:1));}return e};var stringWidth_1=stringWidth,default_1$2=stringWidth;stringWidth_1.default=default_1$2;var matchOperatorsRe=/[|\\{}()[\]^$+*?.]/g,escapeStringRegexp=function(u){if("string"!=typeof u)throw new TypeError("Expected a string");return u.replace(matchOperatorsRe,"\\$&")};const{platform:platform$1}=process,main={tick:"✔",cross:"✖",star:"★",square:"▇",squareSmall:"◻",squareSmallFilled:"◼",play:"▶",circle:"◯",circleFilled:"◉",circleDotted:"◌",circleDouble:"◎",circleCircle:"ⓞ",circleCross:"ⓧ",circlePipe:"Ⓘ",circleQuestionMark:"?⃝",bullet:"●",dot:"․",line:"─",ellipsis:"…",pointer:"❯",pointerSmall:"›",info:"ℹ",warning:"⚠",hamburger:"☰",smiley:"㋡",mustache:"෴",heart:"♥",arrowUp:"↑",arrowDown:"↓",arrowLeft:"←",arrowRight:"→",radioOn:"◉",radioOff:"◯",checkboxOn:"☒",checkboxOff:"☐",checkboxCircleOn:"ⓧ",checkboxCircleOff:"Ⓘ",questionMarkPrefix:"?⃝",oneHalf:"½",oneThird:"⅓",oneQuarter:"¼",oneFifth:"⅕",oneSixth:"⅙",oneSeventh:"⅐",oneEighth:"⅛",oneNinth:"⅑",oneTenth:"⅒",twoThirds:"⅔",twoFifths:"⅖",threeQuarters:"¾",threeFifths:"⅗",threeEighths:"⅜",fourFifths:"⅘",fiveSixths:"⅚",fiveEighths:"⅝",sevenEighths:"⅞"},windows={tick:"√",cross:"×",star:"*",square:"█",squareSmall:"[ ]",squareSmallFilled:"[█]",play:"►",circle:"( )",circleFilled:"(*)",circleDotted:"( )",circleDouble:"( )",circleCircle:"(○)",circleCross:"(×)",circlePipe:"(│)",circleQuestionMark:"(?)",bullet:"*",dot:".",line:"─",ellipsis:"...",pointer:">",pointerSmall:"»",info:"i",warning:"‼",hamburger:"≡",smiley:"☺",mustache:"┌─┐",heart:main.heart,arrowUp:main.arrowUp,arrowDown:main.arrowDown,arrowLeft:main.arrowLeft,arrowRight:main.arrowRight,radioOn:"(*)",radioOff:"( )",checkboxOn:"[×]",checkboxOff:"[ ]",checkboxCircleOn:"(×)",checkboxCircleOff:"( )",questionMarkPrefix:"？",oneHalf:"1/2",oneThird:"1/3",oneQuarter:"1/4",oneFifth:"1/5",oneSixth:"1/6",oneSeventh:"1/7",oneEighth:"1/8",oneNinth:"1/9",oneTenth:"1/10",twoThirds:"2/3",twoFifths:"2/5",threeQuarters:"3/4",threeFifths:"3/5",threeEighths:"3/8",fourFifths:"4/5",fiveSixths:"5/6",fiveEighths:"5/8",sevenEighths:"7/8"};"linux"===platform$1&&(main.questionMarkPrefix="?");const figures="win32"===platform$1?windows:main,fn=u=>{if(figures===main)return u;for(const[e,t]of Object.entries(main))t!==figures[e]&&(u=u.replace(new RegExp(escapeStringRegexp(t),"g"),figures[e]));return u};var figures_1=Object.assign(fn,figures),colorName={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]},conversions=createCommonjsModule$1(function(u){var e={};for(var t in colorName)colorName.hasOwnProperty(t)&&(e[colorName[t]]=t);var D=u.exports={rgb:{channels:3,labels:"rgb"},hsl:{channels:3,labels:"hsl"},hsv:{channels:3,labels:"hsv"},hwb:{channels:3,labels:"hwb"},cmyk:{channels:4,labels:"cmyk"},xyz:{channels:3,labels:"xyz"},lab:{channels:3,labels:"lab"},lch:{channels:3,labels:"lch"},hex:{channels:1,labels:["hex"]},keyword:{channels:1,labels:["keyword"]},ansi16:{channels:1,labels:["ansi16"]},ansi256:{channels:1,labels:["ansi256"]},hcg:{channels:3,labels:["h","c","g"]},apple:{channels:3,labels:["r16","g16","b16"]},gray:{channels:1,labels:["gray"]}};for(var r in D)if(D.hasOwnProperty(r)){if(!("channels"in D[r]))throw new Error("missing channels property: "+r);if(!("labels"in D[r]))throw new Error("missing channel labels property: "+r);if(D[r].labels.length!==D[r].channels)throw new Error("channel and label counts mismatch: "+r);var n=D[r].channels,o=D[r].labels;delete D[r].channels,delete D[r].labels,Object.defineProperty(D[r],"channels",{value:n}),Object.defineProperty(D[r],"labels",{value:o});}D.rgb.hsl=function(u){var e,t,D=u[0]/255,r=u[1]/255,n=u[2]/255,o=Math.min(D,r,n),s=Math.max(D,r,n),i=s-o;return s===o?e=0:D===s?e=(r-n)/i:r===s?e=2+(n-D)/i:n===s&&(e=4+(D-r)/i),(e=Math.min(60*e,360))<0&&(e+=360),t=(o+s)/2,[e,100*(s===o?0:t<=.5?i/(s+o):i/(2-s-o)),100*t]},D.rgb.hsv=function(u){var e,t,D,r,n,o=u[0]/255,s=u[1]/255,i=u[2]/255,a=Math.max(o,s,i),l=a-Math.min(o,s,i),c=function(u){return (a-u)/6/l+.5};return 0===l?r=n=0:(n=l/a,e=c(o),t=c(s),D=c(i),o===a?r=D-t:s===a?r=1/3+e-D:i===a&&(r=2/3+t-e),r<0?r+=1:r>1&&(r-=1)),[360*r,100*n,100*a]},D.rgb.hwb=function(u){var e=u[0],t=u[1],r=u[2];return [D.rgb.hsl(u)[0],100*(1/255*Math.min(e,Math.min(t,r))),100*(r=1-1/255*Math.max(e,Math.max(t,r)))]},D.rgb.cmyk=function(u){var e,t=u[0]/255,D=u[1]/255,r=u[2]/255;return [100*((1-t-(e=Math.min(1-t,1-D,1-r)))/(1-e)||0),100*((1-D-e)/(1-e)||0),100*((1-r-e)/(1-e)||0),100*e]},D.rgb.keyword=function(u){var t=e[u];if(t)return t;var D,r,n,o=1/0;for(var s in colorName)if(colorName.hasOwnProperty(s)){var i=colorName[s],a=(r=u,n=i,Math.pow(r[0]-n[0],2)+Math.pow(r[1]-n[1],2)+Math.pow(r[2]-n[2],2));a<o&&(o=a,D=s);}return D},D.keyword.rgb=function(u){return colorName[u]},D.rgb.xyz=function(u){var e=u[0]/255,t=u[1]/255,D=u[2]/255;return [100*(.4124*(e=e>.04045?Math.pow((e+.055)/1.055,2.4):e/12.92)+.3576*(t=t>.04045?Math.pow((t+.055)/1.055,2.4):t/12.92)+.1805*(D=D>.04045?Math.pow((D+.055)/1.055,2.4):D/12.92)),100*(.2126*e+.7152*t+.0722*D),100*(.0193*e+.1192*t+.9505*D)]},D.rgb.lab=function(u){var e=D.rgb.xyz(u),t=e[0],r=e[1],n=e[2];return r/=100,n/=108.883,t=(t/=95.047)>.008856?Math.pow(t,1/3):7.787*t+16/116,[116*(r=r>.008856?Math.pow(r,1/3):7.787*r+16/116)-16,500*(t-r),200*(r-(n=n>.008856?Math.pow(n,1/3):7.787*n+16/116))]},D.hsl.rgb=function(u){var e,t,D,r,n,o=u[0]/360,s=u[1]/100,i=u[2]/100;if(0===s)return [n=255*i,n,n];e=2*i-(t=i<.5?i*(1+s):i+s-i*s),r=[0,0,0];for(var a=0;a<3;a++)(D=o+1/3*-(a-1))<0&&D++,D>1&&D--,n=6*D<1?e+6*(t-e)*D:2*D<1?t:3*D<2?e+(t-e)*(2/3-D)*6:e,r[a]=255*n;return r},D.hsl.hsv=function(u){var e=u[0],t=u[1]/100,D=u[2]/100,r=t,n=Math.max(D,.01);return t*=(D*=2)<=1?D:2-D,r*=n<=1?n:2-n,[e,100*(0===D?2*r/(n+r):2*t/(D+t)),100*((D+t)/2)]},D.hsv.rgb=function(u){var e=u[0]/60,t=u[1]/100,D=u[2]/100,r=Math.floor(e)%6,n=e-Math.floor(e),o=255*D*(1-t),s=255*D*(1-t*n),i=255*D*(1-t*(1-n));switch(D*=255,r){case 0:return [D,i,o];case 1:return [s,D,o];case 2:return [o,D,i];case 3:return [o,s,D];case 4:return [i,o,D];case 5:return [D,o,s]}},D.hsv.hsl=function(u){var e,t,D,r=u[0],n=u[1]/100,o=u[2]/100,s=Math.max(o,.01);return D=(2-n)*o,t=n*s,[r,100*(t=(t/=(e=(2-n)*s)<=1?e:2-e)||0),100*(D/=2)]},D.hwb.rgb=function(u){var e,t,D,r,n,o,s,i=u[0]/360,a=u[1]/100,l=u[2]/100,c=a+l;switch(c>1&&(a/=c,l/=c),D=6*i-(e=Math.floor(6*i)),0!=(1&e)&&(D=1-D),r=a+D*((t=1-l)-a),e){default:case 6:case 0:n=t,o=r,s=a;break;case 1:n=r,o=t,s=a;break;case 2:n=a,o=t,s=r;break;case 3:n=a,o=r,s=t;break;case 4:n=r,o=a,s=t;break;case 5:n=t,o=a,s=r;}return [255*n,255*o,255*s]},D.cmyk.rgb=function(u){var e=u[0]/100,t=u[1]/100,D=u[2]/100,r=u[3]/100;return [255*(1-Math.min(1,e*(1-r)+r)),255*(1-Math.min(1,t*(1-r)+r)),255*(1-Math.min(1,D*(1-r)+r))]},D.xyz.rgb=function(u){var e,t,D,r=u[0]/100,n=u[1]/100,o=u[2]/100;return t=-.9689*r+1.8758*n+.0415*o,D=.0557*r+-.204*n+1.057*o,e=(e=3.2406*r+-1.5372*n+-.4986*o)>.0031308?1.055*Math.pow(e,1/2.4)-.055:12.92*e,t=t>.0031308?1.055*Math.pow(t,1/2.4)-.055:12.92*t,D=D>.0031308?1.055*Math.pow(D,1/2.4)-.055:12.92*D,[255*(e=Math.min(Math.max(0,e),1)),255*(t=Math.min(Math.max(0,t),1)),255*(D=Math.min(Math.max(0,D),1))]},D.xyz.lab=function(u){var e=u[0],t=u[1],D=u[2];return t/=100,D/=108.883,e=(e/=95.047)>.008856?Math.pow(e,1/3):7.787*e+16/116,[116*(t=t>.008856?Math.pow(t,1/3):7.787*t+16/116)-16,500*(e-t),200*(t-(D=D>.008856?Math.pow(D,1/3):7.787*D+16/116))]},D.lab.xyz=function(u){var e,t,D,r=u[0];e=u[1]/500+(t=(r+16)/116),D=t-u[2]/200;var n=Math.pow(t,3),o=Math.pow(e,3),s=Math.pow(D,3);return t=n>.008856?n:(t-16/116)/7.787,e=o>.008856?o:(e-16/116)/7.787,D=s>.008856?s:(D-16/116)/7.787,[e*=95.047,t*=100,D*=108.883]},D.lab.lch=function(u){var e,t=u[0],D=u[1],r=u[2];return (e=360*Math.atan2(r,D)/2/Math.PI)<0&&(e+=360),[t,Math.sqrt(D*D+r*r),e]},D.lch.lab=function(u){var e,t=u[0],D=u[1];return e=u[2]/360*2*Math.PI,[t,D*Math.cos(e),D*Math.sin(e)]},D.rgb.ansi16=function(u){var e=u[0],t=u[1],r=u[2],n=1 in arguments?arguments[1]:D.rgb.hsv(u)[2];if(0===(n=Math.round(n/50)))return 30;var o=30+(Math.round(r/255)<<2|Math.round(t/255)<<1|Math.round(e/255));return 2===n&&(o+=60),o},D.hsv.ansi16=function(u){return D.rgb.ansi16(D.hsv.rgb(u),u[2])},D.rgb.ansi256=function(u){var e=u[0],t=u[1],D=u[2];return e===t&&t===D?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(t/255*5)+Math.round(D/255*5)},D.ansi16.rgb=function(u){var e=u%10;if(0===e||7===e)return u>50&&(e+=3.5),[e=e/10.5*255,e,e];var t=.5*(1+~~(u>50));return [(1&e)*t*255,(e>>1&1)*t*255,(e>>2&1)*t*255]},D.ansi256.rgb=function(u){if(u>=232){var e=10*(u-232)+8;return [e,e,e]}var t;return u-=16,[Math.floor(u/36)/5*255,Math.floor((t=u%36)/6)/5*255,t%6/5*255]},D.rgb.hex=function(u){var e=(((255&Math.round(u[0]))<<16)+((255&Math.round(u[1]))<<8)+(255&Math.round(u[2]))).toString(16).toUpperCase();return "000000".substring(e.length)+e},D.hex.rgb=function(u){var e=u.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);if(!e)return [0,0,0];var t=e[0];3===e[0].length&&(t=t.split("").map(function(u){return u+u}).join(""));var D=parseInt(t,16);return [D>>16&255,D>>8&255,255&D]},D.rgb.hcg=function(u){var e,t=u[0]/255,D=u[1]/255,r=u[2]/255,n=Math.max(Math.max(t,D),r),o=Math.min(Math.min(t,D),r),s=n-o;return e=s<=0?0:n===t?(D-r)/s%6:n===D?2+(r-t)/s:4+(t-D)/s+4,e/=6,[360*(e%=1),100*s,100*(s<1?o/(1-s):0)]},D.hsl.hcg=function(u){var e=u[1]/100,t=u[2]/100,D=1,r=0;return (D=t<.5?2*e*t:2*e*(1-t))<1&&(r=(t-.5*D)/(1-D)),[u[0],100*D,100*r]},D.hsv.hcg=function(u){var e=u[1]/100,t=u[2]/100,D=e*t,r=0;return D<1&&(r=(t-D)/(1-D)),[u[0],100*D,100*r]},D.hcg.rgb=function(u){var e=u[0]/360,t=u[1]/100,D=u[2]/100;if(0===t)return [255*D,255*D,255*D];var r,n=[0,0,0],o=e%1*6,s=o%1,i=1-s;switch(Math.floor(o)){case 0:n[0]=1,n[1]=s,n[2]=0;break;case 1:n[0]=i,n[1]=1,n[2]=0;break;case 2:n[0]=0,n[1]=1,n[2]=s;break;case 3:n[0]=0,n[1]=i,n[2]=1;break;case 4:n[0]=s,n[1]=0,n[2]=1;break;default:n[0]=1,n[1]=0,n[2]=i;}return r=(1-t)*D,[255*(t*n[0]+r),255*(t*n[1]+r),255*(t*n[2]+r)]},D.hcg.hsv=function(u){var e=u[1]/100,t=e+u[2]/100*(1-e),D=0;return t>0&&(D=e/t),[u[0],100*D,100*t]},D.hcg.hsl=function(u){var e=u[1]/100,t=u[2]/100*(1-e)+.5*e,D=0;return t>0&&t<.5?D=e/(2*t):t>=.5&&t<1&&(D=e/(2*(1-t))),[u[0],100*D,100*t]},D.hcg.hwb=function(u){var e=u[1]/100,t=e+u[2]/100*(1-e);return [u[0],100*(t-e),100*(1-t)]},D.hwb.hcg=function(u){var e=u[1]/100,t=1-u[2]/100,D=t-e,r=0;return D<1&&(r=(t-D)/(1-D)),[u[0],100*D,100*r]},D.apple.rgb=function(u){return [u[0]/65535*255,u[1]/65535*255,u[2]/65535*255]},D.rgb.apple=function(u){return [u[0]/255*65535,u[1]/255*65535,u[2]/255*65535]},D.gray.rgb=function(u){return [u[0]/100*255,u[0]/100*255,u[0]/100*255]},D.gray.hsl=D.gray.hsv=function(u){return [0,0,u[0]]},D.gray.hwb=function(u){return [0,100,u[0]]},D.gray.cmyk=function(u){return [0,0,0,u[0]]},D.gray.lab=function(u){return [u[0],0,0]},D.gray.hex=function(u){var e=255&Math.round(u[0]/100*255),t=((e<<16)+(e<<8)+e).toString(16).toUpperCase();return "000000".substring(t.length)+t},D.rgb.gray=function(u){return [(u[0]+u[1]+u[2])/3/255*100]};}),conversions_1=conversions.rgb,conversions_2=conversions.hsl,conversions_3=conversions.hsv,conversions_4=conversions.hwb,conversions_5=conversions.cmyk,conversions_6=conversions.xyz,conversions_7=conversions.lab,conversions_8=conversions.lch,conversions_9=conversions.hex,conversions_10=conversions.keyword,conversions_11=conversions.ansi16,conversions_12=conversions.ansi256,conversions_13=conversions.hcg,conversions_14=conversions.apple,conversions_15=conversions.gray;function buildGraph(){for(var u={},e=Object.keys(conversions),t=e.length,D=0;D<t;D++)u[e[D]]={distance:-1,parent:null};return u}function deriveBFS(u){var e=buildGraph(),t=[u];for(e[u].distance=0;t.length;)for(var D=t.pop(),r=Object.keys(conversions[D]),n=r.length,o=0;o<n;o++){var s=r[o],i=e[s];-1===i.distance&&(i.distance=e[D].distance+1,i.parent=D,t.unshift(s));}return e}function link(u,e){return function(t){return e(u(t))}}function wrapConversion(u,e){for(var t=[e[u].parent,u],D=conversions[e[u].parent][u],r=e[u].parent;e[r].parent;)t.unshift(e[r].parent),D=link(conversions[e[r].parent][r],D),r=e[r].parent;return D.conversion=t,D}var route=function(u){for(var e=deriveBFS(u),t={},D=Object.keys(e),r=D.length,n=0;n<r;n++){var o=D[n];null!==e[o].parent&&(t[o]=wrapConversion(o,e));}return t},convert={},models=Object.keys(conversions);function wrapRaw(u){var e=function(e){return null==e?e:(arguments.length>1&&(e=Array.prototype.slice.call(arguments)),u(e))};return "conversion"in u&&(e.conversion=u.conversion),e}function wrapRounded(u){var e=function(e){if(null==e)return e;arguments.length>1&&(e=Array.prototype.slice.call(arguments));var t=u(e);if("object"==typeof t)for(var D=t.length,r=0;r<D;r++)t[r]=Math.round(t[r]);return t};return "conversion"in u&&(e.conversion=u.conversion),e}models.forEach(function(u){convert[u]={},Object.defineProperty(convert[u],"channels",{value:conversions[u].channels}),Object.defineProperty(convert[u],"labels",{value:conversions[u].labels});var e=route(u);Object.keys(e).forEach(function(t){var D=e[t];convert[u][t]=wrapRounded(D),convert[u][t].raw=wrapRaw(D);});});var colorConvert=convert,ansiStyles=createCommonjsModule$1(function(u){const e=(u,e)=>(function(){return `[${u.apply(colorConvert,arguments)+e}m`}),t=(u,e)=>(function(){const t=u.apply(colorConvert,arguments);return `[${38+e};5;${t}m`}),D=(u,e)=>(function(){const t=u.apply(colorConvert,arguments);return `[${38+e};2;${t[0]};${t[1]};${t[2]}m`});Object.defineProperty(u,"exports",{enumerable:!0,get:function(){const u=new Map,r={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],gray:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};r.color.grey=r.color.gray;for(const e of Object.keys(r)){const t=r[e];for(const e of Object.keys(t)){const D=t[e];r[e]={open:`[${D[0]}m`,close:`[${D[1]}m`},t[e]=r[e],u.set(D[0],D[1]);}Object.defineProperty(r,e,{value:t,enumerable:!1}),Object.defineProperty(r,"codes",{value:u,enumerable:!1});}const n=u=>u,o=(u,e,t)=>[u,e,t];r.color.close="[39m",r.bgColor.close="[49m",r.color.ansi={ansi:e(n,0)},r.color.ansi256={ansi256:t(n,0)},r.color.ansi16m={rgb:D(o,0)},r.bgColor.ansi={ansi:e(n,10)},r.bgColor.ansi256={ansi256:t(n,10)},r.bgColor.ansi16m={rgb:D(o,10)};for(let u of Object.keys(colorConvert)){if("object"!=typeof colorConvert[u])continue;const n=colorConvert[u];"ansi16"===u&&(u="ansi"),"ansi16"in n&&(r.color.ansi[u]=e(n.ansi16,0),r.bgColor.ansi[u]=e(n.ansi16,10)),"ansi256"in n&&(r.color.ansi256[u]=t(n.ansi256,0),r.bgColor.ansi256[u]=t(n.ansi256,10)),"rgb"in n&&(r.color.ansi16m[u]=D(n.rgb,0),r.bgColor.ansi16m[u]=D(n.rgb,10));}return r}});}),hasFlag=(u,e)=>{e=e||process.argv;const t=u.startsWith("-")?"":1===u.length?"-":"--",D=e.indexOf(t+u),r=e.indexOf("--");return -1!==D&&(-1===r||D<r)};const env$1=process.env;let forceColor;function translateLevel(u){return 0!==u&&{level:u,hasBasic:!0,has256:u>=2,has16m:u>=3}}function supportsColor(u){if(!1===forceColor)return 0;if(hasFlag("color=16m")||hasFlag("color=full")||hasFlag("color=truecolor"))return 3;if(hasFlag("color=256"))return 2;if(u&&!u.isTTY&&!0!==forceColor)return 0;const e=forceColor?1:0;if("win32"===process.platform){const u=os.release().split(".");return Number(process.versions.node.split(".")[0])>=8&&Number(u[0])>=10&&Number(u[2])>=10586?Number(u[2])>=14931?3:2:1}if("CI"in env$1)return ["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI"].some(u=>u in env$1)||"codeship"===env$1.CI_NAME?1:e;if("TEAMCITY_VERSION"in env$1)return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env$1.TEAMCITY_VERSION)?1:0;if("truecolor"===env$1.COLORTERM)return 3;if("TERM_PROGRAM"in env$1){const u=parseInt((env$1.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(env$1.TERM_PROGRAM){case"iTerm.app":return u>=3?3:2;case"Apple_Terminal":return 2}}return /-256(color)?$/i.test(env$1.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env$1.TERM)?1:"COLORTERM"in env$1?1:(env$1.TERM,e)}function getSupportLevel(u){return translateLevel(supportsColor(u))}hasFlag("no-color")||hasFlag("no-colors")||hasFlag("color=false")?forceColor=!1:(hasFlag("color")||hasFlag("colors")||hasFlag("color=true")||hasFlag("color=always"))&&(forceColor=!0),"FORCE_COLOR"in env$1&&(forceColor=0===env$1.FORCE_COLOR.length||0!==parseInt(env$1.FORCE_COLOR,10));var supportsColor_1={supportsColor:getSupportLevel,stdout:getSupportLevel(process.stdout),stderr:getSupportLevel(process.stderr)};const TEMPLATE_REGEX=/(?:\\(u[a-f\d]{4}|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi,STYLE_REGEX=/(?:^|\.)(\w+)(?:\(([^)]*)\))?/g,STRING_REGEX=/^(['"])((?:\\.|(?!\1)[^\\])*)\1$/,ESCAPE_REGEX=/\\(u[a-f\d]{4}|x[a-f\d]{2}|.)|([^\\])/gi,ESCAPES=new Map([["n","\n"],["r","\r"],["t","\t"],["b","\b"],["f","\f"],["v","\v"],["0","\0"],["\\","\\"],["e",""],["a",""]]);function unescape(u){return "u"===u[0]&&5===u.length||"x"===u[0]&&3===u.length?String.fromCharCode(parseInt(u.slice(1),16)):ESCAPES.get(u)||u}function parseArguments(u,e){const t=[],D=e.trim().split(/\s*,\s*/g);let r;for(const e of D)if(isNaN(e)){if(!(r=e.match(STRING_REGEX)))throw new Error(`Invalid Chalk template style argument: ${e} (in style '${u}')`);t.push(r[2].replace(ESCAPE_REGEX,(u,e,t)=>e?unescape(e):t));}else t.push(Number(e));return t}function parseStyle(u){STYLE_REGEX.lastIndex=0;const e=[];let t;for(;null!==(t=STYLE_REGEX.exec(u));){const u=t[1];if(t[2]){const D=parseArguments(u,t[2]);e.push([u].concat(D));}else e.push([u]);}return e}function buildStyle(u,e){const t={};for(const u of e)for(const e of u.styles)t[e[0]]=u.inverse?null:e.slice(1);let D=u;for(const u of Object.keys(t))if(Array.isArray(t[u])){if(!(u in D))throw new Error(`Unknown Chalk style: ${u}`);D=t[u].length>0?D[u].apply(D,t[u]):D[u];}return D}var templates=(u,e)=>{const t=[],D=[];let r=[];if(e.replace(TEMPLATE_REGEX,(e,n,o,s,i,a)=>{if(n)r.push(unescape(n));else if(s){const e=r.join("");r=[],D.push(0===t.length?e:buildStyle(u,t)(e)),t.push({inverse:o,styles:parseStyle(s)});}else if(i){if(0===t.length)throw new Error("Found extraneous } in Chalk template literal");D.push(buildStyle(u,t)(r.join(""))),r=[],t.pop();}else r.push(a);}),D.push(r.join("")),t.length>0){const u=`Chalk template literal is missing ${t.length} closing bracket${1===t.length?"":"s"} (\`}\`)`;throw new Error(u)}return D.join("")},chalk=createCommonjsModule$1(function(u){const e=supportsColor_1.stdout,t="win32"===process.platform&&!(process.env.TERM||"").toLowerCase().startsWith("xterm"),D=["ansi","ansi","ansi256","ansi16m"],r=new Set(["gray"]),n=Object.create(null);function o(u,t){t=t||{};const D=e?e.level:0;u.level=void 0===t.level?D:t.level,u.enabled="enabled"in t?t.enabled:u.level>0;}function s(u){if(!this||!(this instanceof s)||this.template){const e={};return o(e,u),e.template=function(){const u=[].slice.call(arguments);return function(u,e){if(!Array.isArray(e))return [].slice.call(arguments,1).join(" ");const t=[].slice.call(arguments,2),D=[e.raw[0]];for(let u=1;u<e.length;u++)D.push(String(t[u-1]).replace(/[{}\\]/g,"\\$&")),D.push(String(e.raw[u]));return templates(u,D.join(""))}.apply(null,[e.template].concat(u))},Object.setPrototypeOf(e,s.prototype),Object.setPrototypeOf(e.template,e),e.template.constructor=s,e.template}o(this,u);}t&&(ansiStyles.blue.open="[94m");for(const u of Object.keys(ansiStyles))ansiStyles[u].closeRe=new RegExp(escapeStringRegexp(ansiStyles[u].close),"g"),n[u]={get(){const e=ansiStyles[u];return a.call(this,this._styles?this._styles.concat(e):[e],this._empty,u)}};n.visible={get(){return a.call(this,this._styles||[],!0,"visible")}},ansiStyles.color.closeRe=new RegExp(escapeStringRegexp(ansiStyles.color.close),"g");for(const u of Object.keys(ansiStyles.color.ansi))r.has(u)||(n[u]={get(){const e=this.level;return function(){const t={open:ansiStyles.color[D[e]][u].apply(null,arguments),close:ansiStyles.color.close,closeRe:ansiStyles.color.closeRe};return a.call(this,this._styles?this._styles.concat(t):[t],this._empty,u)}}});ansiStyles.bgColor.closeRe=new RegExp(escapeStringRegexp(ansiStyles.bgColor.close),"g");for(const u of Object.keys(ansiStyles.bgColor.ansi)){if(r.has(u))continue;n["bg"+u[0].toUpperCase()+u.slice(1)]={get(){const e=this.level;return function(){const t={open:ansiStyles.bgColor[D[e]][u].apply(null,arguments),close:ansiStyles.bgColor.close,closeRe:ansiStyles.bgColor.closeRe};return a.call(this,this._styles?this._styles.concat(t):[t],this._empty,u)}}};}const i=Object.defineProperties(()=>{},n);function a(u,e,D){const r=function(){return function(){const u=arguments,e=u.length;let D=String(arguments[0]);if(0===e)return "";if(e>1)for(let t=1;t<e;t++)D+=" "+u[t];if(!this.enabled||this.level<=0||!D)return this._empty?"":D;const r=ansiStyles.dim.open;t&&this.hasGrey&&(ansiStyles.dim.open="");for(const u of this._styles.slice().reverse())D=(D=u.open+D.replace(u.closeRe,u.open)+u.close).replace(/\r?\n/g,`${u.close}$&${u.open}`);return ansiStyles.dim.open=r,D}.apply(r,arguments)};r._styles=u,r._empty=e;const n=this;return Object.defineProperty(r,"level",{enumerable:!0,get:()=>n.level,set(u){n.level=u;}}),Object.defineProperty(r,"enabled",{enumerable:!0,get:()=>n.enabled,set(u){n.enabled=u;}}),r.hasGrey=this.hasGrey||"gray"===D||"grey"===D,r.__proto__=i,r}Object.defineProperties(s.prototype,n),u.exports=s(),u.exports.supportsColor=e,u.exports.default=u.exports;}),chalk_1=chalk.supportsColor;const _colorCache={};function chalkColor(u){let e=_colorCache[u];return e||(e="#"===u[0]?chalk.hex(u):chalk[u]||chalk.keyword(u),_colorCache[u]=e,e)}const _bgColorCache={};function chalkBgColor(u){let e=_bgColorCache[u];return e||(e="#"===u[0]?chalk.bgHex(u):chalk["bg"+u[0].toUpperCase()+u.slice(1)]||chalk.bgKeyword(u),_bgColorCache[u]=e,e)}const TYPE_COLOR_MAP={info:"cyan"},LEVEL_COLOR_MAP={0:"red",1:"yellow",2:"white",3:"green"},DEFAULTS$1={secondaryColor:"grey",formatOptions:{colors:!0,compact:!1}},TYPE_ICONS={info:figures_1("ℹ"),success:figures_1("✔"),debug:figures_1("›"),trace:figures_1("›"),log:""};class FancyReporter extends BasicReporter{constructor(u){super(Object.assign({},DEFAULTS$1,u));}formatStack(u){const e=chalkColor("grey"),t=chalkColor("cyan");return "\n"+parseStack(u).map(u=>"  "+u.replace(/^at +/,u=>e(u)).replace(/\((.+)\)/,(u,e)=>`(${t(e)})`)).join("\n")}formatType(u,e){const t=TYPE_COLOR_MAP[u.type]||LEVEL_COLOR_MAP[u.level]||this.options.secondaryColor;if(e)return chalkBgColor(t).black(` ${u.type.toUpperCase()} `);const D="string"==typeof TYPE_ICONS[u.type]?TYPE_ICONS[u.type]:u.icon||u.type;return D?chalkColor(t)(D):""}formatLogObj(u,{width:e}){const[t,...D]=this.formatArgs(u.args).split("\n"),r=void 0!==u.badge?Boolean(u.badge):u.level<2,n=chalkColor(this.options.secondaryColor),o=n(this.formatDate(u.date)),s=this.formatType(u,r),i=u.tag?n(u.tag):"",a=t.replace(/`([^`]+)`/g,(u,e)=>chalk.cyan(e));let l;const c=this.filterAndJoin([s,a]),h=this.filterAndJoin([i,o]),C=e-stringWidth_1(c)-stringWidth_1(h)-2;return l=C>0&&e>=80?c+" ".repeat(C)+h:c,l+=D.length?"\n"+D.join("\n"):"",r?"\n"+l+"\n":l}}class JSONReporter{constructor({stream:u}={}){this.stream=u||process.stdout;}log(u){this.stream.write(JSON.stringify(u)+"\n");}}const _require="undefined"!=typeof __non_webpack_require__?__non_webpack_require__:commonjsRequire;class WinstonReporter{constructor(u){if(u&&u.log)this.logger=u;else{const e=_require("winston");this.logger=e.createLogger(Object.assign({level:"info",format:e.format.simple(),transports:[new e.transports.Console]},u));}}log(u){const e=[].concat(u.args),t=e.shift();this.logger.log({level:levels[u.level]||"info",label:u.tag,message:t,args:e,timestamp:u.date.getTime()/1e3});}}const levels={0:"error",1:"warn",2:"info",3:"verbose",4:"debug",5:"silly"};function createConsola(){let u=stdEnv.debug?4:3;process.env.CONSOLA_LEVEL&&(u=parseInt(process.env.CONSOLA_LEVEL)||u);const e=new Consola({level:u,reporters:[stdEnv.ci||stdEnv.test?new BasicReporter:new FancyReporter]});return e.Consola=Consola,e.BasicReporter=BasicReporter,e.FancyReporter=FancyReporter,e.JSONReporter=JSONReporter,e.WinstonReporter=WinstonReporter,e}commonjsGlobal.consola||(commonjsGlobal.consola=createConsola());var node=commonjsGlobal.consola;var consola=node;

var readline = createCommonjsModule(function (module) {
var EventEmitter = events.EventEmitter;

var readLine = module.exports = function(file, opts) {
  if (!(this instanceof readLine)) return new readLine(file, opts);

  EventEmitter.call(this);
  opts = opts || {};
  opts.maxLineLength = opts.maxLineLength || 4096; // 4K
  opts.retainBuffer = !!opts.retainBuffer; //do not convert to String prior to invoking emit 'line' event
  var self = this,
      lineBuffer = new Buffer(opts.maxLineLength),
      lineLength = 0,
      lineCount = 0,
      byteCount = 0,
      emit = function(lineCount, byteCount) {
        try {
          var line = lineBuffer.slice(0, lineLength);
          self.emit('line', opts.retainBuffer? line : line.toString(), lineCount, byteCount);
        } catch (err) {
          self.emit('error', err);
        } finally {
          lineLength = 0; // Empty buffer.
        }
      };
  this.input = ('string' === typeof file) ? fs.createReadStream(file, opts) : file;
  this.input.on('open', function(fd) {
      self.emit('open', fd);
    })
    .on('data', function(data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i] == 10 || data[i] == 13) { // Newline char was found.
          if (data[i] == 10) {
            lineCount++;
            emit(lineCount, byteCount);
          }
        } else {
          lineBuffer[lineLength] = data[i]; // Buffer new line data.
          lineLength++;
        }
        byteCount++;
      }
    })
    .on('error', function(err) {
      self.emit('error', err);
    })
    .on('end', function() {
      // Emit last line if anything left over since EOF won't trigger it.
      if (lineLength) {
        lineCount++;
        emit(lineCount, byteCount);
      }
      self.emit('end');
    })
    .on('close', function() {
      self.emit('close');
    });
};
util$1.inherits(readLine, EventEmitter);
});

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defineProperty = _defineProperty;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function Diff() {
  this.diffenerce = {};
  this.diffs = {};
}

Diff.prototype.inject = function (name, line, lineCount) {
  if (name in this.diffs && lineCount in this.diffs[name]) {
    return this.compare(name, line, lineCount);
  }

  this.diffs[name] = _objectSpread({}, this.diffs[name], {}, defineProperty({}, lineCount, {
    line: line
  }));
};

Diff.prototype.compare = function (name, lineDiff, lineCount) {
  var line = this.diffs[name][lineCount].line;

  if (lineDiff !== line) {
    var lineChange = [line, lineDiff],
        data = defineProperty({}, lineCount, lineChange);

    this.diffenerce[name] = name in this.diffenerce ? _objectSpread({}, this.diffenerce[name], {}, data) : data;
  }
};

Diff.prototype.getDiff = function () {
  return this.diffenerce;
};

var diff = new Diff();

var log = consola.withTag('File');

var File = function File(name, path) {
  this.name = name;
  this.path = path;
  this.content = [];
  this.lines = 0;
};

File.prototype.add = function () {
  throw new Error('文件下面不能再添加文件');
};

File.prototype.scan =
/*#__PURE__*/
function () {
  var _ref = asyncToGenerator(
  /*#__PURE__*/
  regenerator.mark(function _callee(dir) {
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            log.info('开始扫描文件: ', this.name);
            _context.next = 4;
            return this._read(dir);

          case 4:
            _context.next = 9;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](0);
            log.error(_context.t0);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 6]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

File.prototype._read = function (dir) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    log.info('开始读取行: ', _this.path);
    var that = _this;
    var rl = readline(_this.path);
    rl.on('line', function (line, lineCount, byteCount) {
      diff.inject(that.path.replace("".concat(dir, "/"), ''), line, lineCount);
    }).on('end', function () {
      resolve(); // log.info(that.name,' 扫描完成')
    }).on('error', function (e) {
      reject(e);
    });
  });
};

var log$1 = consola.withTag('Folder');

var Folder = function Folder(path) {
  this.path = path;

  var folder = this._parse(path);

  this.name = folder.name;
  this.files = [];
};

Folder.prototype.init =
/*#__PURE__*/
asyncToGenerator(
/*#__PURE__*/
regenerator.mark(function _callee() {
  var directory, i, len, _this$_parse, name, path;

  return regenerator.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          log$1.info('开始读取内容文件');
          directory = this._readDir();
          log$1.info('结束读取内容文件');
          i = 0, len = directory.length;

          for (; i < len; i++) {
            _this$_parse = this._parse(directory[i]), name = _this$_parse.name, path = _this$_parse.path;

            this._add(new File(name, path));
          }

          _context.next = 7;
          return this._scan();

        case 7:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}));

Folder.prototype._add = function (file) {
  this.files.push(file);
};

Folder.prototype._scan =
/*#__PURE__*/
function () {
  var _ref2 = asyncToGenerator(
  /*#__PURE__*/
  regenerator.mark(function _callee2(directory) {
    var i, file, files;
    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            log$1.info('开始扫描文件夹: ' + this.name);
            i = 0, files = this.files;

          case 2:
            if (!(file = files[i++])) {
              _context2.next = 7;
              break;
            }

            _context2.next = 5;
            return file.scan(this.path);

          case 5:
            _context2.next = 2;
            break;

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();

Folder.prototype._readDir = function () {
  return readdir.readSync(this.path, null, readdir.ABSOLUTE_PATHS);
};

Folder.prototype._parse = function (path) {
  if (!path) return null;
  var data = path.split('/');
  return {
    path: path,
    name: this.name
  };
};

var log$2 = consola.withTag('Compare');

function compare(path1, path2) {
  return new Promise(
  /*#__PURE__*/
  function () {
    var _ref = asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee(resolve, reject) {
      var folder1, folder2, res;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              folder1 = new Folder(path1);
              folder2 = new Folder(path2);
              log$2.info('开始比对', folder1.name, folder2.name);
              _context.next = 6;
              return folder1.init();

            case 6:
              _context.next = 8;
              return folder2.init();

            case 8:
              res = diff.getDiff();
              resolve(res);
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](0);
              reject(_context.t0);

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 12]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
}

module.exports = compare;
