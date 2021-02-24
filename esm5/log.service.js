/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import * as tslib_1 from "tslib";
import { DatePipe } from '@angular/common';
import { File } from '@ionic-native/file';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import * as _ from 'lodash';
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_1, _a, total, calculated, sizeTotal, entries_1, entries_1_1, entry, size, lastEntry, e_1_1, failure_1, lastEntry;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.debug_metaLog('Starting cleanup of ' + entries.length + ' log files');
                        entries = _.filter(entries, function (entry) { return entry.isFile && entry.name && entry.name.startsWith(_this.config.logPrefix); });
                        if (entries.length === 0) {
                            return [2 /*return*/, this.cleanupCompleted(null, 0, null)
                                    .catch(function (err) {
                                    // Now we're well and truly buggered
                                    // Now we're well and truly buggered
                                    _this.initFailed = true;
                                    throw err;
                                })];
                        }
                        entries = _.orderBy(entries, ['name'], ['asc']);
                        total = entries.length;
                        calculated = 0;
                        sizeTotal = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, , 11]);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 9]);
                        entries_1 = tslib_1.__values(entries), entries_1_1 = entries_1.next();
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
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
export { LogProvider };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9pb25pYy1sb2ctZmlsZS1hcHBlbmRlci8iLCJzb3VyY2VzIjpbImxvZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBUSxJQUFJLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUE7Ozs7OztJQXFCdkIscUJBQW9CLElBQVUsRUFDVixVQUNBO1FBRkEsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUNWLGFBQVEsR0FBUixRQUFRO1FBQ1IsYUFBUSxHQUFSLFFBQVE7K0JBYkYsS0FBSzswQkFDVixLQUFLO3FCQUdBLEVBQUU7MEJBQ1AsS0FBSztRQVN0QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksaUJBQWlCLENBQUM7WUFDdkMsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixZQUFZLEVBQUUsS0FBSztZQUNuQixhQUFhLEVBQUUseUJBQXlCO1lBQ3hDLGNBQWMsRUFBRSx5QkFBeUI7WUFDekMsWUFBWSxFQUFFLElBQUk7WUFDbEIsV0FBVyxFQUFFLE9BQU87WUFDcEIsWUFBWSxFQUFFLE9BQU87WUFDckIsT0FBTyxFQUFFLElBQUk7WUFDYixNQUFNLEVBQUUsTUFBTTtZQUNkLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLE9BQU8sRUFBRSxLQUFLO1NBQ2pCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUNwQztJQUVEOztPQUVHOzs7Ozs7SUFDSCwwQkFBSTs7Ozs7SUFBSixVQUFLLGFBQWlDO1FBQXRDLGlCQStCQztRQTlCRyxPQUFP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QyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDckI7U0FDRjtLQUNGOzRCQXRlTDtJQXVlQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEYXRlUGlwZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtFbnRyeSwgRmlsZX0gZnJvbSAnQGlvbmljLW5hdGl2ZS9maWxlJztcclxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnaW9uaWMtYW5ndWxhcic7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJ1xyXG5pbXBvcnQge0lMb2dQcm92aWRlckNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xyXG5cclxuLyoqXHJcbiAqIFNtYXJ0TW92ZSBJb25pYyByb2xsaW5nIGxvZyBmaWxlIGFwcGVuZGVyXHJcbiAqIENlbGxUcmFjayBTeXN0ZW1zIFB0eSBMdGQgMjAxOFxyXG4gKi9cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgTG9nUHJvdmlkZXIge1xyXG5cclxuICAgIHByaXZhdGUgZmlsZUxvZ2dlclJlYWR5ID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGluaXRGYWlsZWQgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgY3VycmVudEZpbGU6IEVudHJ5O1xyXG4gICAgcHJpdmF0ZSBsaW5lczogMDtcclxuICAgIHByaXZhdGUgcXVldWU6IHN0cmluZ1tdID0gW107XHJcbiAgICBwcml2YXRlIHByb2Nlc3NpbmcgPSBmYWxzZTtcclxuXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRlZmF1bHRDb25maWc6IExvZ1Byb3ZpZGVyQ29uZmlnO1xyXG5cclxuICAgIHByaXZhdGUgY29uZmlnOiBMb2dQcm92aWRlckNvbmZpZztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZpbGU6IEZpbGUsXHJcbiAgICAgICAgICAgICAgICBwcml2YXRlIHBsYXRmb3JtOiBQbGF0Zm9ybSxcclxuICAgICAgICAgICAgICAgIHByaXZhdGUgZGF0ZVBpcGU6IERhdGVQaXBlKSB7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Q29uZmlnID0gbmV3IExvZ1Byb3ZpZGVyQ29uZmlnKHtcclxuICAgICAgICAgICAgZW5hYmxlTWV0YUxvZ2dpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dUb0NvbnNvbGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBsb2dEYXRlRm9ybWF0OiAneXl5eS1NTS1kZCBISDptbTpzcy5TU1MnLFxyXG4gICAgICAgICAgICBmaWxlRGF0ZUZvcm1hdDogJ3l5eXktTU0tZGRfSEgtbW0tc3MtU1NTJyxcclxuICAgICAgICAgICAgZmlsZU1heExpbmVzOiAyMDAwLFxyXG4gICAgICAgICAgICBmaWxlTWF4U2l6ZTogMTAwMDAwMCxcclxuICAgICAgICAgICAgdG90YWxMb2dTaXplOiA1MDAwMDAwLFxyXG4gICAgICAgICAgICBiYXNlRGlyOiBudWxsLFxyXG4gICAgICAgICAgICBsb2dEaXI6ICdsb2dzJyxcclxuICAgICAgICAgICAgbG9nUHJlZml4OiAnbG9nJyxcclxuICAgICAgICAgICAgZGV2TW9kZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMuZGVmYXVsdENvbmZpZztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemVzIHRoZSBmaWxlIGxvZ2dlclxyXG4gICAgICovXHJcbiAgICBpbml0KGNvbmZpZ3VyYXRpb246IElMb2dQcm92aWRlckNvbmZpZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGxhdGZvcm0ucmVhZHkoKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZyA9IG5ldyBMb2dQcm92aWRlckNvbmZpZyhjb25maWd1cmF0aW9uKTtcclxuICAgICAgICAgICAgICAgIC8vIEFueSBjb25maWd1cmF0aW9uIG5vdCBzcGVjaWZpZWQgd2lsbCB0YWtlIHRoZSBkZWZhdWx0c1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubWVyZ2UodGhpcy5kZWZhdWx0Q29uZmlnKTtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWcuYmFzZURpcikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENhbiBvbmx5IGluaXRpYWxpc2UgdGhpcyBhZnRlciBwbGF0Zm9ybSBpcyByZWFkeVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmJhc2VEaXIgPSB0aGlzLmZpbGUuZGF0YURpcmVjdG9yeTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnTG9nUHJvdmlkZXIgaW5pdGlhbGlzZWQgd2l0aCBjb25maWd1cmF0aW9uOiAnICsgSlNPTi5zdHJpbmdpZnkodGhpcy5jb25maWcpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsZUxvZ2dlclJlYWR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0luaXRpYWxpc2luZyBmaWxlIGxvZ2dlcicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2coJ0luaXRpYWxpc2luZyBmaWxlIGxvZ2dlcicpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBsYXRmb3JtLmlzKCdjb3Jkb3ZhJykpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdOb3QgaW5pdGlhbGlzaW5nIGZpbGUgbG9nZ2VyIGFzIHRoZSBpdCBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBwbGF0Zm9ybSAnICsgdGhpcy5wbGF0Zm9ybS51cmwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0RhdGEgZGlyZWN0b3J5OiAnICsgdGhpcy5jb25maWcuYmFzZURpcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlLmNoZWNrRGlyKHRoaXMuY29uZmlnLmJhc2VEaXIsIHRoaXMuY29uZmlnLmxvZ0RpcilcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnRm91bmQgbG9nZ2luZyBkaXJlY3RvcnknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5pdExvZ0ZpbGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0NvdWxkIG5vdCBmaW5kIGxvZ2dpbmcgZGlyZWN0b3J5OiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUxvZ0RpcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlzUmVhZHkoKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZpbGVMb2dnZXJSZWFkeTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGVtcHRzIHRvIGNyZWF0ZSB0aGUgbG9nZ2luZyBkaXJlY3RvcnlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjcmVhdGVMb2dEaXIoKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0F0dGVtcHRpbmcgdG8gY3JlYXRlIGxvZ2dpbmcgZGlyZWN0b3J5Jyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5jcmVhdGVEaXIodGhpcy5jb25maWcuYmFzZURpciwgdGhpcy5jb25maWcubG9nRGlyLCBmYWxzZSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdTdWNjZXNzZnVsbHkgY3JlYXRlZCBsb2dnaW5nIGRpcmVjdG9yeScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5pdExvZ0ZpbGUoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRGYWlsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdGYWlsZWQgdG8gY3JlYXRlIGxvZ2dpbmcgZGlyZWN0b3J5OiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0ZW1wdHMgdG8gaW5pdGlhbGlzZSB0aGUgY3VycmVudCBsb2cgZmlsZVxyXG4gICAgICogQHJldHVybnMgYSBwcm9taXNlIHVwb24gY29tcGxldGlvbiBvciBmYWlsdXJlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaW5pdExvZ0ZpbGUoKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0F0dGVtcHRpbmcgdG8gaW5pdGlhbGlzZSBsb2cgZmlsZScpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUubGlzdERpcih0aGlzLmNvbmZpZy5iYXNlRGlyLCB0aGlzLmNvbmZpZy5sb2dEaXIpXHJcbiAgICAgICAgICAgIC50aGVuKChlbnRyaWVzOiBFbnRyeVtdKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZW50cmllcyAmJiBlbnRyaWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coZW50cmllcy5sZW5ndGggKyAnIGV4aXN0aW5nIGxvZyBmaWxlcyBmb3VuZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbnVwRmlsZXMoZW50cmllcyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnTm8gZXhpc3RpbmcgbG9nIGZpbGVzIGZvdW5kLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFudXBDb21wbGV0ZWQobnVsbCwgMCwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdGYWlsZWQgdG8gZ2V0IGZpbGUgbGlzdDogJyArIEpTT04uc3RyaW5naWZ5KGVyciwgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZXJyKSkpO1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB0aGUgdG90YWwgc2l6ZSBvZiBsb2cgZmlsZXMgYWdhaW5zdCB0aGUgY29uZmlndXJlZCBtYXhpbXVtIHNpemUgYW5kIGRlbGV0ZXMgb2xkZXN0IGlmIG5lY2Vzc2FyeVxyXG4gICAgICogQHBhcmFtIGVudHJpZXMgdGhlIGZpbGVzIGZvdW5kIGluIHRoZSBsb2dnaW5nIGRpcmVjdG9yeVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFzeW5jIGNsZWFudXBGaWxlcyhlbnRyaWVzOiBFbnRyeVtdKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ1N0YXJ0aW5nIGNsZWFudXAgb2YgJyArIGVudHJpZXMubGVuZ3RoICsgJyBsb2cgZmlsZXMnKTtcclxuICAgICAgICBlbnRyaWVzID0gXy5maWx0ZXIoZW50cmllcywgKGVudHJ5OiBFbnRyeSkgPT4gZW50cnkuaXNGaWxlICYmIGVudHJ5Lm5hbWUgJiYgZW50cnkubmFtZS5zdGFydHNXaXRoKHRoaXMuY29uZmlnLmxvZ1ByZWZpeCkpO1xyXG4gICAgICAgIGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbnVwQ29tcGxldGVkKG51bGwsIDAsIG51bGwpXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgLy8gTm93IHdlJ3JlIHdlbGwgYW5kIHRydWx5IGJ1Z2dlcmVkXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEZhaWxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbnRyaWVzID0gXy5vcmRlckJ5KGVudHJpZXMsIFsnbmFtZSddLFsnYXNjJ10pO1xyXG4gICAgICAgIGxldCB0b3RhbCA9IGVudHJpZXMubGVuZ3RoO1xyXG4gICAgICAgIGxldCBjYWxjdWxhdGVkID0gMDtcclxuICAgICAgICBsZXQgc2l6ZVRvdGFsID0gMDtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBMb29wIG92ZXIgZW50cmllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzaXplID0gYXdhaXQgdGhpcy5nZXRGaWxlU2l6ZShlbnRyeSk7XHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdG90YWwgc2l6ZSBvZiBsb2cgZmlsZXNcclxuICAgICAgICAgICAgICAgIGNhbGN1bGF0ZWQrKztcclxuICAgICAgICAgICAgICAgIHNpemVUb3RhbCArPSBzaXplO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdBZnRlciAnICsgY2FsY3VsYXRlZCArICcgZmlsZXMsIHRvdGFsIHNpemUgaXMgJyArIHNpemVUb3RhbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZVRvdGFsID4gdGhpcy5jb25maWcudG90YWxMb2dTaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdUb3RhbCBsb2cgZmlsZSBzaXplIGV4Y2VlZHMgbGltaXQ6ICcgKyBzaXplVG90YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heFNpemVFeGNlZWRlZChlbnRyaWVzLCBzaXplKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3cgd2UncmUgd2VsbCBhbmQgdHJ1bHkgYnVnZ2VyZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRGYWlsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNhbGN1bGF0ZWQgPT09IHRvdGFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdUb3RhbCBsb2cgZmlsZSBzaXplIGlzIG9rOiAnICsgc2l6ZVRvdGFsKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBCZWxvdyBtYXggc2l6ZSwgc28gd2UncmUgcmVhZHkgdG8gZ29cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0RW50cnkgPSBlbnRyaWVzLmxlbmd0aCA+IDAgPyBlbnRyaWVzW2VudHJpZXMubGVuZ3RoIC0gMV0gOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFudXBDb21wbGV0ZWQobGFzdEVudHJ5LCBzaXplLCBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3cgd2UncmUgd2VsbCBhbmQgdHJ1bHkgYnVnZ2VyZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRGYWlsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoKGZhaWx1cmUpIHtcclxuICAgICAgICAgICAgY29uc3QgbGFzdEVudHJ5ID0gZW50cmllcy5sZW5ndGggPiAwID8gZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdIDogbnVsbDtcclxuICAgICAgICAgICAgLy8gTm90IG11Y2ggd2UgY2FuIGRvIGV4Y2VwdCB0cnkgdG8gY29udGludWVcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW51cENvbXBsZXRlZChsYXN0RW50cnksIDAsIGZhaWx1cmUpXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBOb3cgd2UncmUgaW4gcmVhbCB0cm91YmxlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdyYXBzIGdldE1ldGFkYXRhIGluIGEgUHJvbWlzZVxyXG4gICAqIEBwYXJhbSBlbnRyeVxyXG4gICAqIEByZXR1cm5zIGEgcHJvbWlzZVxyXG4gICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRGaWxlU2l6ZShlbnRyeTogRW50cnkpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6ICgobnVtYmVyKSA9PiB2b2lkKSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGVudHJ5LmdldE1ldGFkYXRhKG1ldGFkYXRhID0+IHtcclxuICAgICAgICAgIHJlc29sdmUobWV0YWRhdGEuc2l6ZSk7XHJcbiAgICAgICAgfSwgZmFpbHVyZSA9PiB7XHJcbiAgICAgICAgICByZWplY3QoJ1NFVkVSRSBFUlJPUjogY291bGQgbm90IHJldHJpZXZlIG1ldGFkYXRhLiAnICsgSlNPTi5zdHJpbmdpZnkoZmFpbHVyZSkpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0ZW1wdHMgdG8gcmVtb3ZlIG9uZSBmaWxlIGFuZCByZWN1cnNpdmVseSBjaGVjayB0b3RhbCBzaXplIGFnYWluXHJcbiAgICAgKiBAcGFyYW0gZW50cmllc1xyXG4gICAgICogQHBhcmFtIGxhc3RFbnRyeVNpemVcclxuICAgICAqIEBwYXJhbSByZXNvbHZlXHJcbiAgICAgKiBAcGFyYW0gcmVqZWN0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgbWF4U2l6ZUV4Y2VlZGVkKGVudHJpZXM6IEVudHJ5W10sIGxhc3RFbnRyeVNpemU6IG51bWJlcik6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlRmlsZShlbnRyaWVzWzBdKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0VudHJ5IHN1Y2Nlc3NmdWxseSByZW1vdmVkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgb2xkZXN0IGVudHJ5XHJcbiAgICAgICAgICAgICAgICBlbnRyaWVzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBhZ2FpblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW51cEZpbGVzKGVudHJpZXMpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RFbnRyeSA9IGVudHJpZXMubGVuZ3RoID4gMCA/IGVudHJpZXNbZW50cmllcy5sZW5ndGggLSAxXSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICAvLyBOb3QgbXVjaCB3ZSBjYW4gZG8gZXhjZXB0IHRyeSB0byBjb250aW51ZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW51cENvbXBsZXRlZChsYXN0RW50cnksIGxhc3RFbnRyeVNpemUsICdTRVZFUkUgRVJST1I6IGNvdWxkIG5vdCBjbGVhbiB1cCBvbGQgZmlsZXMuICcgKyBlcnIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiBmaWxlIGNsZWFudXAgaXMgY29tcGxldGVkLCBhdHRlbXB0cyB0byBpbml0aWFsaXNlIGNvbmZpZyB0byBwb2ludCB0byBjdXJyZW50IGxvZyBmaWxlXHJcbiAgICAgKiBAcGFyYW0gbGFzdEVudHJ5IFRoZSBtb3N0IHJlY2VudCBleGlzdGluZyBsb2cgZmlsZVxyXG4gICAgICogQHBhcmFtIGxhc3RFbnRyeVNpemUgVGhlIHNpemUgb2YgdGhlIG1vc3QgcmVjZW50IGV4aXN0aW5nIGxvZyBmaWxlXHJcbiAgICAgKiBAcGFyYW0gZXJyb3IgQW55IGVycm9yIHRvIGJlIGxvZ2dlZCBhZnRlciBpbml0aWFsaXphdGlvblxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNsZWFudXBDb21wbGV0ZWQobGFzdEVudHJ5OiBFbnRyeSwgbGFzdEVudHJ5U2l6ZTogbnVtYmVyLCBlcnJvcjogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0xvZyBmaWxlIGNsZWFudXAgZG9uZScpO1xyXG4gICAgICAgIGlmIChsYXN0RW50cnkgJiYgbGFzdEVudHJ5U2l6ZSA8IHRoaXMuY29uZmlnLmZpbGVNYXhTaXplKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEZpbGUgPSBsYXN0RW50cnk7XHJcbiAgICAgICAgICAgIHRoaXMuZmlsZUxvZ2dlclJlYWR5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdGaWxlIGxvZ2dlciBpbml0aWFsaXNlZCBhdCBleGlzdGluZyBmaWxlOiAnICsgdGhpcy5jdXJyZW50RmlsZS5mdWxsUGF0aCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9nKCdGaWxlIGxvZ2dlciBpbml0aWFsaXNlZCBhdCBleGlzdGluZyBmaWxlOiAnICsgdGhpcy5jdXJyZW50RmlsZS5uYW1lKTtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnTGFzdCBmaWxlIG5vbmV4aXN0ZW50IG9yIHRvbyBsYXJnZS4gQ3JlYXRpbmcgbmV3IGxvZyBmaWxlJyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5leHRGaWxlKClcclxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGVMb2dnZXJSZWFkeSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdGaWxlIGxvZ2dlciBpbml0aWFsaXNlZCBhdCBuZXcgZmlsZTogJyArIHRoaXMuY3VycmVudEZpbGUuZnVsbFBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nKCdGaWxlIGxvZ2dlciBpbml0aWFsaXNlZCBhdCBuZXcgZmlsZTogJyArIHRoaXMuY3VycmVudEZpbGUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0ZW1wdHMgdG8gcmVtb3ZlIGEgZmlsZVxyXG4gICAgICogQHBhcmFtIGVudHJ5XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcmVtb3ZlRmlsZShlbnRyeTogRW50cnkpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnUmVtb3ZpbmcgZmlsZTogJyArIGVudHJ5LmZ1bGxQYXRoKTtcclxuICAgICAgICBjb25zdCBmdWxsUGF0aCA9IGVudHJ5LmZ1bGxQYXRoO1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSBmdWxsUGF0aC5yZXBsYWNlKGVudHJ5Lm5hbWUsICcnKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxlLnJlbW92ZUZpbGUodGhpcy5jb25maWcuYmFzZURpciArIHBhdGgsIGVudHJ5Lm5hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHV0cyB0aGUgbWVzc2FnZSBvbiB0aGUgcXVldWUgZm9yIHdyaXRpbmcgdG8gZmlsZVxyXG4gICAgICogQHBhcmFtIG1lc3NhZ2VcclxuICAgICAqIEBwYXJhbSBlcnIuIElmIHRydWUsIGxvZ2dpbmcgaXMgYXQgZXJyb3IgbGV2ZWxcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBsb2dJbnRlcm5hbChtZXNzYWdlOiBzdHJpbmcsIGVycj86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBjb25zdCBkYXRlU3RyaW5nID0gdGhpcy5kYXRlUGlwZS50cmFuc2Zvcm0oZGF0ZSwgdGhpcy5jb25maWcubG9nRGF0ZUZvcm1hdCk7XHJcbiAgICAgICAgY29uc3QgbG9nTWVzc2FnZSA9ICdbJyArIGRhdGVTdHJpbmcgKyAnXSAnICsgbWVzc2FnZSArICdcXHJcXG4nO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5sb2dUb0NvbnNvbGUpIHtcclxuICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobG9nTWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cobG9nTWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdEZhaWxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0ZpbGUgbG9nZ2VyIGluaXQgaGFzIGZhaWxlZCEgTWVzc2FnZSBkaXNjYXJkZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFB1dCB0aGUgbWVzc2FnZSBvbiB0aGUgcXVldWVcclxuICAgICAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGxvZ01lc3NhZ2UpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5maWxlTG9nZ2VyUmVhZHkpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA+IDAgJiYgIXRoaXMucHJvY2Vzc2luZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb1Byb2Nlc3MoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnRmlsZSBsb2dnZXIgaXMgbm90IHJlYWR5ISBNZXNzYWdlIGxlZnQgb24gcXVldWUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvZ3MgYSBtZXNzYWdlIGF0IGluZm8gbGV2ZWxcclxuICAgICAqIEBwYXJhbSBtZXNzYWdlXHJcbiAgICAgKi9cclxuICAgIGxvZyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgdGhpcy5sb2dJbnRlcm5hbChtZXNzYWdlLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXZlbG9wZXItbGV2ZWwgbG9nZ2luZ1xyXG4gICAgICogQHBhcmFtIG1lc3NhZ2VcclxuICAgICAqL1xyXG4gICAgbG9nRGV2KG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5kZXZNb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nKCcqREVCVUcqICcgKyBtZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVycm9yLWxldmVsIGxvZ2dpbmcgd2l0aCBvcHRpb25hbCBlcnJvciBvYmplY3RcclxuICAgKiBAcGFyYW0gbWVzc2FnZVxyXG4gICAqIEBwYXJhbSBlcnJvclxyXG4gICAqL1xyXG4gICAgZXJyKG1lc3NhZ2U6IHN0cmluZywgZXJyb3I/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBsZXQgbG9nTWVzc2FnZSA9ICdFUlJPUiEgJyArIG1lc3NhZ2U7XHJcbiAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGxvZ01lc3NhZ2UgKz0gJzogJyArIEpTT04uc3RyaW5naWZ5KGVycm9yLCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhlcnJvcikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxvZ0ludGVybmFsKGxvZ01lc3NhZ2UsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV3JpdGVzIHRoZSBjdXJyZW50IGxvZ2dpbmcgcXVldWUgdG8gZmlsZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGRvUHJvY2VzcygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0JlZ2lubmluZyBwcm9jZXNzaW5nIGxvb3AnKTtcclxuICAgICAgICB0aGlzLnByb2Nlc3NRdWV1ZSgpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvUHJvY2VzcygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrRmlsZUxlbmd0aCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnRXJyb3IgY2hlY2tpbmcgZmlsZSBsZW5ndGg6ICcgKyBKU09OLnN0cmluZ2lmeShlcnIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdFcnJvciBwcm9jZXNzaW5nIHF1ZXVlOiAnICsgZXJyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdyaXRlcyB0aGUgb2xkZXN0IGVudHJ5IGluIHRoZSBxdWV1ZSB0byBmaWxlLCB0aGVuIGNoZWNrcyBpZiBmaWxlIHJvbGxvdmVyIGlzIHJlcXVpcmVkXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgcHJvY2Vzc1F1ZXVlKCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdQcm9jZXNzaW5nIHF1ZXVlIG9mIGxlbmd0aCAnICsgdGhpcy5xdWV1ZS5sZW5ndGgpO1xyXG4gICAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHRoaXMucXVldWUuc2hpZnQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS53cml0ZUZpbGUodGhpcy5jb25maWcuYmFzZURpciArICcvJyArIHRoaXMuY29uZmlnLmxvZ0RpciwgdGhpcy5jdXJyZW50RmlsZS5uYW1lLCBtZXNzYWdlLCB7XHJcbiAgICAgICAgICAgICAgICBhcHBlbmQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXBsYWNlOiBmYWxzZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGluZXMrKztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0ZpbGVMZW5ndGgoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0Vycm9yIHdyaXRpbmcgdG8gZmlsZTogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB0aGUgZmlsZSBsZW5ndGggYW5kIGNyZWF0ZXMgYSBuZXcgZmlsZSBpZiByZXF1aXJlZFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNoZWNrRmlsZUxlbmd0aCgpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGlmICh0aGlzLmxpbmVzID49IHRoaXMuY29uZmlnLmZpbGVNYXhMaW5lcykge1xyXG4gICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0NyZWF0aW5nIG5ldyBmaWxlIGFzIG1heCBudW1iZXIgb2YgbG9nIGVudHJpZXMgZXhjZWVkZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV4dEZpbGUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGVzIGEgbG9nIGZpbGUgbmFtZSBmcm9tIHRoZSBjdXJyZW50IHRpbWVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjcmVhdGVMb2dGaWxlTmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGNvbnN0IGRhdGVTdHJpbmcgPXRoaXMuZGF0ZVBpcGUudHJhbnNmb3JtKGRhdGUsIHRoaXMuY29uZmlnLmZpbGVEYXRlRm9ybWF0KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcubG9nUHJlZml4ICsgJy4nICsgZGF0ZVN0cmluZyArICcubG9nJ1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyB0aGUgbmV4dCBsb2cgZmlsZSBhbmQgdXBkYXRlcyB0aGUgbG9jYWwgcmVmZXJlbmNlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY3JlYXRlTmV4dEZpbGUoKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHRoaXMuY3JlYXRlTG9nRmlsZU5hbWUoKTtcclxuICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0F0dGVtcHRpbmcgdG8gY3JlYXRlIGZpbGUgYXQ6ICcgKyB0aGlzLmNvbmZpZy5iYXNlRGlyICsgdGhpcy5jb25maWcubG9nRGlyICsgJy8nICsgZmlsZU5hbWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuY3JlYXRlRmlsZSh0aGlzLmNvbmZpZy5iYXNlRGlyICsgJy8nICsgdGhpcy5jb25maWcubG9nRGlyLCBmaWxlTmFtZSwgdHJ1ZSlcclxuICAgICAgICAgICAgLnRoZW4obmV3RmlsZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmVzID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEZpbGUgPSBuZXdGaWxlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdDcmVhdGVkIG5ldyBmaWxlOiAnICsgdGhpcy5jdXJyZW50RmlsZS5mdWxsUGF0aCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdGYWlsZWQgdG8gY3JlYXRlIG5ldyBmaWxlOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IGxpc3Qgb2YgbG9nIGZpbGVzIGluIHRoZSBsb2dnaW5nIGRpcmVjdG9yeVxyXG4gICAgICovXHJcbiAgICBnZXRMb2dGaWxlcygpOiBQcm9taXNlPEVudHJ5W10+IHtcclxuICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0F0dGVtcHRpbmcgdG8gcmV0cmlldmUgbG9nIGZpbGVzJyk7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdEZhaWxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0xvZyBuZXZlciBpbml0aWFsaXNlZCBzbyBjYW5cXCd0IHJldHJpZXZlIGZpbGVzJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGUubGlzdERpcih0aGlzLmNvbmZpZy5iYXNlRGlyLCB0aGlzLmNvbmZpZy5sb2dEaXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRlYnVnX21ldGFMb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmVuYWJsZU1ldGFMb2dnaW5nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcqKkxPR0dFUl9NRVRBKio6ICcgKyBtZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIExvZ1Byb3ZpZGVyQ29uZmlnIGltcGxlbWVudHMgSUxvZ1Byb3ZpZGVyQ29uZmlnIHtcclxuICAgIC8vIElmIHRydWUsIGxvZ3MgdmVyYm9zZSBkZXRhaWxzIG9mIGZpbGUgbG9nZ2luZyBvcGVyYXRpb25zIHRvIGNvbnNvbGVcclxuICAgIGVuYWJsZU1ldGFMb2dnaW5nOiBib29sZWFuO1xyXG5cclxuICAgIC8vIElmIHRydWUsIGFsbCBmaWxlIGxvZyBtZXNzYWdlcyBhbHNvIGFwcGVhciBpbiB0aGUgY29uc29sZVxyXG4gICAgbG9nVG9Db25zb2xlOiBib29sZWFuO1xyXG5cclxuICAgIC8vIERhdGUgZm9ybWF0IHVzZWQgaW4gbG9nIHN0YXRlbWVudHNcclxuICAgIGxvZ0RhdGVGb3JtYXQ6IHN0cmluZztcclxuXHJcbiAgICAvLyBEYXRlIGZvcm1hdCB1c2VkIGluIGxvZyBmaWxlIG5hbWVzLlxyXG4gICAgLy8gTk9URTogYmUgY2FyZWZ1bCB3aXRoIHNwZWNpYWwgY2hhcmFjdGVycyBsaWtlICc6JyBhcyB0aGlzIGNhbiBjYXVzZSBmaWxlIHN5c3RlbSBpc3N1ZXNcclxuICAgIGZpbGVEYXRlRm9ybWF0OiBzdHJpbmc7XHJcblxyXG4gICAgLy8gTWF4aW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgYmVmb3JlIGZpbGUgcm9sbG92ZXJcclxuICAgIGZpbGVNYXhMaW5lczogbnVtYmVyO1xyXG5cclxuICAgIC8vIElmIHRoZSBsYXN0IGxvZyBmaWxlIGV4Y2VlZHMgdGhpcyBzaXplIG9uIGluaXRpYWxpemF0aW9uLCBhIG5ldyBsb2cgZmlsZSB3aWxsIGJlIGNyZWF0ZWRcclxuICAgIGZpbGVNYXhTaXplOiBudW1iZXI7XHJcblxyXG4gICAgLy8gSWYgdGhlIHRvdGFsIHNpemUgb2YgYWxsIGxvZyBmaWxlcyBleGNlZWRzIHRoaXMgc2l6ZSBvbiBpbml0aWFsaXNhdGlvbiwgb2xkZXN0IGZpbGVzIHdpbGwgYmUgcmVtb3ZlZFxyXG4gICAgdG90YWxMb2dTaXplOiBudW1iZXI7XHJcblxyXG4gICAgLy8gTmFtZSBvZiBkaXJlY3RvcnkgdG8gY3JlYXRlIGZvciBsb2dzLCB3aXRoaW4gdGhlIGJhc2VEaXJcclxuICAgIGxvZ0Rpcjogc3RyaW5nO1xyXG5cclxuICAgIC8vIE5hbWUgb2YgZGlyZWN0b3J5IGluIHdoaWNoIHRvIGNyZWF0ZSBsb2cgZGlyZWN0b3J5XHJcbiAgICBiYXNlRGlyOiBzdHJpbmc7XHJcblxyXG4gICAgLy8gUHJlZml4IGZvciBsb2cgZmlsZXNcclxuICAgIGxvZ1ByZWZpeDogc3RyaW5nO1xyXG5cclxuICAgIC8vIERldmVsb3Blci1sZXZlbCBsb2dnaW5nIHdpbGwgYXBwZWFyIGluIGxvZyBmaWxlcyBpZiB0cnVlXHJcbiAgICBkZXZNb2RlOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGZpZWxkczogYW55KSB7XHJcbiAgICAgICAgLy8gUXVpY2sgYW5kIGRpcnR5IGV4dGVuZC9hc3NpZ24gZmllbGRzIHRvIHRoaXMgbW9kZWxcclxuICAgICAgICBmb3IgKGNvbnN0IGYgaW4gZmllbGRzKSB7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgdGhpc1tmXSA9IGZpZWxkc1tmXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPdmVycmlkZXMgdGhpcyBvYmplY3QncyB1bmluaXRpYWxpemVkIGZpZWxkcyB3aXRoIHRoZSBwYXNzZWQgcGFyYW1ldGVyJ3MgZmllbGRzXHJcbiAgICAgKiBAcGFyYW0gY29uZmlnXHJcbiAgICAgKi9cclxuICAgIG1lcmdlKGNvbmZpZzogYW55KSB7XHJcbiAgICAgIGZvciAobGV0IGsgaW4gY29uZmlnKSB7XHJcbiAgICAgICAgaWYgKCEoayBpbiB0aGlzKSkge1xyXG4gICAgICAgICAgdGhpc1trXSA9IGNvbmZpZ1trXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=