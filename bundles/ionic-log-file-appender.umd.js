(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@ionic-native/file'), require('ionic-angular'), require('lodash')) :
    typeof define === 'function' && define.amd ? define('ionic-log-file-appender', ['exports', '@angular/common', '@angular/core', '@ionic-native/file', 'ionic-angular', 'lodash'], factory) :
    (global = global || self, factory(global['ionic-log-file-appender'] = {}, global.ng.common, global.ng.core, global.file, global.IonicModule, global.lodash));
}(this, (function (exports, common, core, file, ionicAngular, lodash) { 'use strict';

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

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

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

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
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

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __createBinding(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }

    function __exportStar(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    /**
     * SmartMove Ionic rolling log file appender
     * CellTrack Systems Pty Ltd 2018
     */
    var LogProvider = /** @class */ (function () {
        function LogProvider(file, platform, datePipe) {
            this.file = file;
            this.platform = platform;
            this.datePipe = datePipe;
            this.fileLoggerReady = false;
            this.initFailed = false;
            this.queue = [];
            this.processing = false;
            this.defaultConfig = new LogProviderConfig({
                enableMetaLogging: false,
                logToConsole: false,
                logDateFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
                fileDateFormat: 'yyyy-MM-dd_HH-mm-ss-SSS',
                fileMaxLines: 2000,
                fileMaxSize: 1000000,
                totalLogSize: 5000000,
                baseDir: null,
                logDir: 'logs',
                logPrefix: 'log',
                devMode: false
            });
            this.config = this.defaultConfig;
        }
        /**
         * Initializes the file logger
         */
        /**
         * Initializes the file logger
         * @param {?} configuration
         * @return {?}
         */
        LogProvider.prototype.init = /**
         * Initializes the file logger
         * @param {?} configuration
         * @return {?}
         */
        function (configuration) {
            var _this = this;
            return this.platform.ready()
                .then(function () {
                _this.config = new LogProviderConfig(configuration);
                // Any configuration not specified will take the defaults
                // Any configuration not specified will take the defaults
                _this.config.merge(_this.defaultConfig);
                if (!_this.config.baseDir) {
                    // Can only initialise this after platform is ready
                    // Can only initialise this after platform is ready
                    _this.config.baseDir = _this.file.dataDirectory;
                }
                _this.debug_metaLog('LogProvider initialised with configuration: ' + JSON.stringify(_this.config));
                _this.fileLoggerReady = false;
                _this.debug_metaLog('Initialising file logger');
                _this.log('Initialising file logger');
                if (!_this.platform.is('cordova')) {
                    _this.debug_metaLog('Not initialising file logger as the it is not supported by the platform ' + _this.platform.url());
                    _this.initFailed = true;
                    return Promise.resolve();
                }
                _this.debug_metaLog('Data directory: ' + _this.config.baseDir);
                return _this.file.checkDir(_this.config.baseDir, _this.config.logDir)
                    .then(function () {
                    _this.debug_metaLog('Found logging directory');
                    return _this.initLogFile();
                })
                    .catch(function (err) {
                    _this.debug_metaLog('Could not find logging directory: ' + JSON.stringify(err));
                    return _this.createLogDir();
                });
            });
        };
        /**
         * @return {?}
         */
        LogProvider.prototype.isReady = /**
         * @return {?}
         */
        function () {
            return this.fileLoggerReady;
        };
        /**
         * Attempts to create the logging directory
         * @return {?}
         */
        LogProvider.prototype.createLogDir = /**
         * Attempts to create the logging directory
         * @return {?}
         */
        function () {
            var _this = this;
            this.debug_metaLog('Attempting to create logging directory');
            return this.file.createDir(this.config.baseDir, this.config.logDir, false)
                .then(function () {
                _this.debug_metaLog('Successfully created logging directory');
                return _this.initLogFile();
            })
                .catch(function (err) {
                _this.initFailed = true;
                _this.debug_metaLog('Failed to create logging directory: ' + JSON.stringify(err));
            });
        };
        /**
         * Attempts to initialise the current log file
         * @return {?} a promise upon completion or failure
         */
        LogProvider.prototype.initLogFile = /**
         * Attempts to initialise the current log file
         * @return {?} a promise upon completion or failure
         */
        function () {
            var _this = this;
            this.debug_metaLog('Attempting to initialise log file');
            return this.file.listDir(this.config.baseDir, this.config.logDir)
                .then(function (entries) {
                if (entries && entries.length > 0) {
                    _this.debug_metaLog(entries.length + ' existing log files found.');
                    return _this.cleanupFiles(entries);
                }
                else {
                    _this.debug_metaLog('No existing log files found.');
                    return _this.cleanupCompleted(null, 0, null);
                }
            })
                .catch(function (err) {
                _this.debug_metaLog('Failed to get file list: ' + JSON.stringify(err, Object.getOwnPropertyNames(err)));
                throw err;
            });
        };
        /**
         * Checks the total size of log files against the configured maximum size and deletes oldest if necessary
         * @param {?} entries the files found in the logging directory
         * @return {?}
         */
        LogProvider.prototype.cleanupFiles = /**
         * Checks the total size of log files against the configured maximum size and deletes oldest if necessary
         * @param {?} entries the files found in the logging directory
         * @return {?}
         */
        function (entries) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1, _a, total, calculated, sizeTotal, entries_1, entries_1_1, entry, size, lastEntry, e_1_1, failure_1, lastEntry;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.debug_metaLog('Starting cleanup of ' + entries.length + ' log files');
                            entries = lodash.filter(entries, function (entry) { return entry.isFile && entry.name && entry.name.startsWith(_this.config.logPrefix); });
                            if (entries.length === 0) {
                                return [2 /*return*/, this.cleanupCompleted(null, 0, null)
                                        .catch(function (err) {
                                        // Now we're well and truly buggered
                                        // Now we're well and truly buggered
                                        _this.initFailed = true;
                                        throw err;
                                    })];
                            }
                            entries = lodash.orderBy(entries, ['name'], ['asc']);
                            total = entries.length;
                            calculated = 0;
                            sizeTotal = 0;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 10, , 11]);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 7, 8, 9]);
                            entries_1 = __values(entries), entries_1_1 = entries_1.next();
                            _b.label = 3;
                        case 3:
                            if (!!entries_1_1.done) return [3 /*break*/, 6];
                            entry = entries_1_1.value;
                            return [4 /*yield*/, this.getFileSize(entry)];
                        case 4:
                            size = _b.sent();
                            // Calculate total size of log files
                            calculated++;
                            sizeTotal += size;
                            this.debug_metaLog('After ' + calculated + ' files, total size is ' + sizeTotal);
                            if (sizeTotal > this.config.totalLogSize) {
                                this.debug_metaLog('Total log file size exceeds limit: ' + sizeTotal);
                                return [2 /*return*/, this.maxSizeExceeded(entries, size)
                                        .catch(function (err) {
                                        // Now we're well and truly buggered
                                        // Now we're well and truly buggered
                                        _this.initFailed = true;
                                        throw err;
                                    })];
                            }
                            else if (calculated === total) {
                                this.debug_metaLog('Total log file size is ok: ' + sizeTotal);
                                lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
                                return [2 /*return*/, this.cleanupCompleted(lastEntry, size, null)
                                        .catch(function (err) {
                                        // Now we're well and truly buggered
                                        // Now we're well and truly buggered
                                        _this.initFailed = true;
                                        throw err;
                                    })];
                            }
                            _b.label = 5;
                        case 5:
                            entries_1_1 = entries_1.next();
                            return [3 /*break*/, 3];
                        case 6: return [3 /*break*/, 9];
                        case 7:
                            e_1_1 = _b.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 9];
                        case 8:
                            try {
                                if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                            return [7 /*endfinally*/];
                        case 9: return [3 /*break*/, 11];
                        case 10:
                            failure_1 = _b.sent();
                            lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
                            // Not much we can do except try to continue
                            return [2 /*return*/, this.cleanupCompleted(lastEntry, 0, failure_1)
                                    .catch(function (err) {
                                    // Now we're in real trouble
                                    // Now we're in real trouble
                                    _this.initFailed = true;
                                    throw err;
                                })];
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Wraps getMetadata in a Promise
         * @param {?} entry
         * @return {?} a promise
         */
        LogProvider.prototype.getFileSize = /**
         * Wraps getMetadata in a Promise
         * @param {?} entry
         * @return {?} a promise
         */
        function (entry) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            entry.getMetadata(function (metadata) {
                                resolve(metadata.size);
                            }, function (failure) {
                                reject('SEVERE ERROR: could not retrieve metadata. ' + JSON.stringify(failure));
                            });
                        })];
                });
            });
        };
        /**
         * Attempts to remove one file and recursively check total size again
         * @param {?} entries
         * @param {?} lastEntrySize
         * @return {?}
         */
        LogProvider.prototype.maxSizeExceeded = /**
         * Attempts to remove one file and recursively check total size again
         * @param {?} entries
         * @param {?} lastEntrySize
         * @return {?}
         */
        function (entries, lastEntrySize) {
            var _this = this;
            return this.removeFile(entries[0])
                .then(function () {
                _this.debug_metaLog('Entry successfully removed');
                // Remove oldest entry
                entries.shift();
                // Check again
                return _this.cleanupFiles(entries);
            })
                .catch(function (err) {
                var /** @type {?} */ lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
                // Not much we can do except try to continue
                return _this.cleanupCompleted(lastEntry, lastEntrySize, 'SEVERE ERROR: could not clean up old files. ' + err);
            });
        };
        /**
         * When file cleanup is completed, attempts to initialise config to point to current log file
         * @param {?} lastEntry The most recent existing log file
         * @param {?} lastEntrySize The size of the most recent existing log file
         * @param {?} error Any error to be logged after initialization
         * @return {?}
         */
        LogProvider.prototype.cleanupCompleted = /**
         * When file cleanup is completed, attempts to initialise config to point to current log file
         * @param {?} lastEntry The most recent existing log file
         * @param {?} lastEntrySize The size of the most recent existing log file
         * @param {?} error Any error to be logged after initialization
         * @return {?}
         */
        function (lastEntry, lastEntrySize, error) {
            var _this = this;
            this.debug_metaLog('Log file cleanup done');
            if (lastEntry && lastEntrySize < this.config.fileMaxSize) {
                this.currentFile = lastEntry;
                this.fileLoggerReady = true;
                if (error) {
                    this.log(error);
                }
                this.debug_metaLog('File logger initialised at existing file: ' + this.currentFile.fullPath);
                this.log('File logger initialised at existing file: ' + this.currentFile.name);
                return Promise.resolve();
            }
            else {
                this.debug_metaLog('Last file nonexistent or too large. Creating new log file');
                return this.createNextFile()
                    .then(function () {
                    _this.fileLoggerReady = true;
                    if (error) {
                        _this.log(error);
                    }
                    _this.debug_metaLog('File logger initialised at new file: ' + _this.currentFile.fullPath);
                    _this.log('File logger initialised at new file: ' + _this.currentFile.name);
                    return Promise.resolve();
                });
            }
        };
        /**
         * Attempts to remove a file
         * @param {?} entry
         * @return {?}
         */
        LogProvider.prototype.removeFile = /**
         * Attempts to remove a file
         * @param {?} entry
         * @return {?}
         */
        function (entry) {
            this.debug_metaLog('Removing file: ' + entry.fullPath);
            var /** @type {?} */ fullPath = entry.fullPath;
            var /** @type {?} */ path = fullPath.replace(entry.name, '');
            return this.file.removeFile(this.config.baseDir + path, entry.name);
        };
        /**
         * Puts the message on the queue for writing to file
         * @param {?} message
         * @param {?=} err
         * @return {?}
         */
        LogProvider.prototype.logInternal = /**
         * Puts the message on the queue for writing to file
         * @param {?} message
         * @param {?=} err
         * @return {?}
         */
        function (message, err) {
            var /** @type {?} */ date = new Date();
            var /** @type {?} */ dateString = this.datePipe.transform(date, this.config.logDateFormat);
            var /** @type {?} */ logMessage = '[' + dateString + '] ' + message + '\r\n';
            if (this.config.logToConsole) {
                if (err) {
                    console.error(logMessage);
                }
                else {
                    console.log(logMessage);
                }
            }
            if (this.initFailed) {
                this.debug_metaLog('File logger init has failed! Message discarded');
                return;
            }
            else {
                // Put the message on the queue
                this.queue.push(logMessage);
                if (this.fileLoggerReady) {
                    if (this.queue.length > 0 && !this.processing) {
                        this.processing = true;
                        this.doProcess();
                    }
                }
                else {
                    this.debug_metaLog('File logger is not ready! Message left on queue');
                }
            }
        };
        /**
         * Logs a message at info level
         * @param message
         */
        /**
         * Logs a message at info level
         * @param {?} message
         * @return {?}
         */
        LogProvider.prototype.log = /**
         * Logs a message at info level
         * @param {?} message
         * @return {?}
         */
        function (message) {
            this.logInternal(message, false);
        };
        /**
         * Developer-level logging
         * @param message
         */
        /**
         * Developer-level logging
         * @param {?} message
         * @return {?}
         */
        LogProvider.prototype.logDev = /**
         * Developer-level logging
         * @param {?} message
         * @return {?}
         */
        function (message) {
            if (this.config.devMode) {
                this.log('*DEBUG* ' + message);
            }
        };
        /**
         * Error-level logging with optional error object
         * @param message
         * @param error
         */
        /**
         * Error-level logging with optional error object
         * @param {?} message
         * @param {?=} error
         * @return {?}
         */
        LogProvider.prototype.err = /**
         * Error-level logging with optional error object
         * @param {?} message
         * @param {?=} error
         * @return {?}
         */
        function (message, error) {
            var /** @type {?} */ logMessage = 'ERROR! ' + message;
            if (error) {
                logMessage += ': ' + JSON.stringify(error, Object.getOwnPropertyNames(error));
            }
            this.logInternal(logMessage, true);
        };
        /**
         * Writes the current logging queue to file
         * @return {?}
         */
        LogProvider.prototype.doProcess = /**
         * Writes the current logging queue to file
         * @return {?}
         */
        function () {
            var _this = this;
            this.debug_metaLog('Beginning processing loop');
            this.processQueue()
                .then(function () {
                if (_this.queue.length > 0) {
                    _this.doProcess();
                }
                else {
                    _this.checkFileLength()
                        .then(function () {
                        _this.processing = false;
                    })
                        .catch(function (err) {
                        _this.debug_metaLog('Error checking file length: ' + JSON.stringify(err));
                        _this.processing = false;
                    });
                }
            })
                .catch(function (err) {
                _this.debug_metaLog('Error processing queue: ' + err);
                _this.processing = false;
            });
        };
        /**
         * Writes the oldest entry in the queue to file, then checks if file rollover is required
         * @return {?}
         */
        LogProvider.prototype.processQueue = /**
         * Writes the oldest entry in the queue to file, then checks if file rollover is required
         * @return {?}
         */
        function () {
            var _this = this;
            this.debug_metaLog('Processing queue of length ' + this.queue.length);
            if (this.queue.length > 0) {
                var /** @type {?} */ message = this.queue.shift();
                return this.file.writeFile(this.config.baseDir + '/' + this.config.logDir, this.currentFile.name, message, {
                    append: true,
                    replace: false
                })
                    .then(function () {
                    _this.lines++;
                    return _this.checkFileLength();
                })
                    .catch(function (err) {
                    _this.debug_metaLog('Error writing to file: ' + err);
                });
            }
            else {
                return Promise.resolve();
            }
        };
        /**
         * Checks the file length and creates a new file if required
         * @return {?}
         */
        LogProvider.prototype.checkFileLength = /**
         * Checks the file length and creates a new file if required
         * @return {?}
         */
        function () {
            if (this.lines >= this.config.fileMaxLines) {
                this.debug_metaLog('Creating new file as max number of log entries exceeded');
                return this.createNextFile();
            }
            else {
                return Promise.resolve();
            }
        };
        /**
         * Generates a log file name from the current time
         * @return {?}
         */
        LogProvider.prototype.createLogFileName = /**
         * Generates a log file name from the current time
         * @return {?}
         */
        function () {
            var /** @type {?} */ date = new Date();
            var /** @type {?} */ dateString = this.datePipe.transform(date, this.config.fileDateFormat);
            return this.config.logPrefix + '.' + dateString + '.log';
        };
        /**
         * Creates the next log file and updates the local reference
         * @return {?}
         */
        LogProvider.prototype.createNextFile = /**
         * Creates the next log file and updates the local reference
         * @return {?}
         */
        function () {
            var _this = this;
            var /** @type {?} */ fileName = this.createLogFileName();
            this.debug_metaLog('Attempting to create file at: ' + this.config.baseDir + this.config.logDir + '/' + fileName);
            return this.file.createFile(this.config.baseDir + '/' + this.config.logDir, fileName, true)
                .then(function (newFile) {
                _this.lines = 0;
                _this.currentFile = newFile;
                _this.debug_metaLog('Created new file: ' + _this.currentFile.fullPath);
            })
                .catch(function (err) {
                _this.debug_metaLog('Failed to create new file: ' + JSON.stringify(err));
            });
        };
        /**
         * Retrieves the current list of log files in the logging directory
         */
        /**
         * Retrieves the current list of log files in the logging directory
         * @return {?}
         */
        LogProvider.prototype.getLogFiles = /**
         * Retrieves the current list of log files in the logging directory
         * @return {?}
         */
        function () {
            this.debug_metaLog('Attempting to retrieve log files');
            if (this.initFailed) {
                this.debug_metaLog('Log never initialised so can\'t retrieve files');
                return Promise.resolve([]);
            }
            else {
                return this.file.listDir(this.config.baseDir, this.config.logDir);
            }
        };
        /**
         * @param {?} message
         * @return {?}
         */
        LogProvider.prototype.debug_metaLog = /**
         * @param {?} message
         * @return {?}
         */
        function (message) {
            if (this.config.enableMetaLogging) {
                console.log('**LOGGER_META**: ' + message);
            }
        };
        LogProvider.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        LogProvider.ctorParameters = function () { return [
            { type: file.File, },
            { type: ionicAngular.Platform, },
            { type: common.DatePipe, },
        ]; };
        return LogProvider;
    }());
    function LogProvider_tsickle_Closure_declarations() {
        /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
        LogProvider.decorators;
        /**
         * @nocollapse
         * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
         */
        LogProvider.ctorParameters;
        /** @type {?} */
        LogProvider.prototype.fileLoggerReady;
        /** @type {?} */
        LogProvider.prototype.initFailed;
        /** @type {?} */
        LogProvider.prototype.currentFile;
        /** @type {?} */
        LogProvider.prototype.lines;
        /** @type {?} */
        LogProvider.prototype.queue;
        /** @type {?} */
        LogProvider.prototype.processing;
        /** @type {?} */
        LogProvider.prototype.defaultConfig;
        /** @type {?} */
        LogProvider.prototype.config;
        /** @type {?} */
        LogProvider.prototype.file;
        /** @type {?} */
        LogProvider.prototype.platform;
        /** @type {?} */
        LogProvider.prototype.datePipe;
    }
    var LogProviderConfig = /** @class */ (function () {
        function LogProviderConfig(fields) {
            // Quick and dirty extend/assign fields to this model
            for (var /** @type {?} */ f in fields) {
                // @ts-ignore
                this[f] = fields[f];
            }
        }
        /**
         * Overrides this object's uninitialized fields with the passed parameter's fields
         * @param config
         */
        /**
         * Overrides this object's uninitialized fields with the passed parameter's fields
         * @param {?} config
         * @return {?}
         */
        LogProviderConfig.prototype.merge = /**
         * Overrides this object's uninitialized fields with the passed parameter's fields
         * @param {?} config
         * @return {?}
         */
        function (config) {
            for (var /** @type {?} */ k in config) {
                if (!(k in this)) {
                    this[k] = config[k];
                }
            }
        };
        return LogProviderConfig;
    }());
    function LogProviderConfig_tsickle_Closure_declarations() {
        /** @type {?} */
        LogProviderConfig.prototype.enableMetaLogging;
        /** @type {?} */
        LogProviderConfig.prototype.logToConsole;
        /** @type {?} */
        LogProviderConfig.prototype.logDateFormat;
        /** @type {?} */
        LogProviderConfig.prototype.fileDateFormat;
        /** @type {?} */
        LogProviderConfig.prototype.fileMaxLines;
        /** @type {?} */
        LogProviderConfig.prototype.fileMaxSize;
        /** @type {?} */
        LogProviderConfig.prototype.totalLogSize;
        /** @type {?} */
        LogProviderConfig.prototype.logDir;
        /** @type {?} */
        LogProviderConfig.prototype.baseDir;
        /** @type {?} */
        LogProviderConfig.prototype.logPrefix;
        /** @type {?} */
        LogProviderConfig.prototype.devMode;
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes} checked by tsc
     */
    var LogFileAppenderModule = /** @class */ (function () {
        function LogFileAppenderModule() {
        }
        /**
         * @return {?}
         */
        LogFileAppenderModule.forRoot = /**
         * @return {?}
         */
        function () {
            return {
                ngModule: LogFileAppenderModule,
                providers: [LogProvider]
            };
        };
        /**
         * @return {?}
         */
        LogFileAppenderModule.forChild = /**
         * @return {?}
         */
        function () {
            return {
                ngModule: LogFileAppenderModule,
                providers: [LogProvider]
            };
        };
        LogFileAppenderModule.decorators = [
            { type: core.NgModule, args: [{
                        imports: [common.CommonModule],
                        providers: [LogProvider]
                    },] },
        ];
        return LogFileAppenderModule;
    }());
    function LogFileAppenderModule_tsickle_Closure_declarations() {
        /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
        LogFileAppenderModule.decorators;
        /**
         * @nocollapse
         * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
         */
        LogFileAppenderModule.ctorParameters;
    }

    exports.LogFileAppenderModule = LogFileAppenderModule;
    exports.LogProvider = LogProvider;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ionic-log-file-appender.umd.js.map
