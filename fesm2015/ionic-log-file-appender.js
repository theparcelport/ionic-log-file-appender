import { DatePipe, CommonModule } from '@angular/common';
import { Injectable, NgModule } from '@angular/core';
import { __awaiter } from 'tslib';
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
class LogProvider {
    /**
     * @param {?} file
     * @param {?} platform
     * @param {?} datePipe
     */
    constructor(file, platform, datePipe) {
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
     * @param {?} configuration
     * @return {?}
     */
    init(configuration) {
        return this.platform.ready()
            .then(() => {
            this.config = new LogProviderConfig(configuration);
            // Any configuration not specified will take the defaults
            this.config.merge(this.defaultConfig);
            if (!this.config.baseDir) {
                // Can only initialise this after platform is ready
                this.config.baseDir = this.file.dataDirectory;
            }
            this.debug_metaLog('LogProvider initialised with configuration: ' + JSON.stringify(this.config));
            this.fileLoggerReady = false;
            this.debug_metaLog('Initialising file logger');
            this.log('Initialising file logger');
            if (!this.platform.is('cordova')) {
                this.debug_metaLog('Not initialising file logger as the it is not supported by the platform ' + this.platform.url());
                this.initFailed = true;
                return Promise.resolve();
            }
            this.debug_metaLog('Data directory: ' + this.config.baseDir);
            return this.file.checkDir(this.config.baseDir, this.config.logDir)
                .then(() => {
                this.debug_metaLog('Found logging directory');
                return this.initLogFile();
            })
                .catch(err => {
                this.debug_metaLog('Could not find logging directory: ' + JSON.stringify(err));
                return this.createLogDir();
            });
        });
    }
    /**
     * @return {?}
     */
    isReady() {
        return this.fileLoggerReady;
    }
    /**
     * Attempts to create the logging directory
     * @return {?}
     */
    createLogDir() {
        this.debug_metaLog('Attempting to create logging directory');
        return this.file.createDir(this.config.baseDir, this.config.logDir, false)
            .then(() => {
            this.debug_metaLog('Successfully created logging directory');
            return this.initLogFile();
        })
            .catch(err => {
            this.initFailed = true;
            this.debug_metaLog('Failed to create logging directory: ' + JSON.stringify(err));
        });
    }
    /**
     * Attempts to initialise the current log file
     * @return {?} a promise upon completion or failure
     */
    initLogFile() {
        this.debug_metaLog('Attempting to initialise log file');
        return this.file.listDir(this.config.baseDir, this.config.logDir)
            .then((entries) => {
            if (entries && entries.length > 0) {
                this.debug_metaLog(entries.length + ' existing log files found.');
                return this.cleanupFiles(entries);
            }
            else {
                this.debug_metaLog('No existing log files found.');
                return this.cleanupCompleted(null, 0, null);
            }
        })
            .catch(err => {
            this.debug_metaLog('Failed to get file list: ' + JSON.stringify(err, Object.getOwnPropertyNames(err)));
            throw err;
        });
    }
    /**
     * Checks the total size of log files against the configured maximum size and deletes oldest if necessary
     * @param {?} entries the files found in the logging directory
     * @return {?}
     */
    cleanupFiles(entries) {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug_metaLog('Starting cleanup of ' + entries.length + ' log files');
            entries = filter(entries, (entry) => entry.isFile && entry.name && entry.name.startsWith(this.config.logPrefix));
            if (entries.length === 0) {
                return this.cleanupCompleted(null, 0, null)
                    .catch(err => {
                    // Now we're well and truly buggered
                    this.initFailed = true;
                    throw err;
                });
            }
            entries = orderBy(entries, ['name'], ['asc']);
            let /** @type {?} */ total = entries.length;
            let /** @type {?} */ calculated = 0;
            let /** @type {?} */ sizeTotal = 0;
            try {
                // Loop over entries
                for (let /** @type {?} */ entry of entries) {
                    const /** @type {?} */ size = yield this.getFileSize(entry);
                    // Calculate total size of log files
                    calculated++;
                    sizeTotal += size;
                    this.debug_metaLog('After ' + calculated + ' files, total size is ' + sizeTotal);
                    if (sizeTotal > this.config.totalLogSize) {
                        this.debug_metaLog('Total log file size exceeds limit: ' + sizeTotal);
                        return this.maxSizeExceeded(entries, size)
                            .catch(err => {
                            // Now we're well and truly buggered
                            this.initFailed = true;
                            throw err;
                        });
                    }
                    else if (calculated === total) {
                        this.debug_metaLog('Total log file size is ok: ' + sizeTotal);
                        // Below max size, so we're ready to go
                        const /** @type {?} */ lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
                        return this.cleanupCompleted(lastEntry, size, null)
                            .catch(err => {
                            // Now we're well and truly buggered
                            this.initFailed = true;
                            throw err;
                        });
                    }
                }
            }
            catch (/** @type {?} */ failure) {
                const /** @type {?} */ lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
                // Not much we can do except try to continue
                return this.cleanupCompleted(lastEntry, 0, failure)
                    .catch(err => {
                    // Now we're in real trouble
                    this.initFailed = true;
                    throw err;
                });
            }
        });
    }
    /**
     * Wraps getMetadata in a Promise
     * @param {?} entry
     * @return {?} a promise
     */
    getFileSize(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                entry.getMetadata(metadata => {
                    resolve(metadata.size);
                }, failure => {
                    reject('SEVERE ERROR: could not retrieve metadata. ' + JSON.stringify(failure));
                });
            });
        });
    }
    /**
     * Attempts to remove one file and recursively check total size again
     * @param {?} entries
     * @param {?} lastEntrySize
     * @return {?}
     */
    maxSizeExceeded(entries, lastEntrySize) {
        return this.removeFile(entries[0])
            .then(() => {
            this.debug_metaLog('Entry successfully removed');
            // Remove oldest entry
            entries.shift();
            // Check again
            return this.cleanupFiles(entries);
        })
            .catch(err => {
            const /** @type {?} */ lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
            // Not much we can do except try to continue
            return this.cleanupCompleted(lastEntry, lastEntrySize, 'SEVERE ERROR: could not clean up old files. ' + err);
        });
    }
    /**
     * When file cleanup is completed, attempts to initialise config to point to current log file
     * @param {?} lastEntry The most recent existing log file
     * @param {?} lastEntrySize The size of the most recent existing log file
     * @param {?} error Any error to be logged after initialization
     * @return {?}
     */
    cleanupCompleted(lastEntry, lastEntrySize, error) {
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
                .then(() => {
                this.fileLoggerReady = true;
                if (error) {
                    this.log(error);
                }
                this.debug_metaLog('File logger initialised at new file: ' + this.currentFile.fullPath);
                this.log('File logger initialised at new file: ' + this.currentFile.name);
                return Promise.resolve();
            });
        }
    }
    /**
     * Attempts to remove a file
     * @param {?} entry
     * @return {?}
     */
    removeFile(entry) {
        this.debug_metaLog('Removing file: ' + entry.fullPath);
        const /** @type {?} */ fullPath = entry.fullPath;
        const /** @type {?} */ path = fullPath.replace(entry.name, '');
        return this.file.removeFile(this.config.baseDir + path, entry.name);
    }
    /**
     * Puts the message on the queue for writing to file
     * @param {?} message
     * @param {?=} err
     * @return {?}
     */
    logInternal(message, err) {
        const /** @type {?} */ date = new Date();
        const /** @type {?} */ dateString = this.datePipe.transform(date, this.config.logDateFormat);
        const /** @type {?} */ logMessage = '[' + dateString + '] ' + message + '\r\n';
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
    }
    /**
     * Logs a message at info level
     * @param {?} message
     * @return {?}
     */
    log(message) {
        this.logInternal(message, false);
    }
    /**
     * Developer-level logging
     * @param {?} message
     * @return {?}
     */
    logDev(message) {
        if (this.config.devMode) {
            this.log('*DEBUG* ' + message);
        }
    }
    /**
     * Error-level logging with optional error object
     * @param {?} message
     * @param {?=} error
     * @return {?}
     */
    err(message, error) {
        let /** @type {?} */ logMessage = 'ERROR! ' + message;
        if (error) {
            logMessage += ': ' + JSON.stringify(error, Object.getOwnPropertyNames(error));
        }
        this.logInternal(logMessage, true);
    }
    /**
     * Writes the current logging queue to file
     * @return {?}
     */
    doProcess() {
        this.debug_metaLog('Beginning processing loop');
        this.processQueue()
            .then(() => {
            if (this.queue.length > 0) {
                this.doProcess();
            }
            else {
                this.checkFileLength()
                    .then(() => {
                    this.processing = false;
                })
                    .catch(err => {
                    this.debug_metaLog('Error checking file length: ' + JSON.stringify(err));
                    this.processing = false;
                });
            }
        })
            .catch(err => {
            this.debug_metaLog('Error processing queue: ' + err);
            this.processing = false;
        });
    }
    /**
     * Writes the oldest entry in the queue to file, then checks if file rollover is required
     * @return {?}
     */
    processQueue() {
        this.debug_metaLog('Processing queue of length ' + this.queue.length);
        if (this.queue.length > 0) {
            const /** @type {?} */ message = this.queue.shift();
            return this.file.writeFile(this.config.baseDir + '/' + this.config.logDir, this.currentFile.name, message, {
                append: true,
                replace: false
            })
                .then(() => {
                this.lines++;
                return this.checkFileLength();
            })
                .catch(err => {
                this.debug_metaLog('Error writing to file: ' + err);
            });
        }
        else {
            return Promise.resolve();
        }
    }
    /**
     * Checks the file length and creates a new file if required
     * @return {?}
     */
    checkFileLength() {
        if (this.lines >= this.config.fileMaxLines) {
            this.debug_metaLog('Creating new file as max number of log entries exceeded');
            return this.createNextFile();
        }
        else {
            return Promise.resolve();
        }
    }
    /**
     * Generates a log file name from the current time
     * @return {?}
     */
    createLogFileName() {
        const /** @type {?} */ date = new Date();
        const /** @type {?} */ dateString = this.datePipe.transform(date, this.config.fileDateFormat);
        return this.config.logPrefix + '.' + dateString + '.log';
    }
    /**
     * Creates the next log file and updates the local reference
     * @return {?}
     */
    createNextFile() {
        const /** @type {?} */ fileName = this.createLogFileName();
        this.debug_metaLog('Attempting to create file at: ' + this.config.baseDir + this.config.logDir + '/' + fileName);
        return this.file.createFile(this.config.baseDir + '/' + this.config.logDir, fileName, true)
            .then(newFile => {
            this.lines = 0;
            this.currentFile = newFile;
            this.debug_metaLog('Created new file: ' + this.currentFile.fullPath);
        })
            .catch(err => {
            this.debug_metaLog('Failed to create new file: ' + JSON.stringify(err));
        });
    }
    /**
     * Retrieves the current list of log files in the logging directory
     * @return {?}
     */
    getLogFiles() {
        this.debug_metaLog('Attempting to retrieve log files');
        if (this.initFailed) {
            this.debug_metaLog('Log never initialised so can\'t retrieve files');
            return Promise.resolve([]);
        }
        else {
            return this.file.listDir(this.config.baseDir, this.config.logDir);
        }
    }
    /**
     * @param {?} message
     * @return {?}
     */
    debug_metaLog(message) {
        if (this.config.enableMetaLogging) {
            console.log('**LOGGER_META**: ' + message);
        }
    }
}
LogProvider.decorators = [
    { type: Injectable },
];
/** @nocollapse */
LogProvider.ctorParameters = () => [
    { type: File, },
    { type: Platform, },
    { type: DatePipe, },
];
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
class LogProviderConfig {
    /**
     * @param {?} fields
     */
    constructor(fields) {
        // Quick and dirty extend/assign fields to this model
        for (const /** @type {?} */ f in fields) {
            // @ts-ignore
            this[f] = fields[f];
        }
    }
    /**
     * Overrides this object's uninitialized fields with the passed parameter's fields
     * @param {?} config
     * @return {?}
     */
    merge(config) {
        for (let /** @type {?} */ k in config) {
            if (!(k in this)) {
                this[k] = config[k];
            }
        }
    }
}
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
class LogFileAppenderModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: LogFileAppenderModule,
            providers: [LogProvider]
        };
    }
    /**
     * @return {?}
     */
    static forChild() {
        return {
            ngModule: LogFileAppenderModule,
            providers: [LogProvider]
        };
    }
}
LogFileAppenderModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                providers: [LogProvider]
            },] },
];
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
