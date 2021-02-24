import { DatePipe, CommonModule } from '@angular/common';
import { Injectable, NgModule } from '@angular/core';
import { __awaiter, __generator, __values } from 'tslib';
import { File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';
import { filter, orderBy } from 'lodash';

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
                        entries = filter(entries, function (entry) { return entry.isFile && entry.name && entry.name.startsWith(_this.config.logPrefix); });
                        if (entries.length === 0) {
                            return [2 /*return*/, this.cleanupCompleted(null, 0, null)
                                    .catch(function (err) {
                                    // Now we're well and truly buggered
                                    // Now we're well and truly buggered
                                    _this.initFailed = true;
                                    throw err;
                                })];
                        }
                        entries = orderBy(entries, ['name'], ['asc']);
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
        { type: Injectable },
    ];
    /** @nocollapse */
    LogProvider.ctorParameters = function () { return [
        { type: File, },
        { type: Platform, },
        { type: DatePipe, },
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
        { type: NgModule, args: [{
                    imports: [CommonModule],
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { LogFileAppenderModule, LogProvider };
//# sourceMappingURL=ionic-log-file-appender.js.map
