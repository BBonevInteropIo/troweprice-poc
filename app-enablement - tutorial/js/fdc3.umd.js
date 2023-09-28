(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.fdc3 = factory());
})(this, (function () { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest$1(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    let nanoid = (size = 21) =>
      crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
        byte &= 63;
        if (byte < 36) {
          id += byte.toString(36);
        } else if (byte < 62) {
          id += (byte - 26).toString(36).toUpperCase();
        } else if (byte > 62) {
          id += '-';
        } else {
          id += '_';
        }
        return id
      }, '');

    navigator.userAgent.toLowerCase().includes(" electron/");
    navigator.userAgent.toLowerCase().includes(" tick42-glue-desktop/");
    const isValidNonEmptyObject = (obj) => {
        return typeof obj === "object" && !Array.isArray(obj) && Object.keys(obj).length !== 0;
    };
    const AsyncListener = (actualUnsub) => {
        return {
            unsubscribe() {
                if (!actualUnsub) {
                    console.error("Failed to unsubscribe!");
                    return;
                }
                if (typeof actualUnsub === "function") {
                    actualUnsub();
                }
                else {
                    actualUnsub.then((unsubFunc) => unsubFunc()).catch(console.error);
                }
            }
        };
    };
    const checkIfInElectron = (globalFdc3) => {
        const hasGlue42electron = typeof window !== "undefined" && "glue42electron" in window;
        if (!hasGlue42electron) {
            return;
        }
        const runningInElectron = typeof process !== "undefined" && "contextIsolated" in process;
        if (runningInElectron) {
            const contextBridge = require("electron").contextBridge;
            contextBridge.exposeInMainWorld("fdc3", globalFdc3);
        }
    };
    const promisePlus = (promise, timeoutMilliseconds, timeoutMessage) => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const message = timeoutMessage || `Promise timeout hit: ${timeoutMilliseconds}`;
                reject(message);
            }, timeoutMilliseconds);
            promise()
                .then((result) => {
                clearTimeout(timeout);
                resolve(result);
            })
                .catch((error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    };
    const generateCommandId = () => {
        return nanoid();
    };

    var IntentHandlerResultTypes;
    (function (IntentHandlerResultTypes) {
        IntentHandlerResultTypes["Context"] = "Context";
        IntentHandlerResultTypes["Channel"] = "Channel";
    })(IntentHandlerResultTypes || (IntentHandlerResultTypes = {}));
    var ChannelTypes;
    (function (ChannelTypes) {
        ChannelTypes["User"] = "user";
        ChannelTypes["App"] = "app";
        ChannelTypes["Private"] = "private";
    })(ChannelTypes || (ChannelTypes = {}));
    const fdc3ChannelNames = ["fdc3.channel.1", "fdc3.channel.4", "fdc3.channel.6", "fdc3.channel.3", "fdc3.channel.2", "fdc3.channel.8", "fdc3.channel.7", "fdc3.channel.5"];
    const defaultChannelsProps = ["id", "type", "broadcast", "addContextListener", "getCurrentContext"];
    const defaultContextProps = ["type"];
    const defaultGlue42APIs = ["contexts", "channels", "interop", "intents", "appManager", "windows"];
    const responseInteropMethodPrefix = "T42.FDC3.Open.Listener.Response";
    const glueChannelNamePrefix = "___channel___";
    const fdc3NothingContextType = "fdc3.nothing";
    const Glue42EnterpriseNoAppWindow = "no-app-window";
    const RaiseTimeoutMs = 75 * 1000;
    const IntentsMethodPrefix = "Tick42.FDC3.Intents.";

    const Glue42FDC3SystemMethod = "T42.FDC3.Client.Control";
    const PrivateChannelPrefix = "___privateFDC3Channel___";
    var PrivateChannelEventMethods;
    (function (PrivateChannelEventMethods) {
        PrivateChannelEventMethods["OnAddContextListener"] = "onAddContextListener";
        PrivateChannelEventMethods["OnUnsubscribe"] = "onUnsubscribe";
        PrivateChannelEventMethods["OnDisconnect"] = "onDisconnect";
    })(PrivateChannelEventMethods || (PrivateChannelEventMethods = {}));

    /**
     * Wraps values in an `Ok` type.
     *
     * Example: `ok(5) // => {ok: true, result: 5}`
     */
    var ok = function (result) { return ({ ok: true, result: result }); };
    /**
     * Wraps errors in an `Err` type.
     *
     * Example: `err('on fire') // => {ok: false, error: 'on fire'}`
     */
    var err = function (error) { return ({ ok: false, error: error }); };
    /**
     * Create a `Promise` that either resolves with the result of `Ok` or rejects
     * with the error of `Err`.
     */
    var asPromise = function (r) {
        return r.ok === true ? Promise.resolve(r.result) : Promise.reject(r.error);
    };
    /**
     * Unwraps a `Result` and returns either the result of an `Ok`, or
     * `defaultValue`.
     *
     * Example:
     * ```
     * Result.withDefault(5, number().run(json))
     * ```
     *
     * It would be nice if `Decoder` had an instance method that mirrored this
     * function. Such a method would look something like this:
     * ```
     * class Decoder<A> {
     *   runWithDefault = (defaultValue: A, json: any): A =>
     *     Result.withDefault(defaultValue, this.run(json));
     * }
     *
     * number().runWithDefault(5, json)
     * ```
     * Unfortunately, the type of `defaultValue: A` on the method causes issues
     * with type inference on  the `object` decoder in some situations. While these
     * inference issues can be solved by providing the optional type argument for
     * `object`s, the extra trouble and confusion doesn't seem worth it.
     */
    var withDefault = function (defaultValue, r) {
        return r.ok === true ? r.result : defaultValue;
    };
    /**
     * Return the successful result, or throw an error.
     */
    var withException = function (r) {
        if (r.ok === true) {
            return r.result;
        }
        else {
            throw r.error;
        }
    };
    /**
     * Apply `f` to the result of an `Ok`, or pass the error through.
     */
    var map = function (f, r) {
        return r.ok === true ? ok(f(r.result)) : r;
    };
    /**
     * Apply `f` to the result of two `Ok`s, or pass an error through. If both
     * `Result`s are errors then the first one is returned.
     */
    var map2 = function (f, ar, br) {
        return ar.ok === false ? ar :
            br.ok === false ? br :
                ok(f(ar.result, br.result));
    };
    /**
     * Apply `f` to the error of an `Err`, or pass the success through.
     */
    var mapError = function (f, r) {
        return r.ok === true ? r : err(f(r.error));
    };
    /**
     * Chain together a sequence of computations that may fail, similar to a
     * `Promise`. If the first computation fails then the error will propagate
     * through. If it succeeds, then `f` will be applied to the value, returning a
     * new `Result`.
     */
    var andThen = function (f, r) {
        return r.ok === true ? f(r.result) : r;
    };

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */



    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (a === null && b === null) {
            return true;
        }
        if (typeof (a) !== typeof (b)) {
            return false;
        }
        if (typeof (a) === 'object') {
            // Array
            if (Array.isArray(a)) {
                if (!Array.isArray(b)) {
                    return false;
                }
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    if (!isEqual(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            }
            // Hash table
            var keys = Object.keys(a);
            if (keys.length !== Object.keys(b).length) {
                return false;
            }
            for (var i = 0; i < keys.length; i++) {
                if (!b.hasOwnProperty(keys[i])) {
                    return false;
                }
                if (!isEqual(a[keys[i]], b[keys[i]])) {
                    return false;
                }
            }
            return true;
        }
    }
    /*
     * Helpers
     */
    var isJsonArray = function (json) { return Array.isArray(json); };
    var isJsonObject = function (json) {
        return typeof json === 'object' && json !== null && !isJsonArray(json);
    };
    var typeString = function (json) {
        switch (typeof json) {
            case 'string':
                return 'a string';
            case 'number':
                return 'a number';
            case 'boolean':
                return 'a boolean';
            case 'undefined':
                return 'undefined';
            case 'object':
                if (json instanceof Array) {
                    return 'an array';
                }
                else if (json === null) {
                    return 'null';
                }
                else {
                    return 'an object';
                }
            default:
                return JSON.stringify(json);
        }
    };
    var expectedGot = function (expected, got) {
        return "expected " + expected + ", got " + typeString(got);
    };
    var printPath = function (paths) {
        return paths.map(function (path) { return (typeof path === 'string' ? "." + path : "[" + path + "]"); }).join('');
    };
    var prependAt = function (newAt, _a) {
        var at = _a.at, rest = __rest(_a, ["at"]);
        return (__assign({ at: newAt + (at || '') }, rest));
    };
    /**
     * Decoders transform json objects with unknown structure into known and
     * verified forms. You can create objects of type `Decoder<A>` with either the
     * primitive decoder functions, such as `boolean()` and `string()`, or by
     * applying higher-order decoders to the primitives, such as `array(boolean())`
     * or `dict(string())`.
     *
     * Each of the decoder functions are available both as a static method on
     * `Decoder` and as a function alias -- for example the string decoder is
     * defined at `Decoder.string()`, but is also aliased to `string()`. Using the
     * function aliases exported with the library is recommended.
     *
     * `Decoder` exposes a number of 'run' methods, which all decode json in the
     * same way, but communicate success and failure in different ways. The `map`
     * and `andThen` methods modify decoders without having to call a 'run' method.
     *
     * Alternatively, the main decoder `run()` method returns an object of type
     * `Result<A, DecoderError>`. This library provides a number of helper
     * functions for dealing with the `Result` type, so you can do all the same
     * things with a `Result` as with the decoder methods.
     */
    var Decoder = /** @class */ (function () {
        /**
         * The Decoder class constructor is kept private to separate the internal
         * `decode` function from the external `run` function. The distinction
         * between the two functions is that `decode` returns a
         * `Partial<DecoderError>` on failure, which contains an unfinished error
         * report. When `run` is called on a decoder, the relevant series of `decode`
         * calls is made, and then on failure the resulting `Partial<DecoderError>`
         * is turned into a `DecoderError` by filling in the missing information.
         *
         * While hiding the constructor may seem restrictive, leveraging the
         * provided decoder combinators and helper functions such as
         * `andThen` and `map` should be enough to build specialized decoders as
         * needed.
         */
        function Decoder(decode) {
            var _this = this;
            this.decode = decode;
            /**
             * Run the decoder and return a `Result` with either the decoded value or a
             * `DecoderError` containing the json input, the location of the error, and
             * the error message.
             *
             * Examples:
             * ```
             * number().run(12)
             * // => {ok: true, result: 12}
             *
             * string().run(9001)
             * // =>
             * // {
             * //   ok: false,
             * //   error: {
             * //     kind: 'DecoderError',
             * //     input: 9001,
             * //     at: 'input',
             * //     message: 'expected a string, got 9001'
             * //   }
             * // }
             * ```
             */
            this.run = function (json) {
                return mapError(function (error) { return ({
                    kind: 'DecoderError',
                    input: json,
                    at: 'input' + (error.at || ''),
                    message: error.message || ''
                }); }, _this.decode(json));
            };
            /**
             * Run the decoder as a `Promise`.
             */
            this.runPromise = function (json) { return asPromise(_this.run(json)); };
            /**
             * Run the decoder and return the value on success, or throw an exception
             * with a formatted error string.
             */
            this.runWithException = function (json) { return withException(_this.run(json)); };
            /**
             * Construct a new decoder that applies a transformation to the decoded
             * result. If the decoder succeeds then `f` will be applied to the value. If
             * it fails the error will propagated through.
             *
             * Example:
             * ```
             * number().map(x => x * 5).run(10)
             * // => {ok: true, result: 50}
             * ```
             */
            this.map = function (f) {
                return new Decoder(function (json) { return map(f, _this.decode(json)); });
            };
            /**
             * Chain together a sequence of decoders. The first decoder will run, and
             * then the function will determine what decoder to run second. If the result
             * of the first decoder succeeds then `f` will be applied to the decoded
             * value. If it fails the error will propagate through.
             *
             * This is a very powerful method -- it can act as both the `map` and `where`
             * methods, can improve error messages for edge cases, and can be used to
             * make a decoder for custom types.
             *
             * Example of adding an error message:
             * ```
             * const versionDecoder = valueAt(['version'], number());
             * const infoDecoder3 = object({a: boolean()});
             *
             * const decoder = versionDecoder.andThen(version => {
             *   switch (version) {
             *     case 3:
             *       return infoDecoder3;
             *     default:
             *       return fail(`Unable to decode info, version ${version} is not supported.`);
             *   }
             * });
             *
             * decoder.run({version: 3, a: true})
             * // => {ok: true, result: {a: true}}
             *
             * decoder.run({version: 5, x: 'abc'})
             * // =>
             * // {
             * //   ok: false,
             * //   error: {... message: 'Unable to decode info, version 5 is not supported.'}
             * // }
             * ```
             *
             * Example of decoding a custom type:
             * ```
             * // nominal type for arrays with a length of at least one
             * type NonEmptyArray<T> = T[] & { __nonEmptyArrayBrand__: void };
             *
             * const nonEmptyArrayDecoder = <T>(values: Decoder<T>): Decoder<NonEmptyArray<T>> =>
             *   array(values).andThen(arr =>
             *     arr.length > 0
             *       ? succeed(createNonEmptyArray(arr))
             *       : fail(`expected a non-empty array, got an empty array`)
             *   );
             * ```
             */
            this.andThen = function (f) {
                return new Decoder(function (json) {
                    return andThen(function (value) { return f(value).decode(json); }, _this.decode(json));
                });
            };
            /**
             * Add constraints to a decoder _without_ changing the resulting type. The
             * `test` argument is a predicate function which returns true for valid
             * inputs. When `test` fails on an input, the decoder fails with the given
             * `errorMessage`.
             *
             * ```
             * const chars = (length: number): Decoder<string> =>
             *   string().where(
             *     (s: string) => s.length === length,
             *     `expected a string of length ${length}`
             *   );
             *
             * chars(5).run('12345')
             * // => {ok: true, result: '12345'}
             *
             * chars(2).run('HELLO')
             * // => {ok: false, error: {... message: 'expected a string of length 2'}}
             *
             * chars(12).run(true)
             * // => {ok: false, error: {... message: 'expected a string, got a boolean'}}
             * ```
             */
            this.where = function (test, errorMessage) {
                return _this.andThen(function (value) { return (test(value) ? Decoder.succeed(value) : Decoder.fail(errorMessage)); });
            };
        }
        /**
         * Decoder primitive that validates strings, and fails on all other input.
         */
        Decoder.string = function () {
            return new Decoder(function (json) {
                return typeof json === 'string'
                    ? ok(json)
                    : err({ message: expectedGot('a string', json) });
            });
        };
        /**
         * Decoder primitive that validates numbers, and fails on all other input.
         */
        Decoder.number = function () {
            return new Decoder(function (json) {
                return typeof json === 'number'
                    ? ok(json)
                    : err({ message: expectedGot('a number', json) });
            });
        };
        /**
         * Decoder primitive that validates booleans, and fails on all other input.
         */
        Decoder.boolean = function () {
            return new Decoder(function (json) {
                return typeof json === 'boolean'
                    ? ok(json)
                    : err({ message: expectedGot('a boolean', json) });
            });
        };
        Decoder.constant = function (value) {
            return new Decoder(function (json) {
                return isEqual(json, value)
                    ? ok(value)
                    : err({ message: "expected " + JSON.stringify(value) + ", got " + JSON.stringify(json) });
            });
        };
        Decoder.object = function (decoders) {
            return new Decoder(function (json) {
                if (isJsonObject(json) && decoders) {
                    var obj = {};
                    for (var key in decoders) {
                        if (decoders.hasOwnProperty(key)) {
                            var r = decoders[key].decode(json[key]);
                            if (r.ok === true) {
                                // tslint:disable-next-line:strict-type-predicates
                                if (r.result !== undefined) {
                                    obj[key] = r.result;
                                }
                            }
                            else if (json[key] === undefined) {
                                return err({ message: "the key '" + key + "' is required but was not present" });
                            }
                            else {
                                return err(prependAt("." + key, r.error));
                            }
                        }
                    }
                    return ok(obj);
                }
                else if (isJsonObject(json)) {
                    return ok(json);
                }
                else {
                    return err({ message: expectedGot('an object', json) });
                }
            });
        };
        Decoder.array = function (decoder) {
            return new Decoder(function (json) {
                if (isJsonArray(json) && decoder) {
                    var decodeValue_1 = function (v, i) {
                        return mapError(function (err$$1) { return prependAt("[" + i + "]", err$$1); }, decoder.decode(v));
                    };
                    return json.reduce(function (acc, v, i) {
                        return map2(function (arr, result) { return arr.concat([result]); }, acc, decodeValue_1(v, i));
                    }, ok([]));
                }
                else if (isJsonArray(json)) {
                    return ok(json);
                }
                else {
                    return err({ message: expectedGot('an array', json) });
                }
            });
        };
        Decoder.tuple = function (decoders) {
            return new Decoder(function (json) {
                if (isJsonArray(json)) {
                    if (json.length !== decoders.length) {
                        return err({
                            message: "expected a tuple of length " + decoders.length + ", got one of length " + json.length
                        });
                    }
                    var result = [];
                    for (var i = 0; i < decoders.length; i++) {
                        var nth = decoders[i].decode(json[i]);
                        if (nth.ok) {
                            result[i] = nth.result;
                        }
                        else {
                            return err(prependAt("[" + i + "]", nth.error));
                        }
                    }
                    return ok(result);
                }
                else {
                    return err({ message: expectedGot("a tuple of length " + decoders.length, json) });
                }
            });
        };
        Decoder.union = function (ad, bd) {
            var decoders = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                decoders[_i - 2] = arguments[_i];
            }
            return Decoder.oneOf.apply(Decoder, [ad, bd].concat(decoders));
        };
        Decoder.intersection = function (ad, bd) {
            var ds = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                ds[_i - 2] = arguments[_i];
            }
            return new Decoder(function (json) {
                return [ad, bd].concat(ds).reduce(function (acc, decoder) { return map2(Object.assign, acc, decoder.decode(json)); }, ok({}));
            });
        };
        /**
         * Escape hatch to bypass validation. Always succeeds and types the result as
         * `any`. Useful for defining decoders incrementally, particularly for
         * complex objects.
         *
         * Example:
         * ```
         * interface User {
         *   name: string;
         *   complexUserData: ComplexType;
         * }
         *
         * const userDecoder: Decoder<User> = object({
         *   name: string(),
         *   complexUserData: anyJson()
         * });
         * ```
         */
        Decoder.anyJson = function () { return new Decoder(function (json) { return ok(json); }); };
        /**
         * Decoder identity function which always succeeds and types the result as
         * `unknown`.
         */
        Decoder.unknownJson = function () {
            return new Decoder(function (json) { return ok(json); });
        };
        /**
         * Decoder for json objects where the keys are unknown strings, but the values
         * should all be of the same type.
         *
         * Example:
         * ```
         * dict(number()).run({chocolate: 12, vanilla: 10, mint: 37});
         * // => {ok: true, result: {chocolate: 12, vanilla: 10, mint: 37}}
         * ```
         */
        Decoder.dict = function (decoder) {
            return new Decoder(function (json) {
                if (isJsonObject(json)) {
                    var obj = {};
                    for (var key in json) {
                        if (json.hasOwnProperty(key)) {
                            var r = decoder.decode(json[key]);
                            if (r.ok === true) {
                                obj[key] = r.result;
                            }
                            else {
                                return err(prependAt("." + key, r.error));
                            }
                        }
                    }
                    return ok(obj);
                }
                else {
                    return err({ message: expectedGot('an object', json) });
                }
            });
        };
        /**
         * Decoder for values that may be `undefined`. This is primarily helpful for
         * decoding interfaces with optional fields.
         *
         * Example:
         * ```
         * interface User {
         *   id: number;
         *   isOwner?: boolean;
         * }
         *
         * const decoder: Decoder<User> = object({
         *   id: number(),
         *   isOwner: optional(boolean())
         * });
         * ```
         */
        Decoder.optional = function (decoder) {
            return new Decoder(function (json) { return (json === undefined || json === null ? ok(undefined) : decoder.decode(json)); });
        };
        /**
         * Decoder that attempts to run each decoder in `decoders` and either succeeds
         * with the first successful decoder, or fails after all decoders have failed.
         *
         * Note that `oneOf` expects the decoders to all have the same return type,
         * while `union` creates a decoder for the union type of all the input
         * decoders.
         *
         * Examples:
         * ```
         * oneOf(string(), number().map(String))
         * oneOf(constant('start'), constant('stop'), succeed('unknown'))
         * ```
         */
        Decoder.oneOf = function () {
            var decoders = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                decoders[_i] = arguments[_i];
            }
            return new Decoder(function (json) {
                var errors = [];
                for (var i = 0; i < decoders.length; i++) {
                    var r = decoders[i].decode(json);
                    if (r.ok === true) {
                        return r;
                    }
                    else {
                        errors[i] = r.error;
                    }
                }
                var errorsList = errors
                    .map(function (error) { return "at error" + (error.at || '') + ": " + error.message; })
                    .join('", "');
                return err({
                    message: "expected a value matching one of the decoders, got the errors [\"" + errorsList + "\"]"
                });
            });
        };
        /**
         * Decoder that always succeeds with either the decoded value, or a fallback
         * default value.
         */
        Decoder.withDefault = function (defaultValue, decoder) {
            return new Decoder(function (json) {
                return ok(withDefault(defaultValue, decoder.decode(json)));
            });
        };
        /**
         * Decoder that pulls a specific field out of a json structure, instead of
         * decoding and returning the full structure. The `paths` array describes the
         * object keys and array indices to traverse, so that values can be pulled out
         * of a nested structure.
         *
         * Example:
         * ```
         * const decoder = valueAt(['a', 'b', 0], string());
         *
         * decoder.run({a: {b: ['surprise!']}})
         * // => {ok: true, result: 'surprise!'}
         *
         * decoder.run({a: {x: 'cats'}})
         * // => {ok: false, error: {... at: 'input.a.b[0]' message: 'path does not exist'}}
         * ```
         *
         * Note that the `decoder` is ran on the value found at the last key in the
         * path, even if the last key is not found. This allows the `optional`
         * decoder to succeed when appropriate.
         * ```
         * const optionalDecoder = valueAt(['a', 'b', 'c'], optional(string()));
         *
         * optionalDecoder.run({a: {b: {c: 'surprise!'}}})
         * // => {ok: true, result: 'surprise!'}
         *
         * optionalDecoder.run({a: {b: 'cats'}})
         * // => {ok: false, error: {... at: 'input.a.b.c' message: 'expected an object, got "cats"'}
         *
         * optionalDecoder.run({a: {b: {z: 1}}})
         * // => {ok: true, result: undefined}
         * ```
         */
        Decoder.valueAt = function (paths, decoder) {
            return new Decoder(function (json) {
                var jsonAtPath = json;
                for (var i = 0; i < paths.length; i++) {
                    if (jsonAtPath === undefined) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: 'path does not exist'
                        });
                    }
                    else if (typeof paths[i] === 'string' && !isJsonObject(jsonAtPath)) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: expectedGot('an object', jsonAtPath)
                        });
                    }
                    else if (typeof paths[i] === 'number' && !isJsonArray(jsonAtPath)) {
                        return err({
                            at: printPath(paths.slice(0, i + 1)),
                            message: expectedGot('an array', jsonAtPath)
                        });
                    }
                    else {
                        jsonAtPath = jsonAtPath[paths[i]];
                    }
                }
                return mapError(function (error) {
                    return jsonAtPath === undefined
                        ? { at: printPath(paths), message: 'path does not exist' }
                        : prependAt(printPath(paths), error);
                }, decoder.decode(jsonAtPath));
            });
        };
        /**
         * Decoder that ignores the input json and always succeeds with `fixedValue`.
         */
        Decoder.succeed = function (fixedValue) {
            return new Decoder(function (json) { return ok(fixedValue); });
        };
        /**
         * Decoder that ignores the input json and always fails with `errorMessage`.
         */
        Decoder.fail = function (errorMessage) {
            return new Decoder(function (json) { return err({ message: errorMessage }); });
        };
        /**
         * Decoder that allows for validating recursive data structures. Unlike with
         * functions, decoders assigned to variables can't reference themselves
         * before they are fully defined. We can avoid prematurely referencing the
         * decoder by wrapping it in a function that won't be called until use, at
         * which point the decoder has been defined.
         *
         * Example:
         * ```
         * interface Comment {
         *   msg: string;
         *   replies: Comment[];
         * }
         *
         * const decoder: Decoder<Comment> = object({
         *   msg: string(),
         *   replies: lazy(() => array(decoder))
         * });
         * ```
         */
        Decoder.lazy = function (mkDecoder) {
            return new Decoder(function (json) { return mkDecoder().decode(json); });
        };
        return Decoder;
    }());

    /* tslint:disable:variable-name */
    /** See `Decoder.string` */
    var string = Decoder.string;
    /** See `Decoder.number` */
    var number = Decoder.number;
    /** See `Decoder.boolean` */
    var boolean = Decoder.boolean;
    /** See `Decoder.anyJson` */
    var anyJson = Decoder.anyJson;
    /** See `Decoder.unknownJson` */
    Decoder.unknownJson;
    /** See `Decoder.constant` */
    var constant = Decoder.constant;
    /** See `Decoder.object` */
    var object = Decoder.object;
    /** See `Decoder.array` */
    var array = Decoder.array;
    /** See `Decoder.tuple` */
    Decoder.tuple;
    /** See `Decoder.dict` */
    Decoder.dict;
    /** See `Decoder.optional` */
    var optional = Decoder.optional;
    /** See `Decoder.oneOf` */
    var oneOf = Decoder.oneOf;
    /** See `Decoder.union` */
    Decoder.union;
    /** See `Decoder.intersection` */
    Decoder.intersection;
    /** See `Decoder.withDefault` */
    Decoder.withDefault;
    /** See `Decoder.valueAt` */
    Decoder.valueAt;
    /** See `Decoder.succeed` */
    Decoder.succeed;
    /** See `Decoder.fail` */
    Decoder.fail;
    /** See `Decoder.lazy` */
    Decoder.lazy;

    const nonEmptyStringDecoder = string().where((s) => s.length > 0, "Expected a non-empty string");
    number().where((num) => num >= 0, "Expected a non-negative number");
    const iconDecoder = object({
        src: nonEmptyStringDecoder,
        size: optional(string()),
        type: optional(string())
    });
    const imageDecoder = object({
        src: nonEmptyStringDecoder,
        size: optional(string()),
        type: optional(string()),
        label: optional(string())
    });
    object({
        appId: nonEmptyStringDecoder,
        instanceId: optional(string()),
        name: optional(string()),
        version: optional(string()),
        title: optional(string()),
        tooltip: optional(string()),
        description: optional(string()),
        icons: optional(array(iconDecoder)),
        images: optional(array(imageDecoder)),
    });
    const appIdentifierDecoder = object({
        appId: nonEmptyStringDecoder,
        instanceId: optional(string())
    });
    const targetAppDecoder = oneOf(nonEmptyStringDecoder, appIdentifierDecoder);
    const contextDecoder = object({
        type: nonEmptyStringDecoder,
        name: optional(nonEmptyStringDecoder),
        id: optional(anyJson()),
    });
    const optionalContextDecoder = optional(contextDecoder);
    const optionalTargetApp = optional(appIdentifierDecoder);
    const optionalAppIdentifier = optional(targetAppDecoder);
    const optionalNonEmptyStringDecoder = optional(nonEmptyStringDecoder);
    const SystemMethodActionDecider = oneOf(constant(PrivateChannelEventMethods.OnAddContextListener), constant(PrivateChannelEventMethods.OnUnsubscribe), constant(PrivateChannelEventMethods.OnDisconnect));
    const SystemMethodEventPayloadDecoder = object({
        channelId: nonEmptyStringDecoder,
        clientId: nonEmptyStringDecoder,
        contextType: optional(string()),
        replayContextTypes: optional(array(string()))
    });
    const SystemMethodInvocationArgumentDecoder = object({
        action: SystemMethodActionDecider,
        payload: SystemMethodEventPayloadDecoder
    });
    const ContextListenerResponseDecoder = object({
        listenerInvoked: optional(boolean())
    });
    object({
        meta: object({
            responseMethodName: nonEmptyStringDecoder
        }),
        context: contextDecoder
    });

    class GlueController {
        constructor(channelsParser) {
            this.channelsParser = channelsParser;
            this.defaultGluePromiseTimeout = 120000;
        }
        get gluePromise() {
            return this.glueInitPromise.then(this.initializeLogger.bind(this));
        }
        initialize(glue) {
            this.glue = glue;
            this.resolveGluePromise();
        }
        initializeFailed(reason) {
            this.rejectGluePromise(reason);
        }
        createGluePromise() {
            this.glueInitPromise = promisePlus(() => {
                return new Promise((resolve, reject) => {
                    this.resolveGluePromise = resolve;
                    this.rejectGluePromise = reject;
                });
            }, this.defaultGluePromiseTimeout, `Timeout of ${this.defaultGluePromiseTimeout}ms waiting for Glue to initialize`);
        }
        get logger() {
            return this._logger;
        }
        validateGlue(glue) {
            if (typeof glue !== "object" || Array.isArray(glue)) {
                return { isValid: false, error: { message: "Glue is not a valid object" } };
            }
            const apisToValidate = Object.keys(glue);
            const missingApis = defaultGlue42APIs.filter((api) => !apisToValidate.includes(api));
            if (missingApis.length) {
                return { isValid: false, error: { message: `Fdc3 cannot initialize correctly - Glue is missing the following ${missingApis.length > 1 ? "properties" : "property"}: ${missingApis.join(", ")}` } };
            }
            return { isValid: true };
        }
        interopInstance() {
            return this.glue.interop.instance;
        }
        getApplication(name) {
            return this.glue.appManager.application(name);
        }
        getApplicationInstances(appName) {
            return this.glue.appManager.instances().filter(inst => inst.application.name === appName);
        }
        getAppInstanceById(id) {
            return this.glue.appManager.instances().find(inst => inst.id === id);
        }
        findIntents(intentFilter) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.intents.find(intentFilter);
            });
        }
        raiseIntent(request) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.intents.raise(request);
            });
        }
        addIntentListener(intent, handler) {
            const registerMethodExists = this.glue.intents.register;
            return registerMethodExists
                ? this.glue.intents.register(intent, handler)
                : this.glue.intents.addIntentListener(intent, handler);
        }
        getAllContexts() {
            return this.glue.contexts.all();
        }
        getContext(contextId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.contexts.get(contextId);
            });
        }
        updateContext(contextId, data) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.contexts.update(contextId, data);
            });
        }
        updateContextWithLatestFdc3Type(contextId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                const prevContextData = yield this.getContext(contextId);
                if (!isValidNonEmptyObject(prevContextData)) {
                    return this.updateContext(contextId, {
                        data: this.channelsParser.parseFDC3ContextToGlueContexts(context),
                        latest_fdc3_type: this.channelsParser.mapFDC3TypeToChannelsDelimiter(context.type)
                    });
                }
                return this.updateContext(contextId, Object.assign(Object.assign({}, prevContextData), { data: Object.assign(Object.assign({}, prevContextData.data), this.channelsParser.parseFDC3ContextToGlueContexts(context)), latest_fdc3_type: this.channelsParser.mapFDC3TypeToChannelsDelimiter(context.type) }));
            });
        }
        channelsUpdate(channelId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                const parsedData = this.channelsParser.parseFDC3ContextToGlueContexts(context);
                return this.glue.channels.publish(parsedData, channelId);
            });
        }
        joinChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.join(channelId);
            });
        }
        leaveChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.leave();
            });
        }
        getCurrentChannel() {
            return this.glue.channels.my();
        }
        setOnChannelChanged(callback) {
            return this.glue.channels.changed(callback);
        }
        getAllChannels() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.all();
            });
        }
        listAllChannels() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.list();
            });
        }
        getChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.channels.get(channelId);
            });
        }
        getMyWindow() {
            const win = this.glue.windows.my();
            return isValidNonEmptyObject(win) ? win : undefined;
        }
        getMyInteropInstanceId() {
            return this.glue.interop.instance.instance;
        }
        getGlueVersion() {
            var _a;
            return (_a = this.glue) === null || _a === void 0 ? void 0 : _a.version;
        }
        registerOnInstanceStopped(cb) {
            return this.glue.appManager.onInstanceStopped(cb);
        }
        invokeMethod(methodName, instance, argumentObj) {
            return __awaiter(this, void 0, void 0, function* () {
                const args = ContextListenerResponseDecoder.runWithException(argumentObj);
                return this.glue.interop.invoke(methodName, args, { instance });
            });
        }
        unregisterMethod(methodName) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.glue.interop.unregister(methodName);
            });
        }
        invokeSystemMethod(argumentObj) {
            const args = SystemMethodInvocationArgumentDecoder.runWithException(argumentObj);
            const target = args.payload.clientId;
            return this.glue.interop.invoke(Glue42FDC3SystemMethod, args, { instance: target });
        }
        registerMethod(name, handler) {
            return this.glue.interop.register(name, handler);
        }
        getInteropMethods(filter) {
            return this.glue.interop.methods(filter);
        }
        channelsSubscribe(callback) {
            const didReplay = { replayed: false };
            return this.glue.channels.subscribe((_, context, updaterId) => __awaiter(this, void 0, void 0, function* () {
                if (this.isUpdateFromMe(updaterId) || !context) {
                    return;
                }
                const contextData = yield this.glue.contexts.get(`${glueChannelNamePrefix}${context.name}`);
                if (!contextData.latest_fdc3_type) {
                    return;
                }
                if (!didReplay.replayed) {
                    this.invokePreviouslyBroadcastedData(callback, contextData, this.getContextMetadata(updaterId));
                    didReplay.replayed = true;
                    return;
                }
                this.parseDataAndInvokeSubscribeCallback(callback, contextData, this.getContextMetadata(updaterId));
            }));
        }
        channelsSubscribeFor(name, callback) {
            const didReplay = { replayed: false };
            return this.glue.channels.subscribeFor(name, (_, context, updaterId) => __awaiter(this, void 0, void 0, function* () {
                if (this.isUpdateFromMe(updaterId) || !context) {
                    return;
                }
                const contextData = yield this.glue.contexts.get(`${glueChannelNamePrefix}${context.name}`);
                if (!contextData.latest_fdc3_type) {
                    return;
                }
                if (!didReplay.replayed) {
                    this.invokePreviouslyBroadcastedData(callback, contextData, this.getContextMetadata(updaterId));
                    didReplay.replayed = true;
                    return;
                }
                this.parseDataAndInvokeSubscribeCallback(callback, contextData, this.getContextMetadata(updaterId));
            }));
        }
        contextsSubscribe(contextName, callback) {
            const didReplay = { replayed: false };
            return this.glue.contexts.subscribe(contextName, (contextData, addedData, removed, _, extraData) => {
                if (this.isUpdateFromMe(extraData === null || extraData === void 0 ? void 0 : extraData.updaterId)) {
                    return;
                }
                if (!this.checkIfAppChannelShouldInvokeInitialReplay(didReplay, contextData)) {
                    return;
                }
                this.parseDataAndInvokeSubscribeCallback(callback, contextData, this.getContextMetadata(extraData === null || extraData === void 0 ? void 0 : extraData.updaterId));
            });
        }
        getInteropServers(methodFilter) {
            return this.glue.interop.servers(methodFilter);
        }
        initSubLogger(name) {
            return this.logger.subLogger(name);
        }
        invokePreviouslyBroadcastedData(callback, contextData, metadata) {
            Object.entries(contextData.data).forEach(([key, value]) => {
                if (!this.channelsParser.isFdc3DataKey(key)) {
                    return;
                }
                const parsedData = Object.assign({ type: this.channelsParser.revertGlueParsedTypeToInitialFDC3Type(key) }, value);
                callback(parsedData, metadata);
            });
        }
        isUpdateFromMe(updaterId) {
            return this.glue.interop.instance.peerId === updaterId;
        }
        getContextMetadata(updaterId) {
            const instanceServer = this.glue.interop.servers().find((server) => server.peerId === updaterId);
            if (!instanceServer) {
                return;
            }
            return {
                source: {
                    appId: instanceServer.applicationName,
                    instanceId: instanceServer.instance
                }
            };
        }
        initializeLogger() {
            this._logger = this.glue.logger;
        }
        parseDataAndInvokeSubscribeCallback(callback, data, metadata) {
            const parsedData = this.channelsParser.parseContextsDataToInitialFDC3Data(data);
            callback(parsedData, metadata);
        }
        checkIfAppChannelShouldInvokeInitialReplay(didReplay, contextData) {
            if (!didReplay.replayed) {
                didReplay.replayed = true;
                return false;
            }
            if (!contextData.latest_fdc3_type) {
                return false;
            }
            return true;
        }
    }

    const GLUE42_EVENT_NAME = "Glue42";
    const START = "start";
    const NOTIFY_STARTED = "notifyStarted";
    const REQUEST_GLUE = "requestGlue";
    const REQUEST_GLUE_RESPONSE = "requestGlueResponse";
    const FDC3_READY = "fdc3Ready";

    class EventDispatcher {
        fireFdc3Ready() {
            const event = new Event(FDC3_READY);
            window.dispatchEvent(event);
        }
        fireNotifyStarted() {
            this.send(NOTIFY_STARTED);
        }
        fireRequestGlue() {
            this.send(REQUEST_GLUE);
        }
        send(eventName, message) {
            const payload = { glue42: { event: eventName, message } };
            const event = new CustomEvent(GLUE42_EVENT_NAME, { detail: payload });
            window.dispatchEvent(event);
        }
    }

    class DesktopAgent {
        constructor(intentsController, applicationController, channelsController) {
            this.intentsController = intentsController;
            this.applicationController = applicationController;
            this.channelsController = channelsController;
        }
        toApi() {
            const api = {
                addContextListener: this.addContextListener.bind(this),
                addIntentListener: this.addIntentListener.bind(this),
                broadcast: this.broadcast.bind(this),
                createPrivateChannel: this.createPrivateChannel.bind(this),
                findInstances: this.findInstances.bind(this),
                findIntent: this.findIntent.bind(this),
                findIntentsByContext: this.findIntentsByContext.bind(this),
                getAppMetadata: this.getAppMetadata.bind(this),
                getCurrentChannel: this.getCurrentChannel.bind(this),
                getInfo: this.getInfo.bind(this),
                getOrCreateChannel: this.getOrCreateChannel.bind(this),
                getSystemChannels: this.getSystemChannels.bind(this),
                getUserChannels: this.getSystemChannels.bind(this),
                joinChannel: this.joinChannel.bind(this),
                joinUserChannel: this.joinUserChannel.bind(this),
                leaveCurrentChannel: this.leaveCurrentChannel.bind(this),
                open: this.open.bind(this),
                raiseIntent: this.raiseIntent.bind(this),
                raiseIntentForContext: this.raiseIntentForContext.bind(this),
            };
            return Object.freeze(api);
        }
        open(target, context) {
            return __awaiter(this, void 0, void 0, function* () {
                targetAppDecoder.runWithException(target);
                optionalContextDecoder.runWithException(context);
                return this.applicationController.open({ commandId: generateCommandId(), target, context });
            });
        }
        findInstances(app) {
            return __awaiter(this, void 0, void 0, function* () {
                appIdentifierDecoder.runWithException(app);
                return this.applicationController.findInstances({ commandId: generateCommandId(), appIdentifier: app });
            });
        }
        getAppMetadata(app) {
            return __awaiter(this, void 0, void 0, function* () {
                appIdentifierDecoder.runWithException(app);
                return this.applicationController.getAppMetadata({ commandId: generateCommandId(), appIdentifier: app });
            });
        }
        getInfo() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.applicationController.getInfo({ commandId: generateCommandId() });
            });
        }
        broadcast(context) {
            return __awaiter(this, void 0, void 0, function* () {
                contextDecoder.runWithException(context);
                return this.channelsController.broadcast(generateCommandId(), context);
            });
        }
        addContextListener(contextType, handler) {
            return __awaiter(this, arguments, void 0, function* () {
                if (arguments.length === 1) {
                    if (typeof contextType !== "function") {
                        throw new Error("Please provide the handler as a function!");
                    }
                    return this.channelsController.addContextListener({ commandId: generateCommandId(), handler: contextType });
                }
                const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);
                if (typeof handler !== "function") {
                    throw new Error("Please provide the handler as a function!");
                }
                return this.channelsController.addContextListener({ commandId: generateCommandId(), handler, contextType: contextTypeDecoder });
            });
        }
        findIntent(intent, context, resultType) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(intent);
                const contextDecoderResult = optionalContextDecoder.run(context);
                if (!contextDecoderResult.ok) {
                    throw new Error(`Invalid Context: ${contextDecoderResult.error}`);
                }
                optionalNonEmptyStringDecoder.runWithException(resultType);
                return this.intentsController.findIntent({ commandId: generateCommandId(), intent, context: contextDecoderResult.result, resultType });
            });
        }
        findIntentsByContext(context, resultType) {
            return __awaiter(this, void 0, void 0, function* () {
                const contextDecoderResult = contextDecoder.run(context);
                if (!contextDecoderResult.ok) {
                    throw new Error(`Invalid Context: ${contextDecoderResult.error}`);
                }
                optionalNonEmptyStringDecoder.runWithException(resultType);
                return this.intentsController.findIntentsByContext({ commandId: generateCommandId(), context: contextDecoderResult.result, resultType });
            });
        }
        raiseIntent(intent, context, app) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(intent);
                contextDecoder.runWithException(context);
                optionalAppIdentifier.runWithException(app);
                return this.intentsController.raiseIntent({ commandId: generateCommandId(), intent, context, target: app });
            });
        }
        raiseIntentForContext(context, app) {
            return __awaiter(this, void 0, void 0, function* () {
                contextDecoder.runWithException(context);
                optionalTargetApp.runWithException(app);
                return this.intentsController.raiseIntentForContext({ commandId: generateCommandId(), context, target: app });
            });
        }
        addIntentListener(intent, handler) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(intent);
                if (typeof handler !== "function") {
                    throw new Error("Please provide the handler as a function!");
                }
                return this.intentsController.addIntentListener({ commandId: generateCommandId(), intent, handler });
            });
        }
        getOrCreateChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(channelId);
                return this.channelsController.getOrCreateChannel({ commandId: generateCommandId(), channelId });
            });
        }
        getSystemChannels() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.channelsController.getUserChannels(generateCommandId());
            });
        }
        joinChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(channelId);
                return this.channelsController.joinUserChannel({ commandId: generateCommandId(), channelId });
            });
        }
        joinUserChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.runWithException(channelId);
                return this.channelsController.joinUserChannel({ commandId: generateCommandId(), channelId });
            });
        }
        getCurrentChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.channelsController.getCurrentChannel(generateCommandId());
            });
        }
        leaveCurrentChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.channelsController.leaveCurrentChannel(generateCommandId());
            });
        }
        createPrivateChannel() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.channelsController.createPrivateChannel(generateCommandId());
            });
        }
    }

    class AppChannel {
        constructor(channelsController, id) {
            this.channelsController = channelsController;
            this.id = id;
            this.type = ChannelTypes.App;
        }
        toApi() {
            const api = {
                id: this.id,
                type: this.type,
                broadcast: this.broadcast.bind(this),
                getCurrentContext: this.getCurrentContext.bind(this),
                addContextListener: this.addContextListener.bind(this),
            };
            return api;
        }
        broadcast(context) {
            return __awaiter(this, void 0, void 0, function* () {
                contextDecoder.runWithException(context);
                return this.channelsController.broadcast(generateCommandId(), context, this.id);
            });
        }
        getCurrentContext(contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                optionalNonEmptyStringDecoder.runWithException(contextType);
                return this.channelsController.getContextForChannel({ commandId: generateCommandId(), channelId: this.id, contextType });
            });
        }
        addContextListener(contextType, handler) {
            return __awaiter(this, arguments, void 0, function* () {
                if (arguments.length === 1) {
                    if (typeof contextType !== "function") {
                        throw new Error("Please provide the handler as a function!");
                    }
                    return this.channelsController.addContextListener({ commandId: generateCommandId(), handler: contextType, channelId: this.id });
                }
                const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);
                if (typeof handler !== "function") {
                    throw new Error("Please provide the handler as a function!");
                }
                return this.channelsController.addContextListener({ commandId: generateCommandId(), handler, contextType: contextTypeDecoder, channelId: this.id });
            });
        }
    }

    class ChannelsParser {
        constructor() {
            this.fdc3Delimiter = "&";
            this.channelsFdc3DataPrefix = "fdc3_";
        }
        mapChannelNameToContextName(channelName) {
            return `${glueChannelNamePrefix}${channelName}`;
        }
        parseContextsDataToInitialFDC3Data(context) {
            const { data, latest_fdc3_type } = context;
            const parsedType = this.mapChannelsDelimiterToFDC3Type(latest_fdc3_type);
            return Object.assign({ type: parsedType }, data[`${this.channelsFdc3DataPrefix}${latest_fdc3_type}`]);
        }
        revertGlueParsedTypeToInitialFDC3Type(string) {
            const withoutPrefix = string.replace(this.channelsFdc3DataPrefix, "");
            return this.mapChannelsDelimiterToFDC3Type(withoutPrefix);
        }
        parseFDC3ContextToGlueContexts(context) {
            const { type } = context, rest = __rest$1(context, ["type"]);
            const parsedType = this.mapFDC3TypeToChannelsDelimiter(type);
            return { [`${this.channelsFdc3DataPrefix}${parsedType}`]: rest };
        }
        mapFDC3TypeToChannelsDelimiter(type) {
            return type.split(".").join(this.fdc3Delimiter);
        }
        isFdc3DataKey(key) {
            return !!key.startsWith(this.channelsFdc3DataPrefix);
        }
        mapChannelsDelimiterToFDC3Type(type) {
            return type.split(this.fdc3Delimiter).join(".");
        }
    }

    /**
     * SPDX-License-Identifier: Apache-2.0
     * Copyright FINOS FDC3 contributors - see NOTICE file
     */

    /** Constants representing the errors that can be encountered when calling the `open` method on the DesktopAgent object (`fdc3`). */
    var OpenError;

    (function (OpenError) {
      /** Returned if the specified application is not found.*/
      OpenError["AppNotFound"] = "AppNotFound";
      /** Returned if the specified application fails to launch correctly.*/

      OpenError["ErrorOnLaunch"] = "ErrorOnLaunch";
      /** Returned if the specified application launches but fails to add a context listener in order to receive the context passed to the `fdc3.open` call.*/

      OpenError["AppTimeout"] = "AppTimeout";
      /** Returned if the FDC3 desktop agent implementation is not currently able to handle the request.*/

      OpenError["ResolverUnavailable"] = "ResolverUnavailable";
    })(OpenError || (OpenError = {}));
    /** Constants representing the errors that can be encountered when calling the `findIntent`, `findIntentsByContext`, `raiseIntent` or `raiseIntentForContext` methods on the DesktopAgent (`fdc3`). */


    var ResolveError;

    (function (ResolveError) {
      /** SHOULD be returned if no apps are available that can resolve the intent and context combination.*/
      ResolveError["NoAppsFound"] = "NoAppsFound";
      /** Returned if the FDC3 desktop agent implementation is not currently able to handle the request.*/

      ResolveError["ResolverUnavailable"] = "ResolverUnavailable";
      /** Returned if the user cancelled the resolution request, for example by closing or cancelling a resolver UI.*/

      ResolveError["UserCancelled"] = "UserCancelledResolution";
      /** SHOULD be returned if a timeout cancels an intent resolution that required user interaction. Please use `ResolverUnavailable` instead for situations where a resolver UI or similar fails.*/

      ResolveError["ResolverTimeout"] = "ResolverTimeout";
      /** Returned if a specified target application is not available or a new instance of it cannot be opened. */

      ResolveError["TargetAppUnavailable"] = "TargetAppUnavailable";
      /** Returned if a specified target application instance is not available, for example because it has been closed. */

      ResolveError["TargetInstanceUnavailable"] = "TargetInstanceUnavailable";
      /** Returned if the intent and context could not be delivered to the selected application or instance, for example because it has not added an intent handler within a timeout.*/

      ResolveError["IntentDeliveryFailed"] = "IntentDeliveryFailed";
    })(ResolveError || (ResolveError = {}));

    var ResultError;

    (function (ResultError) {
      /** Returned if the intent handler exited without returning a Promise or that Promise was not resolved with a Context or Channel object. */
      ResultError["NoResultReturned"] = "NoResultReturned";
      /** Returned if the Intent handler function processing the raised intent throws an error or rejects the Promise it returned. */

      ResultError["IntentHandlerRejected"] = "IntentHandlerRejected";
    })(ResultError || (ResultError = {}));

    var ChannelError;

    (function (ChannelError) {
      /** Returned if the specified channel is not found when attempting to join a channel via the `joinUserChannel` function  of the DesktopAgent (`fdc3`).*/
      ChannelError["NoChannelFound"] = "NoChannelFound";
      /** SHOULD be returned when a request to join a user channel or to a retrieve a Channel object via the `joinUserChannel` or `getOrCreateChannel` methods of the DesktopAgent (`fdc3`) object is denied. */

      ChannelError["AccessDenied"] = "AccessDenied";
      /** SHOULD be returned when a channel cannot be created or retrieved via the `getOrCreateChannel` method of the DesktopAgent (`fdc3`).*/

      ChannelError["CreationFailed"] = "CreationFailed";
    })(ChannelError || (ChannelError = {}));

    var ContextTypes;

    (function (ContextTypes) {
      ContextTypes["Chart"] = "fdc3.chart";
      ContextTypes["ChatInitSettings"] = "fdc3.chat.initSettings";
      ContextTypes["Contact"] = "fdc3.contact";
      ContextTypes["ContactList"] = "fdc3.contactList";
      ContextTypes["Country"] = "fdc3.country";
      ContextTypes["Currency"] = "fdc3.currency";
      ContextTypes["Email"] = "fdc3.email";
      ContextTypes["Instrument"] = "fdc3.instrument";
      ContextTypes["InstrumentList"] = "fdc3.instrumentList";
      ContextTypes["Organization"] = "fdc3.organization";
      ContextTypes["Portfolio"] = "fdc3.portfolio";
      ContextTypes["Position"] = "fdc3.position";
      ContextTypes["Nothing"] = "fdc3.nothing";
      ContextTypes["TimeRange"] = "fdc3.timerange";
      ContextTypes["Valuation"] = "fdc3.valuation";
    })(ContextTypes || (ContextTypes = {}));

    // To parse this data:
    //
    //   import { Convert, Context, Chart, ChatInitSettings, Contact, ContactList, Country, Currency, Email, Instrument, InstrumentList, Nothing, Organization, Portfolio, Position, TimeRange, Valuation } from "./file";
    //
    //   const context = Convert.toContext(json);
    //   const chart = Convert.toChart(json);
    //   const chatInitSettings = Convert.toChatInitSettings(json);
    //   const contact = Convert.toContact(json);
    //   const contactList = Convert.toContactList(json);
    //   const country = Convert.toCountry(json);
    //   const currency = Convert.toCurrency(json);
    //   const email = Convert.toEmail(json);
    //   const instrument = Convert.toInstrument(json);
    //   const instrumentList = Convert.toInstrumentList(json);
    //   const nothing = Convert.toNothing(json);
    //   const organization = Convert.toOrganization(json);
    //   const portfolio = Convert.toPortfolio(json);
    //   const position = Convert.toPosition(json);
    //   const timeRange = Convert.toTimeRange(json);
    //   const valuation = Convert.toValuation(json);
    //
    // These functions will throw an error if the JSON doesn't
    // match the expected interface, even if the JSON is valid.
    var Style;

    (function (Style) {
      Style["Bar"] = "bar";
      Style["Candle"] = "candle";
      Style["Custom"] = "custom";
      Style["Heatmap"] = "heatmap";
      Style["Histogram"] = "histogram";
      Style["Line"] = "line";
      Style["Mountain"] = "mountain";
      Style["Pie"] = "pie";
      Style["Scatter"] = "scatter";
      Style["StackedBar"] = "stacked-bar";
    })(Style || (Style = {})); // Converts JSON strings to/from your types

    var Intents;

    (function (Intents) {
      Intents["StartCall"] = "StartCall";
      Intents["StartChat"] = "StartChat";
      Intents["StartEmail"] = "StartEmail";
      Intents["ViewAnalysis"] = "ViewAnalysis";
      Intents["ViewChart"] = "ViewChart";
      Intents["ViewContact"] = "ViewContact";
      Intents["ViewHoldings"] = "ViewHoldings";
      Intents["ViewInstrument"] = "ViewInstrument";
      Intents["ViewInteractions"] = "ViewInteractions";
      Intents["ViewNews"] = "ViewNews";
      Intents["ViewOrders"] = "ViewOrders";
      Intents["ViewProfile"] = "ViewProfile";
      Intents["ViewQuote"] = "ViewQuote";
      Intents["ViewResearch"] = "ViewResearch";
    })(Intents || (Intents = {}));

    class UserChannel {
        constructor(channelsController, glueChannel) {
            this.channelsController = channelsController;
            this.type = ChannelTypes.User;
            this.id = glueChannel.meta.fdc3
                ? glueChannel.meta.fdc3.id
                : glueChannel.name;
            this.displayMetadata = {
                name: glueChannel.name,
                color: glueChannel.meta.color
            };
        }
        toApi() {
            const api = {
                id: this.id,
                type: this.type,
                displayMetadata: this.displayMetadata,
                broadcast: this.broadcast.bind(this),
                getCurrentContext: this.getCurrentContext.bind(this),
                addContextListener: this.addContextListener.bind(this),
            };
            return api;
        }
        broadcast(context) {
            return __awaiter(this, void 0, void 0, function* () {
                contextDecoder.runWithException(context);
                return this.channelsController.broadcast(generateCommandId(), context, this.id);
            });
        }
        getCurrentContext(contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                nonEmptyStringDecoder.run(contextType);
                return this.channelsController.getContextForChannel({ commandId: generateCommandId(), channelId: this.id, contextType });
            });
        }
        addContextListener(contextType, handler) {
            return __awaiter(this, arguments, void 0, function* () {
                if (arguments.length === 1) {
                    if (typeof contextType !== "function") {
                        throw { message: ChannelError.AccessDenied, reason: `Expected function as an argument, got ${typeof contextType}` };
                    }
                    return this.channelsController.addContextListener({ commandId: generateCommandId(), handler: contextType, channelId: this.id });
                }
                const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);
                if (typeof handler !== "function") {
                    throw { message: ChannelError.AccessDenied, reason: `Expected function as an argument, got ${typeof handler}` };
                }
                return this.channelsController.addContextListener({ commandId: generateCommandId(), handler, contextType: contextTypeDecoder, channelId: this.id });
            });
        }
    }

    const isChannel = (data) => {
        return defaultChannelsProps.every(prop => Object.keys(data).includes(prop));
    };
    const isContext = (data) => {
        return defaultContextProps.every(prop => Object.keys(data).includes(prop));
    };
    const isChannelMetadata = (data) => {
        return typeof data === "object" && data.isChannel;
    };
    const extractChannelMetadata = (channel) => {
        return {
            id: channel.id,
            type: channel.type,
            displayMetadata: channel.displayMetadata,
            isChannel: true
        };
    };
    const parseContextHandler = (handler, contextType) => {
        const subHandler = (data, metadata) => {
            if (contextType) {
                if (data.type === contextType) {
                    handler(data, metadata);
                }
                return;
            }
            handler(data, metadata);
        };
        return subHandler;
    };

    class IntentsController {
        constructor(glueController, channelsController, channelsFactory) {
            this.glueController = glueController;
            this.channelsController = channelsController;
            this.channelsFactory = channelsFactory;
        }
        get logger() {
            if (!this._logger) {
                this._logger = this.glueController.initSubLogger("fdc3.intents.controller");
            }
            return this._logger;
        }
        findIntent({ commandId, intent, context, resultType }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                this.logger.info(`[${commandId}] - findIntent() invoked for intent ${intent} with contextType ${context === null || context === void 0 ? void 0 : context.type} and resultType ${resultType}`);
                const glueIntents = yield this.glueController.findIntents({ name: intent });
                if (!glueIntents.length) {
                    throw { message: ResolveError.NoAppsFound, reason: `There are no apps handling the passed intent ${intent}` };
                }
                const searchedGlueIntent = glueIntents.find((glueIntent) => glueIntent.name === intent);
                if (!searchedGlueIntent) {
                    throw { message: ResolveError.NoAppsFound, reason: `There are no apps handling the passed intent ${intent}` };
                }
                if (!context && !resultType) {
                    return this.convertGlue42IntentToFDC3Intent(searchedGlueIntent);
                }
                const contextType = (context && context.type === fdc3NothingContextType) ? undefined : context === null || context === void 0 ? void 0 : context.type;
                const filteredIntent = this.getGlueIntentWithFilteredHandlers(searchedGlueIntent, { contextType, resultType });
                if (!filteredIntent.handlers.length) {
                    throw { message: ResolveError.NoAppsFound, reason: `No apps handling intent ${intent} with contextType ${context === null || context === void 0 ? void 0 : context.type} and resultType ${resultType}` };
                }
                return this.convertGlue42IntentToFDC3Intent(filteredIntent);
            });
        }
        findIntentsByContext({ commandId, context, resultType }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                this.logger.info(`[${commandId}] - findIntentsByContext() invoked for context type ${context.type} and resultType ${resultType}`);
                const glueIntents = yield this.glueController.findIntents({ contextType: context.type, resultType });
                if (!glueIntents.length) {
                    throw { message: ResolveError.NoAppsFound, reason: `No apps registering intent with contextType ${context.type} ${resultType ? `and resultType ${resultType}` : ""}` };
                }
                this.logger.info(`[${commandId}] - parsing glue intents to fdc3 intents and returning`);
                return glueIntents.map((glueIntent) => {
                    const intentWithFilteredHandlers = this.getGlueIntentWithFilteredHandlers(glueIntent, { contextType: context.type, resultType });
                    return this.convertGlue42IntentToFDC3Intent(intentWithFilteredHandlers);
                });
            });
        }
        raiseIntent({ commandId, intent, context, target }) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                this.logger.info(`[${commandId}] - raiseIntent() invoked for intent ${intent} with contextType: ${context.type} and target: ${target}`);
                const glueContext = { type: context.type, data: Object.assign({}, context) };
                const searchedGlueIntent = (yield this.glueController.findIntents({ name: intent })).find(glueIntent => glueIntent.name === intent);
                if (!searchedGlueIntent) {
                    throw { message: ResolveError.NoAppsFound, reason: `There's no app registering an intent '${intent}'` };
                }
                const filteredGlueIntent = this.filterGlueIntentHandlers({ commandId, intent: searchedGlueIntent, context, target });
                if (!target) {
                    this.logger.info(`[${commandId}] - raising intent ${intent} with contextType ${context.type} and handlers ${filteredGlueIntent.handlers.map(h => h.applicationName && h.instanceId)}`);
                    return this.invokeRaiseIntent(commandId, { intent, context: glueContext, handlers: filteredGlueIntent.handlers });
                }
                if (typeof target === "string" || !target.instanceId) {
                    this.logger.info(`[${commandId}] - target app ${target.appId} is a valid handler. Raising intent ${intent} with contextType ${context.type} and handlers ${filteredGlueIntent.handlers}`);
                    return this.invokeRaiseIntent(commandId, {
                        intent,
                        context: glueContext,
                        target: { app: target.appId, instance: (_a = filteredGlueIntent.handlers.find((h) => h.instanceId)) === null || _a === void 0 ? void 0 : _a.instanceId }
                    });
                }
                this.logger.info(`[${commandId}] - raising intent ${intent} with contextType ${context.type} to target instance of app ${target.appId} and id ${target.instanceId}`);
                return this.invokeRaiseIntent(commandId, {
                    intent,
                    context: glueContext,
                    target: { instance: target.instanceId }
                });
            });
        }
        raiseIntentForContext({ commandId, context, target }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                this.logger.info(`[${commandId}] - raiseIntentForContext() invoked with contextType ${context.type} and target ${target}`);
                const appIntents = yield this.findIntentsByContext({ commandId, context });
                if (!appIntents || appIntents.length === 0) {
                    throw {
                        message: ResolveError.NoAppsFound,
                        reason: `No apps registering intent with contextType ${context.type} ${target ? `and target ${JSON.stringify(target)}` : ""}`
                    };
                }
                return this.raiseIntent({ commandId, intent: appIntents[0].intent.name, context, target });
            });
        }
        addIntentListener({ commandId, intent, handler }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                this.logger.info(`[${commandId}] - addIntentListener() invoked for intent ${intent}`);
                const wrappedHandler = this.getWrappedIntentHandler(handler);
                return this.glueController.addIntentListener(intent, wrappedHandler);
            });
        }
        filterGlueIntentHandlers({ commandId, intent, context, target }) {
            let filteredGlueIntent;
            filteredGlueIntent = this.filterIntentHandlersByContext(intent, context);
            if (!target) {
                this.logger.info(`[${commandId}] - There's no passed target, intent handlers are filtered only by context type`);
                return filteredGlueIntent;
            }
            this.logger.log(`[${commandId}] - filtering handlers by target (${JSON.stringify(target)}) for intent ${intent.name}`);
            filteredGlueIntent = this.filterIntentHandlersByTarget({ intent, target, commandId });
            return filteredGlueIntent;
        }
        filterIntentHandlersByTarget({ intent, target, commandId }) {
            const appName = typeof target === "string" ? target : target.appId;
            const instanceId = typeof target === "string" ? undefined : target.instanceId;
            this.logger.info(`[${commandId}] - Checking if application with name ${appName} exists`);
            const app = this.glueController.getApplication(appName);
            const serverInstances = this.serverInstanceAsIntentHandler(intent.name);
            if (!app && (typeof target === "string" || !serverInstances.length)) {
                throw { message: ResolveError.TargetAppUnavailable, reason: `There's no app with appId ${appName}` };
            }
            this.logger.info(`[${commandId}] - target app ${appName} found. Filtering handlers by applicationName: ${appName}`);
            const validHandlersByApplicationName = intent.handlers.filter((handler) => handler.applicationName === appName);
            if (!validHandlersByApplicationName.length) {
                throw { message: ResolveError.NoAppsFound, reason: `Intent ${intent.name} exists but there's no app with appId ${appName} registering it` };
            }
            if (!instanceId) {
                this.logger.log(`[${commandId}] - returning all handlers for intent ${intent.name} and target: ${JSON.stringify(target)}`);
                return { name: intent.name, handlers: validHandlersByApplicationName };
            }
            const isValidInstanceOfTheApp = app
                ? app.instances.find((inst) => inst.id === instanceId)
                : serverInstances.find((inst) => inst.instance === instanceId);
            if (!isValidInstanceOfTheApp) {
                throw { message: ResolveError.TargetInstanceUnavailable, reason: `There's no instance with id ${instanceId} of the passed app ${appName}` };
            }
            this.logger.info(`[${commandId}] - Filtering handlers by instanceId: ${instanceId}`);
            const validHandlersByInstanceId = validHandlersByApplicationName.filter((handler) => handler.instanceId === instanceId);
            if (!validHandlersByInstanceId.length) {
                throw { message: ResolveError.IntentDeliveryFailed, reason: `There's no instance with id ${instanceId} of app ${appName} registering intent ${intent.name}` };
            }
            return { name: intent.name, handlers: validHandlersByInstanceId };
        }
        serverInstanceAsIntentHandler(intentName) {
            const interopMethodName = `${IntentsMethodPrefix}${intentName}`;
            const servers = this.glueController.getInteropServers({ name: interopMethodName });
            return servers;
        }
        filterIntentHandlersByContext(intent, context) {
            const filteredGlueIntent = context.type === fdc3NothingContextType
                ? intent
                : this.getGlueIntentWithFilteredHandlers(intent, { contextType: context.type });
            if (!filteredGlueIntent.handlers.length) {
                throw { message: ResolveError.NoAppsFound, reason: `There's no app registering an intent with the passed context type ${context.type}` };
            }
            return filteredGlueIntent;
        }
        getResult(commandId, glueIntentResult) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${commandId}] - getResult() of IntentResolution invoked`);
                const { result } = glueIntentResult;
                if (!isValidNonEmptyObject(result)) {
                    return;
                }
                const isResultChannelMetadata = isChannelMetadata(result);
                if (!isResultChannelMetadata) {
                    return result;
                }
                const { clientId, creatorId } = yield this.glueController.getContext(result.id);
                this.logger.info(`[${commandId}] - result is a private channel with creatorId ${creatorId} and clientId ${clientId}`);
                const myInteropInstanceId = this.glueController.getMyInteropInstanceId();
                if ((creatorId && creatorId !== myInteropInstanceId) && (clientId && clientId !== myInteropInstanceId)) {
                    throw { message: ResultError.NoResultReturned, reason: "There are already two parties on this private channel" };
                }
                const channel = this.channelsFactory.buildModel(result);
                if (myInteropInstanceId && myInteropInstanceId !== creatorId) {
                    this.logger.info(`[${commandId}] - the current user is the second party of the private channel. Adding my id ${myInteropInstanceId} as a clientId`);
                    yield this.channelsController.addClientToPrivateChannel(commandId, channel.id, myInteropInstanceId);
                }
                this.logger.info(`[${commandId}] - returning private channel`);
                return channel;
            });
        }
        convertGlue42IntentToFDC3Intent(glueIntent) {
            const { name, handlers } = glueIntent;
            const appIntent = {
                intent: { name, displayName: handlers[0].displayName || "" },
                apps: handlers.map((handler) => {
                    const appName = handler.applicationName;
                    const app = this.glueController.getApplication(appName);
                    return {
                        appId: appName,
                        instanceId: handler.instanceId,
                        name: appName,
                        title: handler.applicationTitle || handler.instanceTitle || appName,
                        tooltip: (app === null || app === void 0 ? void 0 : app.userProperties.tooltip) || `${appName} (${handler.type})`,
                        description: handler.applicationDescription,
                        icons: handler.applicationIcon ? [handler.applicationIcon, ...((app === null || app === void 0 ? void 0 : app.userProperties.icons) || [])] : app === null || app === void 0 ? void 0 : app.userProperties.icons,
                        images: app === null || app === void 0 ? void 0 : app.userProperties.images,
                        resultType: handler.resultType
                    };
                })
            };
            return appIntent;
        }
        getResultType(data) {
            if (isChannel(data)) {
                return IntentHandlerResultTypes.Channel;
            }
            if (isContext(data)) {
                return IntentHandlerResultTypes.Context;
            }
            throw new Error("Async handler function should return a promise that resolves to a Context or Channel");
        }
        getWrappedIntentHandler(handler) {
            const wrappedHandler = (glue42Context) => __awaiter(this, void 0, void 0, function* () {
                const handlerResult = yield handler(Object.assign(Object.assign({}, glue42Context.data), { type: glue42Context.type || "" }));
                if (!handlerResult) {
                    return;
                }
                const handlerResultType = this.getResultType(handlerResult);
                return handlerResultType === IntentHandlerResultTypes.Channel
                    ? extractChannelMetadata(handlerResult)
                    : handlerResult;
            });
            return wrappedHandler;
        }
        getGlueIntentWithFilteredHandlers(glueIntent, filter) {
            const { name, handlers } = glueIntent;
            const desktopGlobal = window.glue42gd || window.iodesktop;
            let filteredHandlers = handlers;
            if (filter.contextType) {
                filteredHandlers = handlers.filter((handler) => {
                    var _a, _b;
                    if (handler.instanceId) {
                        const appExists = desktopGlobal && handler.applicationName === Glue42EnterpriseNoAppWindow
                            ? false
                            : !!(this.glueController.getApplication(handler.applicationName));
                        return appExists
                            ? (_a = handler.contextTypes) === null || _a === void 0 ? void 0 : _a.includes(filter.contextType)
                            : handler;
                    }
                    return (_b = handler.contextTypes) === null || _b === void 0 ? void 0 : _b.includes(filter.contextType);
                });
            }
            if (filter.resultType) {
                filteredHandlers = handlers.filter((handler) => { var _a; return (_a = handler.resultType) === null || _a === void 0 ? void 0 : _a.includes(filter.resultType); });
            }
            return { name, handlers: filteredHandlers };
        }
        invokeRaiseIntent(commandId, request) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const glueIntentResult = yield this.glueController.raiseIntent(Object.assign(Object.assign({}, request), { timeout: RaiseTimeoutMs }));
                    return {
                        source: {
                            appId: glueIntentResult.handler.applicationName,
                            instanceId: glueIntentResult.handler.instanceId
                        },
                        intent: request.intent,
                        getResult: (() => this.getResult(commandId, glueIntentResult)).bind(this)
                    };
                }
                catch (error) {
                    throw { message: ResolveError.IntentDeliveryFailed, reason: typeof error === "string" ? error : JSON.stringify(error) };
                }
            });
        }
    }

    var version = "2.0.1";

    class ApplicationsController {
        constructor(glueController) {
            this.glueController = glueController;
            this.defaultContextListenerInvokedPromiseTimeout = 60000;
            this.contextListenerInvokedPromises = {};
        }
        get logger() {
            if (!this._logger) {
                this._logger = this.glueController.initSubLogger("fdc3.application.controller");
            }
            return this._logger;
        }
        open({ commandId, target, context }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                this.logger.log(`[${commandId}] - open() invoked with target ${target} ${context ? `and contextType ${context.type}` : ""}`);
                const name = typeof target === "object" ? target.appId : target;
                const app = this.glueController.getApplication(name);
                if (!app) {
                    throw { message: OpenError.AppNotFound, reason: `Cannot find targeted ${name} application` };
                }
                if (context) {
                    this.logger.info(`[${commandId}] - opening app ${app} with startup context`);
                    return this.openAppWithContext(app, context);
                }
                try {
                    this.logger.info(`[${commandId}] - opening app ${app}`);
                    const glueInst = yield app.start();
                    this.logger.info(`[${commandId}] - instance with id ${glueInst.id} started`);
                    return this.parseGlueInstToAppIdentifier(glueInst);
                }
                catch (error) {
                    throw { message: OpenError.ErrorOnLaunch, reason: typeof error === "string" ? error : JSON.stringify(error) };
                }
            });
        }
        findInstances({ commandId, appIdentifier }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                this.logger.info(`[${commandId}] - findInstances() invoked with appIdentifier ${appIdentifier}`);
                const { appId } = appIdentifier;
                const app = this.glueController.getApplication(appId);
                if (!app) {
                    throw { message: ResolveError.NoAppsFound, reason: `App with appId: ${appId} does not exist` };
                }
                const glueInstances = this.glueController.getApplicationInstances(appId);
                const fdc3Instances = glueInstances.map(glueInst => this.parseGlueInstToAppIdentifier(glueInst));
                this.logger.info(`[${commandId}] - ids of opened instances for appIdentifier ${appIdentifier}: ${JSON.stringify(fdc3Instances.map(inst => inst.instanceId))}`);
                return fdc3Instances;
            });
        }
        getAppMetadata({ commandId, appIdentifier }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                this.logger.info(`[${commandId}] - getAppMetadata() invoked with appIdentifier ${appIdentifier}`);
                const { appId, instanceId } = appIdentifier;
                const app = this.glueController.getApplication(appId);
                if (!app) {
                    throw { message: OpenError.AppNotFound, reason: `Cannot find application with appId: ${appId}` };
                }
                if (!instanceId) {
                    this.logger.info(`[${commandId}] - no opened instances found. Parsing app ${app}`);
                    return this.parseGlueAppToAppMetadata(app);
                }
                const instance = this.glueController.getAppInstanceById(instanceId);
                const appMetadata = this.parseGlueAppToAppMetadata(app, instance);
                this.logger.info(`[${commandId}] - found app metadata: ${appMetadata}`);
                return appMetadata;
            });
        }
        getInfo({ commandId }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                this.logger.info(`${commandId} - getInfo() invoked`);
                const appMetadata = yield this.getCurrentAppMetadata();
                return {
                    provider: "Glue42",
                    providerVersion: version,
                    fdc3Version: "2.0.0",
                    optionalFeatures: {
                        OriginatingAppMetadata: true,
                        UserChannelMembershipAPIs: true
                    },
                    appMetadata
                };
            });
        }
        getCurrentAppMetadata() {
            const myInstance = this.glueController.interopInstance();
            return Promise.resolve({
                appId: myInstance.applicationName,
                instanceId: myInstance.instance
            });
        }
        parseGlueInstToAppIdentifier(glueInst) {
            return {
                appId: glueInst.application.name,
                instanceId: glueInst.id
            };
        }
        parseGlueAppToAppMetadata(app, instance) {
            return __awaiter(this, void 0, void 0, function* () {
                const appMetadata = yield this.getBaseGlueAppToAppMetadata(app);
                if (!instance) {
                    return appMetadata;
                }
                return this.addInstanceMetadataToAppMetadata(appMetadata, instance);
            });
        }
        getBaseGlueAppToAppMetadata(app) {
            return __awaiter(this, void 0, void 0, function* () {
                const desktopGlobal = window.glue42gd || window.iodesktop;
                const appConfiguration = desktopGlobal
                    ? yield app.getConfiguration()
                    : app.userProperties;
                const icon = desktopGlobal
                    ? (yield app.getConfiguration()).icon
                    : app.icon;
                return {
                    appId: app.name,
                    name: app.name,
                    version: app.version,
                    description: appConfiguration.description,
                    title: app.title,
                    icons: icon ? [{ src: icon }] : [],
                    tooltip: appConfiguration.tooltip,
                    screenshots: desktopGlobal
                        ? appConfiguration.customProperties.screenshots
                        : appConfiguration.screenshots
                };
            });
        }
        addInstanceMetadataToAppMetadata(appMetadata, instance) {
            return Object.assign(Object.assign({}, appMetadata), { instanceId: instance.id, instanceMetadata: instance.agm });
        }
        openAppWithContext(app, context) {
            return __awaiter(this, void 0, void 0, function* () {
                const methodName = yield this.registerContextListenerInteropMethod();
                const startContext = this.buildGlueStartContext(context, methodName);
                const glueInst = yield app.start(startContext);
                this.createContextListenerResponsePromise(glueInst, methodName);
                try {
                    yield this.contextListenerInvokedPromises[glueInst.id].promise;
                    yield this.unregisterContextListenerPromise(glueInst.id);
                    return this.parseGlueInstToAppIdentifier(glueInst);
                }
                catch (error) {
                    yield this.unregisterContextListenerPromise(glueInst.id);
                    throw { message: OpenError.AppTimeout, reason: typeof error === "string" ? error : JSON.stringify(error) };
                }
            });
        }
        buildGlueStartContext(fdc3Context, responseMethodName) {
            return {
                meta: {
                    responseMethodName,
                    instance: this.glueController.interopInstance().instance
                },
                context: fdc3Context
            };
        }
        registerContextListenerInteropMethod() {
            return __awaiter(this, void 0, void 0, function* () {
                const methodName = this.buildInteropMethodName();
                yield this.glueController.registerMethod(methodName, this.contextListenerResponseHandler.bind(this));
                return methodName;
            });
        }
        buildInteropMethodName() {
            return `${responseInteropMethodPrefix}.${nanoid()}`;
        }
        createContextListenerResponsePromise(instance, methodName) {
            let resolve = () => { };
            let reject = () => { };
            const promise = promisePlus(() => {
                return new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });
            }, this.defaultContextListenerInvokedPromiseTimeout, `Timeout of ${this.defaultContextListenerInvokedPromiseTimeout}ms hit waiting for application with appId: ${instance.application.name} and instanceId: ${instance.id} to register context listener`);
            this.contextListenerInvokedPromises[instance.id] = { promise, resolve, reject, methodName };
        }
        contextListenerResponseHandler(args, callerId) {
            const result = ContextListenerResponseDecoder.run(args);
            if (!result.ok) {
                const contextListenerPromise = this.contextListenerInvokedPromises[callerId.instance];
                if (!contextListenerPromise) {
                    return;
                }
                contextListenerPromise.reject(`Method invoked with invalid argument - ${result.error.message}`);
                return;
            }
            const contextListenerPromise = this.contextListenerInvokedPromises[callerId.instance];
            if (!contextListenerPromise) {
                return;
            }
            contextListenerPromise.resolve();
        }
        unregisterContextListenerPromise(instanceId) {
            return __awaiter(this, void 0, void 0, function* () {
                const { methodName } = this.contextListenerInvokedPromises[instanceId];
                yield this.glueController.unregisterMethod(methodName);
                delete this.contextListenerInvokedPromises[instanceId];
            });
        }
    }

    class ChannelsController {
        constructor(glueController, channelsStateStore, channelsParser, channelsFactory, channelsCallbackRegistry, channelsPendingListenersStore) {
            this.glueController = glueController;
            this.channelsStateStore = channelsStateStore;
            this.channelsParser = channelsParser;
            this.channelsFactory = channelsFactory;
            this.channelsCallbackRegistry = channelsCallbackRegistry;
            this.channelsPendingListenersStore = channelsPendingListenersStore;
            this.invokeContextHandlerWithStartupContext = true;
            this.initDonePromise = this.initialize();
            this.initDonePromise.catch(() => { });
        }
        get logger() {
            if (!this._logger) {
                this._logger = this.glueController.initSubLogger("fdc3.channels.controller");
            }
            return this._logger;
        }
        addContextListener({ commandId, handler, contextType, channelId }) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - addContextListener() invoked for contextType ${contextType} and channelId ${channelId}`);
                if (this.invokeContextHandlerWithStartupContext) {
                    this.logger.info(`[${commandId}] - trying to invoke context handler with window context`);
                    this.handleWindowContextOnOpening(commandId, handler, contextType).catch((err) => this.logger.warn(`[${commandId}] - ${err}`));
                }
                const channelIdToSubscribeTo = channelId || ((_a = this.channelsStateStore.currentChannel) === null || _a === void 0 ? void 0 : _a.id);
                return this.addContextListenerByChannelId(commandId, handler, channelIdToSubscribeTo, contextType);
            });
        }
        broadcast(commandId, context, channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - broadcast() invoked with contextType ${context.type} and channelId ${channelId}`);
                const canBroadcast = this.isBroadcastPermitted(commandId, channelId);
                if (!canBroadcast) {
                    return;
                }
                const channelIdToBroadcastTo = channelId || this.channelsStateStore.currentChannel.id;
                return this.broadcastByChannelId(commandId, channelIdToBroadcastTo, context);
            });
        }
        getUserChannels(commandId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - getUserChannels() invoked`);
                return Object.values(this.channelsStateStore.userChannels);
            });
        }
        getOrCreateChannel({ commandId, channelId }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - getOrCreateChannel() invoked for channel with id ${channelId}`);
                const isPrivateChannel = this.isPrivateChannel(channelId);
                if (isPrivateChannel) {
                    throw { message: ChannelError.AccessDenied, reason: "Cannot retrieve a private channel" };
                }
                const isUserChannel = this.isUserChannel(channelId);
                if (isUserChannel) {
                    throw { message: ChannelError.AccessDenied, reason: "There's an already existing system channel with passed id. Retrieve it using fdc3.getSystemChannels() or create a new app channel with a different id" };
                }
                return this.getOrCreateAppChannel(commandId, channelId);
            });
        }
        joinUserChannel({ commandId, channelId }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - joinUserChannel() invoked for channel with id ${channelId}`);
                const isAppChannel = this.doesAppChannelExist(channelId);
                if (isAppChannel) {
                    throw { message: ChannelError.AccessDenied, reason: "Cannot join an app channel" };
                }
                const channelToJoin = this.channelsStateStore.userChannels[channelId];
                if (!channelToJoin) {
                    throw { message: ChannelError.NoChannelFound, reason: `Cannot find user channel with id ${channelId}` };
                }
                const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
                this.channelsStateStore.currentChannel = channelToJoin;
                this.logger.info(`[${commandId}] - joining fdc3 user channel with id ${channelId} (underlying glue channel: ${glueChannelName})`);
                yield this.glueController.joinChannel(glueChannelName);
            });
        }
        getCurrentChannel(commandId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - getCurrentChannel() invoked`);
                return this.channelsStateStore.currentChannel;
            });
        }
        leaveCurrentChannel(commandId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - leaveCurrentChannel() invoked`);
                if (!this.channelsStateStore.currentChannel) {
                    this.logger.info(`[${commandId}] - no channel to leave`);
                    return;
                }
                yield this.glueController.leaveChannel();
                this.channelsStateStore.currentChannel = null;
                this.logger.info(`[${commandId}] - current channel is left. unsubscribing from all listeners`);
                this.channelsPendingListenersStore.unsubscribePendingListeners();
            });
        }
        getContextForChannel({ commandId, channelId, contextType }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - getContextForChannel() invoked for channel with id ${channelId}`);
                const isUserChannel = this.isUserChannel(channelId);
                if (!contextType) {
                    this.logger.info(`[${commandId}] - retrieving latest context broadcasted on channel with id ${channelId}`);
                    let context;
                    if (isUserChannel) {
                        const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
                        const glueChannelWithPrefix = this.channelsParser.mapChannelNameToContextName(glueChannelName);
                        this.logger.info(`[${commandId}] - getting context for user channel with id ${channelId} (underlying glue channel ${glueChannelName})`);
                        context = yield this.glueController.getContext(glueChannelWithPrefix);
                    }
                    else {
                        this.logger.info(`[${commandId}] - getting context for app channel with id ${channelId}`);
                        context = yield this.glueController.getContext(channelId);
                    }
                    return context.latest_fdc3_type
                        ? this.channelsParser.parseContextsDataToInitialFDC3Data(context)
                        : null;
                }
                this.logger.info(`[${commandId}] Retrieving latest context of type ${contextType} broadcasted on ${isUserChannel ? "user" : "app"} channel with id ${channelId}`);
                const parsedType = this.channelsParser.mapFDC3TypeToChannelsDelimiter(contextType);
                const { data } = isUserChannel
                    ? yield this.glueController.getChannel(this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId))
                    : yield this.glueController.getContext(channelId);
                return data && data[`fdc3_${parsedType}`]
                    ? this.channelsParser.parseContextsDataToInitialFDC3Data({ data, latest_fdc3_type: parsedType })
                    : null;
            });
        }
        createPrivateChannel(commandId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - createPrivateChannel() invoked`);
                const creatorId = this.glueController.getMyInteropInstanceId();
                const channel = this.buildChannel(ChannelTypes.Private);
                yield this.glueController.updateContext(channel.id, { creatorId });
                this.logger.info(`[${commandId}] - private channel with id ${channel.id} created`);
                return channel;
            });
        }
        announceDisconnect(commandId, channelId, instanceId) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.initDonePromise;
                this.logger.info(`[${commandId}] - disconnect() invoked on channel with id ${channelId}`);
                yield this.glueController.updateContext(channelId, { disconnected: true });
                this.logger.info(`[${commandId}] - glue context for ${channelId} updated with disconnected flag`);
                const closedInstanceId = instanceId || this.glueController.getMyInteropInstanceId();
                const targetInstance = yield this.getOtherInstanceIdFromClosedOne(channelId, closedInstanceId);
                const replayContextTypes = yield this.getContextTypesForPrivateChannel(channelId);
                this.logger.info(`[${commandId}] - invoking onDisconnect callback for instance ${targetInstance}`);
                this.invokeSystemMethod(targetInstance, PrivateChannelEventMethods.OnDisconnect, { clientId: targetInstance, channelId, replayContextTypes });
            });
        }
        addClientToPrivateChannel(commandId, channelId, clientId) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${commandId}] - client with id ${clientId} added to private channel with id ${channelId}`);
                yield this.glueController.updateContext(channelId, { clientId });
            });
        }
        isPrivateChannelDisconnected({ commandId, channelId }) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${commandId}] - checking if private channel with id ${channelId} is disconnected`);
                const context = yield this.glueController.getContext(channelId);
                return !!context.disconnected;
            });
        }
        registerOnInstanceStopped({ commandId, channelId }) {
            this.logger.info(`[${commandId}] - registering onInstanceStopped callback for channel with id ${channelId}`);
            const handler = (instance) => __awaiter(this, void 0, void 0, function* () {
                const { clientId, creatorId } = yield this.glueController.getContext(channelId);
                if (instance.id !== clientId && instance.id !== creatorId) {
                    return;
                }
                this.logger.info(`[${commandId}] - calling onDisconnect callback for channel with id ${channelId}`);
                yield this.announceDisconnect(commandId, channelId, instance.id);
            });
            return this.glueController.registerOnInstanceStopped(handler.bind(this));
        }
        addPrivateChannelEvent({ commandId, action, channelId, handler }) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`[${commandId}] - registering callback for ${action} event in channel with id ${channelId}`);
                let replayArgs;
                const targetInstanceId = yield this.getTargetedInstanceId(channelId);
                if (action === PrivateChannelEventMethods.OnAddContextListener && targetInstanceId) {
                    replayArgs = yield this.getContextTypesForPrivateChannel(channelId);
                }
                return this.channelsCallbackRegistry.add({ action, channelId, handler, replayArgs });
            });
        }
        initialize() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.glueController.gluePromise;
                const current = this.glueController.getCurrentChannel();
                const glueChannels = yield this.glueController.listAllChannels();
                const glueChannelsWithFdc3Meta = glueChannels.filter((glueChannel) => glueChannel.meta.fdc3);
                glueChannelsWithFdc3Meta.forEach((glueChannel) => {
                    const userChannel = this.buildChannel(ChannelTypes.User, { displayMetadata: { glueChannel } });
                    this.channelsStateStore.addFdc3IdToGlueChannelName(userChannel.id, glueChannel.name);
                    this.channelsStateStore.addUserChannel(userChannel);
                    if (current && glueChannel.name === current) {
                        this.channelsStateStore.currentChannel = userChannel;
                    }
                });
                this.glueController.setOnChannelChanged(this.handleOnChannelChanged.bind(this));
            });
        }
        handleOnChannelChanged(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!channelId) {
                    this.channelsPendingListenersStore.unsubscribePendingListeners();
                    return;
                }
                const isFdc3ChannelName = fdc3ChannelNames.includes(channelId);
                const userChannelId = isFdc3ChannelName ? channelId : this.channelsStateStore.getFdc3ChannelIdByGlueChannelName(channelId);
                const commandId = nanoid();
                yield this.channelsPendingListenersStore.subscribePendingListeners(commandId, this.addContextListener.bind(this), userChannelId);
                this.channelsStateStore.currentChannel = this.channelsStateStore.userChannels[userChannelId];
            });
        }
        isBroadcastPermitted(commandId, channelId) {
            if (channelId) {
                return true;
            }
            if (!this.channelsStateStore.currentChannel) {
                this.logger.info(`[${commandId}] - invocation of broadcast ignored - no channel to broadcast to`);
                console.error("You need to join a user channel in order to broadcast");
                return false;
            }
            if (this.channelsStateStore.currentChannel.type === ChannelTypes.App) {
                this.logger.info(`[${commandId}] - invocation of broadcast ignored - cannot broadcast on app channel directly`);
                console.error("You can't broadcast to an app channel directly - use channel's broadcast method instead");
                return false;
            }
            return true;
        }
        handleWindowContextOnOpening(commandId, handler, contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                const myWindow = this.glueController.getMyWindow();
                if (!myWindow) {
                    this.logger.log(`[${commandId}] - Cannot get window context because this is not a Glue window, it's probably an iframe`);
                    this.invokeContextHandlerWithStartupContext = false;
                    return;
                }
                const windowContext = yield myWindow.getContext();
                if (!isValidNonEmptyObject(windowContext)) {
                    this.logger.info(`[${commandId}] - addContextListener handler won't be invoked - startup context is empty`);
                    this.invokeContextHandlerWithStartupContext = false;
                    return;
                }
                const { context, meta } = windowContext;
                const isSameContextType = contextType ? (context === null || context === void 0 ? void 0 : context.type) === contextType : true;
                if (!isSameContextType || !meta) {
                    this.logger.info(`[${commandId}] - addContextListener handler won't be invoked`);
                    return;
                }
                this.logger.info(`[${commandId}] - invoking addContextListener handler with startup context`);
                handler(context);
                this.invokeContextHandlerWithStartupContext = false;
                const { responseMethodName, instance } = meta;
                const responseMethodExists = this.doesServerMethodExist(responseMethodName, instance);
                if (!responseMethodExists) {
                    this.logger.info(`[${commandId}] - response method for instance ${instance} does not exist anymore. returning`);
                    return;
                }
                this.logger.info(`[${commandId}] - invoking response method for instance ${instance}`);
                yield this.glueController.invokeMethod(responseMethodName, instance, { listenerInvoked: true });
            });
        }
        doesServerMethodExist(methodName, instance) {
            const serversForMethodName = this.glueController.getInteropServers({ name: methodName });
            return !!serversForMethodName.find(server => server.instance === instance);
        }
        getOrCreateAppChannel(commandId, channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                const exists = this.doesAppChannelExist(channelId);
                if (!exists) {
                    this.logger.info(`[${commandId}] - app channel with id ${channelId} does not exist. Creating one`);
                    yield this.glueController.updateContext(channelId, {});
                }
                this.logger.info(`[${commandId}] - returning app channel with id ${channelId}`);
                return this.buildChannel(ChannelTypes.App, { id: channelId });
            });
        }
        doesAppChannelExist(name) {
            return !name.includes(PrivateChannelPrefix) && this.glueController.getAllContexts().some((ctxName) => ctxName === name);
        }
        isUserChannel(channelId) {
            if (!channelId) {
                return false;
            }
            return !!this.channelsStateStore.userChannels[channelId];
        }
        isPrivateChannel(channelId) {
            return channelId.includes(PrivateChannelPrefix) && this.glueController.getAllContexts().some((ctxName) => ctxName === channelId);
        }
        buildChannel(type, data) {
            return this.channelsFactory.buildModel(Object.assign(Object.assign({ type }, data), { isChannel: true }));
        }
        broadcastByChannelId(commandId, channelId, context) {
            return __awaiter(this, void 0, void 0, function* () {
                const isUserChannel = this.isUserChannel(channelId);
                if (!isUserChannel) {
                    this.logger.info(`[${commandId}] - broadcasting on app channel with id ${channelId}`);
                    return this.glueController.updateContextWithLatestFdc3Type(channelId, context);
                }
                const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
                this.logger.info(`[${commandId}] - broadcasting on fdc3 user channel with id ${channelId} (underlying glue channel: ${glueChannelName})`);
                return this.glueController.channelsUpdate(glueChannelName, context);
            });
        }
        addContextListenerByChannelId(commandId, handler, channelId, contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                const subHandler = parseContextHandler(handler, contextType);
                if (!channelId) {
                    this.logger.info(`[${commandId}] - no channel to subscribe for. Creating a pending listener`);
                    return this.channelsPendingListenersStore.createPendingListener(subHandler, contextType);
                }
                const channelType = this.getChannelTypeById(channelId);
                if (channelType === ChannelTypes.User) {
                    this.logger.info(`[${commandId}] - subscribing for fdc3 user channel with id ${channelId}`);
                    const glueChannelName = this.channelsStateStore.getGlueChannelNameByFdc3ChannelId(channelId);
                    const unsubscribe = this.glueController.channelsSubscribeFor(glueChannelName, subHandler);
                    return {
                        unsubscribe: () => {
                            this.logger.info(`[${commandId}] - invoking unsubscribe for fdc3 user channel with id ${channelId}`);
                            unsubscribe.then((unsubscribe) => unsubscribe());
                        }
                    };
                }
                if (channelType === ChannelTypes.App) {
                    this.logger.info(`[${commandId}] - subscribing for fdc3 app channel with id ${channelId} (underlying glue context with same name)`);
                    const unsubscribe = yield this.glueController.contextsSubscribe(channelId, subHandler);
                    return {
                        unsubscribe: () => {
                            this.logger.info(`[${commandId}] - invoking unsubscribe for app channel with id ${channelId}`);
                            unsubscribe();
                        }
                    };
                }
                if (channelType === ChannelTypes.Private) {
                    this.logger.info(`[${commandId}] - subscribing for fdc3 private channel with id ${channelId} (underlying glue context with same name)`);
                    const contextsUnsubscribe = yield this.glueController.contextsSubscribe(channelId, subHandler);
                    yield this.addContextTypeInPrivateChannelContext(channelId, contextType);
                    const targetInstance = yield this.getTargetedInstanceId(channelId);
                    const unsubscribe = () => {
                        this.logger.info(`[${commandId}] - unsubscribe invoked for private channel with id ${channelId}`);
                        contextsUnsubscribe();
                        this.logger.info(`[${commandId}] - invoking onUnsubscribe handler for private channel with id ${channelId}`);
                        this.invokeSystemMethod(targetInstance, PrivateChannelEventMethods.OnUnsubscribe, { channelId, clientId: targetInstance, contextType });
                    };
                    this.logger.info(`[${commandId}] - invoking onAddContextListener handler for private channel with id ${channelId}`);
                    this.invokeSystemMethod(targetInstance, PrivateChannelEventMethods.OnAddContextListener, { channelId: channelId, clientId: targetInstance, contextType });
                    return { unsubscribe };
                }
                throw { message: ChannelError.AccessDenied, reason: "Cannot add a context listener on an invalid channel" };
            });
        }
        getChannelTypeById(channelId) {
            const isUser = this.isUserChannel(channelId);
            if (isUser) {
                return ChannelTypes.User;
            }
            const isPrivate = this.isPrivateChannel(channelId);
            if (isPrivate) {
                return ChannelTypes.Private;
            }
            const isApp = this.doesAppChannelExist(channelId);
            if (isApp) {
                return ChannelTypes.App;
            }
            throw { message: ChannelError.NoChannelFound, reason: `Channel with id: ${channelId} does not exist` };
        }
        getTargetedInstanceId(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                const { clientId, creatorId } = yield this.glueController.getContext(channelId);
                const myId = this.glueController.getMyInteropInstanceId();
                return myId === clientId ? creatorId : clientId;
            });
        }
        getOtherInstanceIdFromClosedOne(channelId, closedInstanceId) {
            return __awaiter(this, void 0, void 0, function* () {
                const { clientId, creatorId } = yield this.glueController.getContext(channelId);
                return closedInstanceId === clientId
                    ? creatorId
                    : clientId;
            });
        }
        invokeSystemMethod(clientId, action, payload) {
            if (clientId) {
                this.glueController.invokeSystemMethod({ action, payload });
            }
        }
        addContextTypeInPrivateChannelContext(channelId, contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                const currentContext = yield this.glueController.getContext(channelId);
                const updatedTypes = currentContext.contextListenerTypes ? [...currentContext.contextListenerTypes, contextType] : [contextType];
                return this.glueController.updateContext(channelId, Object.assign(Object.assign({}, currentContext), { contextListenerTypes: updatedTypes }));
            });
        }
        getContextTypesForPrivateChannel(channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                const ctx = yield this.glueController.getContext(channelId);
                return ctx.contextListenerTypes;
            });
        }
    }

    class EventReceiver {
        constructor(glueController, eventDispatcher, eventsController) {
            this.glueController = glueController;
            this.eventDispatcher = eventDispatcher;
            this.eventsController = eventsController;
            this.glueResponseReceived = false;
            this.glueInitialized = false;
            this.events = {
                "start": { name: START, handle: this.handleStart.bind(this) },
                "requestGlueResponse": { name: REQUEST_GLUE_RESPONSE, handle: this.handleRequestGlueResponse.bind(this) }
            };
        }
        start() {
            this.wireCustomEventListener();
            this.eventDispatcher.fireNotifyStarted();
        }
        wireCustomEventListener() {
            window.addEventListener(GLUE42_EVENT_NAME, (event) => {
                const data = event.detail;
                if (!data || !data.glue42) {
                    return;
                }
                const glue42Event = data.glue42.event;
                const foundHandler = this.events[glue42Event];
                if (!foundHandler) {
                    return;
                }
                foundHandler.handle(data.glue42.message);
            });
        }
        handleStart() {
            this.eventDispatcher.fireRequestGlue();
        }
        handleRequestGlueResponse(data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.glueResponseReceived && this.glueInitialized) {
                    return;
                }
                this.glueResponseReceived = true;
                const { glue } = data;
                const glueValidator = this.glueController.validateGlue(glue);
                if (!glueValidator.isValid) {
                    return this.glueController.initializeFailed(glueValidator.error);
                }
                this.glueController.initialize(glue);
                yield this.eventsController.initialize();
                this.eventDispatcher.fireFdc3Ready();
                this.glueInitialized = true;
            });
        }
    }

    class ChannelsStateStore {
        constructor() {
            this._currentChannel = null;
            this._userChannels = {};
            this._fdc3ChannelIdsToGlueChannelNames = {};
        }
        get currentChannel() {
            return this._currentChannel;
        }
        get userChannels() {
            return this._userChannels;
        }
        set currentChannel(newChannelValue) {
            this._currentChannel = newChannelValue;
        }
        addUserChannel(channel) {
            this._userChannels[channel.id] = channel;
        }
        addFdc3IdToGlueChannelName(fdc3Id, glueChannelName) {
            this._fdc3ChannelIdsToGlueChannelNames[fdc3Id] = glueChannelName;
        }
        getGlueChannelNameByFdc3ChannelId(fdc3Id) {
            return this._fdc3ChannelIdsToGlueChannelNames[fdc3Id];
        }
        getFdc3ChannelIdByGlueChannelName(glueChannelName) {
            const [key] = Object.entries(this._fdc3ChannelIdsToGlueChannelNames).find(([_, value]) => value === glueChannelName);
            return key;
        }
    }

    class PrivateChannel {
        constructor(channelsController, channelId) {
            this.channelsController = channelsController;
            this.type = ChannelTypes.Private;
            this.id = channelId || `${PrivateChannelPrefix}${nanoid()}`;
            this.unsubFromInstanceStopped = this.channelsController.registerOnInstanceStopped({ commandId: generateCommandId(), channelId: this.id });
        }
        toApi() {
            const api = {
                id: this.id,
                type: this.type,
                displayMetadata: this.displayMetadata,
                broadcast: this.broadcast.bind(this),
                getCurrentContext: this.getCurrentContext.bind(this),
                addContextListener: this.addContextListener.bind(this),
                onAddContextListener: this.onAddContextListener.bind(this),
                onUnsubscribe: this.onUnsubscribe.bind(this),
                onDisconnect: this.onDisconnect.bind(this),
                disconnect: this.disconnect.bind(this),
            };
            return api;
        }
        broadcast(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const commandId = generateCommandId();
                const isDisconnected = yield this.channelsController.isPrivateChannelDisconnected({ commandId, channelId: this.id });
                if (isDisconnected) {
                    throw { message: ChannelError.AccessDenied, reason: "Channel has disconnected - broadcast is no longer available" };
                }
                contextDecoder.runWithException(context);
                return this.channelsController.broadcast(commandId, context, this.id);
            });
        }
        getCurrentContext(contextType) {
            return __awaiter(this, void 0, void 0, function* () {
                optionalNonEmptyStringDecoder.runWithException(contextType);
                return this.channelsController.getContextForChannel({ commandId: generateCommandId(), channelId: this.id, contextType });
            });
        }
        addContextListener(contextType, handler) {
            return __awaiter(this, arguments, void 0, function* () {
                if (arguments.length === 1) {
                    if (typeof contextType !== "function") {
                        throw { message: ChannelError.AccessDenied, reason: `Expected function as an argument, got ${typeof contextType}` };
                    }
                    return this.channelsController.addContextListener({ commandId: generateCommandId(), handler: contextType, channelId: this.id });
                }
                const contextTypeDecoder = optionalNonEmptyStringDecoder.runWithException(contextType);
                if (typeof handler !== "function") {
                    throw { message: ChannelError.AccessDenied, reason: `Expected function as an argument, got ${typeof contextType}` };
                }
                return this.channelsController.addContextListener({
                    commandId: generateCommandId(),
                    contextType: contextTypeDecoder,
                    channelId: this.id,
                    handler,
                });
            });
        }
        onAddContextListener(handler) {
            if (typeof handler !== "function") {
                throw { message: ChannelError.AccessDenied, reason: `Expected function as an argument, got ${typeof handler}` };
            }
            const unsub = this.channelsController.addPrivateChannelEvent({
                commandId: generateCommandId(),
                action: PrivateChannelEventMethods.OnAddContextListener,
                channelId: this.id,
                handler
            });
            return AsyncListener(unsub);
        }
        onUnsubscribe(handler) {
            if (typeof handler !== "function") {
                throw { message: ChannelError.AccessDenied, reason: `Expected function as an argument, got ${typeof handler}` };
            }
            const unsub = this.channelsController.addPrivateChannelEvent({
                commandId: generateCommandId(),
                action: PrivateChannelEventMethods.OnUnsubscribe,
                channelId: this.id,
                handler
            });
            return AsyncListener(unsub);
        }
        onDisconnect(handler) {
            if (typeof handler !== "function") {
                throw { message: ChannelError.AccessDenied, reason: `Expected function as an argument, got ${typeof handler}` };
            }
            const unsub = this.channelsController.addPrivateChannelEvent({
                commandId: generateCommandId(),
                action: PrivateChannelEventMethods.OnDisconnect,
                channelId: this.id,
                handler
            });
            return AsyncListener(unsub);
        }
        disconnect() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.channelsController.announceDisconnect(generateCommandId(), this.id);
                this.unsubFromInstanceStopped();
            });
        }
    }

    class ChannelsFactory {
        constructor(createUserChannelFn, createAppChannel, createPrivateChannel) {
            this.createUserChannelFn = createUserChannelFn;
            this.createAppChannel = createAppChannel;
            this.createPrivateChannel = createPrivateChannel;
        }
        buildModel(data) {
            const { type } = data;
            if (type === ChannelTypes.User) {
                return this.buildUserChannel(data.displayMetadata.glueChannel);
            }
            else if (type === ChannelTypes.App) {
                return this.buildAppChannel(data.id);
            }
            else if (type === ChannelTypes.Private) {
                return this.buildPrivateChannel(data.id);
            }
            else {
                throw new Error("Pass one of the supported channel types: user, app, private");
            }
        }
        buildUserChannel(data) {
            return this.createUserChannelFn(data);
        }
        buildAppChannel(channelId) {
            return this.createAppChannel(channelId);
        }
        buildPrivateChannel(channelId) {
            return this.createPrivateChannel(channelId);
        }
    }

    function createRegistry(options) {
        if (options && options.errorHandling
            && typeof options.errorHandling !== "function"
            && options.errorHandling !== "log"
            && options.errorHandling !== "silent"
            && options.errorHandling !== "throw") {
            throw new Error("Invalid options passed to createRegistry. Prop errorHandling should be [\"log\" | \"silent\" | \"throw\" | (err) => void], but " + typeof options.errorHandling + " was passed");
        }
        var _userErrorHandler = options && typeof options.errorHandling === "function" && options.errorHandling;
        var callbacks = {};
        function add(key, callback, replayArgumentsArr) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                callbacksForKey = [];
                callbacks[key] = callbacksForKey;
            }
            callbacksForKey.push(callback);
            if (replayArgumentsArr) {
                setTimeout(function () {
                    replayArgumentsArr.forEach(function (replayArgument) {
                        var _a;
                        if ((_a = callbacks[key]) === null || _a === void 0 ? void 0 : _a.includes(callback)) {
                            try {
                                if (Array.isArray(replayArgument)) {
                                    callback.apply(undefined, replayArgument);
                                }
                                else {
                                    callback.apply(undefined, [replayArgument]);
                                }
                            }
                            catch (err) {
                                _handleError(err, key);
                            }
                        }
                    });
                }, 0);
            }
            return function () {
                var allForKey = callbacks[key];
                if (!allForKey) {
                    return;
                }
                allForKey = allForKey.reduce(function (acc, element, index) {
                    if (!(element === callback && acc.length === index)) {
                        acc.push(element);
                    }
                    return acc;
                }, []);
                if (allForKey.length === 0) {
                    delete callbacks[key];
                }
                else {
                    callbacks[key] = allForKey;
                }
            };
        }
        function execute(key) {
            var argumentsArr = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                argumentsArr[_i - 1] = arguments[_i];
            }
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey || callbacksForKey.length === 0) {
                return [];
            }
            var results = [];
            callbacksForKey.forEach(function (callback) {
                try {
                    var result = callback.apply(undefined, argumentsArr);
                    results.push(result);
                }
                catch (err) {
                    results.push(undefined);
                    _handleError(err, key);
                }
            });
            return results;
        }
        function _handleError(exceptionArtifact, key) {
            var errParam = exceptionArtifact instanceof Error ? exceptionArtifact : new Error(exceptionArtifact);
            if (_userErrorHandler) {
                _userErrorHandler(errParam);
                return;
            }
            var msg = "[ERROR] callback-registry: User callback for key \"" + key + "\" failed: " + errParam.stack;
            if (options) {
                switch (options.errorHandling) {
                    case "log":
                        return console.error(msg);
                    case "silent":
                        return;
                    case "throw":
                        throw new Error(msg);
                }
            }
            console.error(msg);
        }
        function clear() {
            callbacks = {};
        }
        function clearKey(key) {
            var callbacksForKey = callbacks[key];
            if (!callbacksForKey) {
                return;
            }
            delete callbacks[key];
        }
        return {
            add: add,
            execute: execute,
            clear: clear,
            clearKey: clearKey
        };
    }
    createRegistry.default = createRegistry;
    var lib = createRegistry;

    class ChannelsCallbackRegistry {
        constructor() {
            this.registry = lib();
        }
        add({ action, channelId, handler, replayArgs }) {
            return this.registry.add(`${action}-${channelId}`, handler, replayArgs);
        }
        invoke(action, argumentObj) {
            const { channelId, contextType } = argumentObj;
            this.registry.execute(`${action}-${channelId}`, contextType);
        }
    }

    class GlueEventsController {
        constructor(glueController, channelsCallbackRegistry) {
            this.glueController = glueController;
            this.channelsCallbackRegistry = channelsCallbackRegistry;
        }
        initialize() {
            return __awaiter(this, void 0, void 0, function* () {
                const isMethodRegisteredByThisApp = this.isSysMethodRegisteredByCurrentApp();
                if (isMethodRegisteredByThisApp) {
                    return;
                }
                yield this.glueController.registerMethod(Glue42FDC3SystemMethod, this.handleSystemMethodInvocation.bind(this));
            });
        }
        isSysMethodRegisteredByCurrentApp() {
            const methods = this.glueController.getInteropMethods(Glue42FDC3SystemMethod);
            const myId = this.glueController.getMyInteropInstanceId();
            const methodsByThisInstance = methods.filter(method => {
                return method.getServers().find(server => server.instance === myId)
                    ? method
                    : undefined;
            });
            return !!methodsByThisInstance.length;
        }
        handleSystemMethodInvocation(argumentObj) {
            const argsDecodeResult = SystemMethodInvocationArgumentDecoder.run(argumentObj);
            if (!argsDecodeResult.ok) {
                throw new Error(`Interop Method ${Glue42FDC3SystemMethod} invoked with invalid argument object - ${argsDecodeResult.error}.\n Expected ${JSON.stringify({ action: string, payload: { channelId: string, clientId: string } })}`);
            }
            const { action, payload } = argsDecodeResult.result;
            if (action === PrivateChannelEventMethods.OnDisconnect) {
                return this.handleOnDisconnect(payload);
            }
            if (action === PrivateChannelEventMethods.OnAddContextListener || action === PrivateChannelEventMethods.OnUnsubscribe) {
                return this.channelsCallbackRegistry.invoke(action, payload);
            }
        }
        handleOnDisconnect(payload) {
            if (payload.replayContextTypes) {
                this.invokeOnUnsubscribeHandlerMultipleTimes(payload);
            }
            this.channelsCallbackRegistry.invoke(PrivateChannelEventMethods.OnDisconnect, payload);
        }
        invokeOnUnsubscribeHandlerMultipleTimes(payload) {
            payload.replayContextTypes.forEach(contextType => {
                this.channelsCallbackRegistry.invoke(PrivateChannelEventMethods.OnUnsubscribe, { channelId: payload.channelId, clientId: payload.clientId, contextType });
            });
        }
    }

    class ChannelsPendingListenersStore {
        constructor() {
            this.pendingListeners = [];
        }
        createPendingListener(handler, contextType) {
            const id = nanoid();
            const unsubscribe = () => this.filterPendingListenersById(id);
            const listener = { unsubscribe };
            const setActualUnsub = (actualUnsub) => {
                listener.unsubscribe = actualUnsub;
            };
            this.pendingListeners.push({ id, handler, contextType, setActualUnsub, listener, unsubWithoutFilter: () => { } });
            return listener;
        }
        subscribePendingListeners(commandId, addContextListenerFn, channelId) {
            return __awaiter(this, void 0, void 0, function* () {
                const listeners = yield Promise.all(this.pendingListeners.map(pendingListener => {
                    const { handler, contextType } = pendingListener;
                    return addContextListenerFn({ commandId, handler, contextType, channelId });
                }));
                Object.values(this.pendingListeners).forEach(({ id, setActualUnsub, unsubWithoutFilter }, index) => {
                    unsubWithoutFilter = listeners[index].unsubscribe;
                    const un = () => {
                        this.filterPendingListenersById(id);
                        unsubWithoutFilter();
                    };
                    setActualUnsub(un);
                });
            });
        }
        unsubscribePendingListeners() {
            this.pendingListeners.forEach(({ id, setActualUnsub, unsubWithoutFilter }) => {
                unsubWithoutFilter();
                const newUnsub = () => this.filterPendingListenersById(id);
                setActualUnsub(newUnsub);
            });
        }
        filterPendingListenersById(id) {
            this.pendingListeners = this.pendingListeners.filter((listener) => listener.id !== id);
        }
    }

    class IoC {
        get ioc() {
            return this;
        }
        get eventReceiver() {
            if (!this._eventReceiver) {
                this._eventReceiver = new EventReceiver(this.glueController, this.eventDispatcher, this.eventsController);
            }
            return this._eventReceiver;
        }
        get glueController() {
            if (!this._glueController) {
                this._glueController = new GlueController(this.channelsParser);
            }
            return this._glueController;
        }
        get fdc3() {
            if (!this._fdc3) {
                this._fdc3 = this.desktopAgent.toApi();
            }
            return this._fdc3;
        }
        get eventDispatcher() {
            if (!this._eventDispatcher) {
                this._eventDispatcher = new EventDispatcher();
            }
            return this._eventDispatcher;
        }
        get channelsFactory() {
            if (!this._channelsFactory) {
                this._channelsFactory = new ChannelsFactory(this.createUserChannel.bind(this), this.createAppChannel.bind(this), this.createPrivateChannel.bind(this));
            }
            return this._channelsFactory;
        }
        createUserChannel(glueChannel) {
            return new UserChannel(this.channelsController, glueChannel).toApi();
        }
        createAppChannel(id) {
            return new AppChannel(this.channelsController, id).toApi();
        }
        createPrivateChannel(channelId) {
            return new PrivateChannel(this.channelsController, channelId).toApi();
        }
        get desktopAgent() {
            if (!this._desktopAgent) {
                this._desktopAgent = new DesktopAgent(this.intentsController, this.applicationController, this.channelsController);
            }
            return this._desktopAgent;
        }
        get channelsParser() {
            if (!this._channelsParser) {
                this._channelsParser = new ChannelsParser();
            }
            return this._channelsParser;
        }
        get intentsController() {
            if (!this._intentsController) {
                this._intentsController = new IntentsController(this.glueController, this.channelsController, this.channelsFactory);
            }
            return this._intentsController;
        }
        get applicationController() {
            if (!this._applicationController) {
                this._applicationController = new ApplicationsController(this.glueController);
            }
            return this._applicationController;
        }
        get channelsController() {
            if (!this._channelsController) {
                this._channelsController = new ChannelsController(this.glueController, this.channelsStateStore, this.channelsParser, this.channelsFactory, this.channelsCallbackRegistry, this.channelsPendingListenersStore);
            }
            return this._channelsController;
        }
        get channelsStateStore() {
            if (!this._channelsStateStore) {
                this._channelsStateStore = new ChannelsStateStore();
            }
            return this._channelsStateStore;
        }
        get channelsPendingListenersStore() {
            if (!this._channelsPendingListenersStore) {
                this._channelsPendingListenersStore = new ChannelsPendingListenersStore();
            }
            return this._channelsPendingListenersStore;
        }
        get channelsCallbackRegistry() {
            if (!this._channelsCallbackRegistry) {
                this._channelsCallbackRegistry = new ChannelsCallbackRegistry();
            }
            return this._channelsCallbackRegistry;
        }
        get eventsController() {
            if (!this._eventsController) {
                this._eventsController = new GlueEventsController(this.glueController, this.channelsCallbackRegistry);
            }
            return this._eventsController;
        }
    }

    const fdc3Factory = () => {
        const ioc = new IoC();
        ioc.glueController.createGluePromise();
        ioc.eventReceiver.start();
        return ioc.fdc3;
    };

    let globalFdc3 = window.fdc3;
    if (typeof globalFdc3 === "undefined") {
        globalFdc3 = fdc3Factory();
        checkIfInElectron(globalFdc3);
        window.fdc3 = globalFdc3;
    }
    else {
        console.warn("Defaulting to using the auto-injected fdc3.");
    }
    var globalFdc3$1 = globalFdc3;

    return globalFdc3$1;

}));
//# sourceMappingURL=fdc3.umd.js.map
