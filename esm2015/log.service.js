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
export class LogProvider {
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.debug_metaLog('Starting cleanup of ' + entries.length + ' log files');
            entries = _.filter(entries, (entry) => entry.isFile && entry.name && entry.name.startsWith(this.config.logPrefix));
            if (entries.length === 0) {
                return this.cleanupCompleted(null, 0, null)
                    .catch(err => {
                    // Now we're well and truly buggered
                    this.initFailed = true;
                    throw err;
                });
            }
            entries = _.orderBy(entries, ['name'], ['asc']);
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
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9pb25pYy1sb2ctZmlsZS1hcHBlbmRlci8iLCJzb3VyY2VzIjpbImxvZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBUSxJQUFJLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUE7Ozs7O0FBUTNCLE1BQU07Ozs7OztJQWFGLFlBQW9CLElBQVUsRUFDVixVQUNBO1FBRkEsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUNWLGFBQVEsR0FBUixRQUFRO1FBQ1IsYUFBUSxHQUFSLFFBQVE7K0JBYkYsS0FBSzswQkFDVixLQUFLO3FCQUdBLEVBQUU7MEJBQ1AsS0FBSztRQVN0QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksaUJBQWlCLENBQUM7WUFDdkMsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixZQUFZLEVBQUUsS0FBSztZQUNuQixhQUFhLEVBQUUseUJBQXlCO1lBQ3hDLGNBQWMsRUFBRSx5QkFBeUI7WUFDekMsWUFBWSxFQUFFLElBQUk7WUFDbEIsV0FBVyxFQUFFLE9BQU87WUFDcEIsWUFBWSxFQUFFLE9BQU87WUFDckIsT0FBTyxFQUFFLElBQUk7WUFDYixNQUFNLEVBQUUsTUFBTTtZQUNkLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLE9BQU8sRUFBRSxLQUFLO1NBQ2pCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUNwQzs7Ozs7O0lBS0QsSUFBSSxDQUFDLGFBQWlDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxL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Ozs7SUFNWCxXQUFXO1FBQ1AsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ3ZELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNqQixJQUFJLENBQUMsYUFBYSxDQUFDLGdEQUFnRCxDQUFDLENBQUM7WUFDckUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzlCO2FBQU07WUFDSCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckU7S0FDSjs7Ozs7SUFFTyxhQUFhLENBQUMsT0FBZTtRQUNqQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUU7WUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsQ0FBQztTQUM5Qzs7OztZQWxhUixVQUFVOzs7O1lBVkksSUFBSTtZQUVYLFFBQVE7WUFIUixRQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpYmhCOzs7O0lBbUNJLFlBQVksTUFBVzs7UUFFbkIsS0FBSyx1QkFBTSxDQUFDLElBQUksTUFBTSxFQUFFOztZQUVwQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO0tBQ0o7Ozs7OztJQU1ELEtBQUssQ0FBQyxNQUFXO1FBQ2YsS0FBSyxxQkFBSSxDQUFDLElBQUksTUFBTSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRTtnQkFDaEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNyQjtTQUNGO0tBQ0Y7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGF0ZVBpcGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7RW50cnksIEZpbGV9IGZyb20gJ0Bpb25pYy1uYXRpdmUvZmlsZSc7XHJcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ2lvbmljLWFuZ3VsYXInO1xyXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCdcclxuaW1wb3J0IHtJTG9nUHJvdmlkZXJDb25maWd9IGZyb20gJy4vY29uZmlnJztcclxuXHJcbi8qKlxyXG4gKiBTbWFydE1vdmUgSW9uaWMgcm9sbGluZyBsb2cgZmlsZSBhcHBlbmRlclxyXG4gKiBDZWxsVHJhY2sgU3lzdGVtcyBQdHkgTHRkIDIwMThcclxuICovXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIExvZ1Byb3ZpZGVyIHtcclxuXHJcbiAgICBwcml2YXRlIGZpbGVMb2dnZXJSZWFkeSA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBpbml0RmFpbGVkID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRGaWxlOiBFbnRyeTtcclxuICAgIHByaXZhdGUgbGluZXM6IDA7XHJcbiAgICBwcml2YXRlIHF1ZXVlOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBwcm9jZXNzaW5nID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBkZWZhdWx0Q29uZmlnOiBMb2dQcm92aWRlckNvbmZpZztcclxuXHJcbiAgICBwcml2YXRlIGNvbmZpZzogTG9nUHJvdmlkZXJDb25maWc7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBmaWxlOiBGaWxlLFxyXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBwbGF0Zm9ybTogUGxhdGZvcm0sXHJcbiAgICAgICAgICAgICAgICBwcml2YXRlIGRhdGVQaXBlOiBEYXRlUGlwZSkge1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdENvbmZpZyA9IG5ldyBMb2dQcm92aWRlckNvbmZpZyh7XHJcbiAgICAgICAgICAgIGVuYWJsZU1ldGFMb2dnaW5nOiBmYWxzZSxcclxuICAgICAgICAgICAgbG9nVG9Db25zb2xlOiBmYWxzZSxcclxuICAgICAgICAgICAgbG9nRGF0ZUZvcm1hdDogJ3l5eXktTU0tZGQgSEg6bW06c3MuU1NTJyxcclxuICAgICAgICAgICAgZmlsZURhdGVGb3JtYXQ6ICd5eXl5LU1NLWRkX0hILW1tLXNzLVNTUycsXHJcbiAgICAgICAgICAgIGZpbGVNYXhMaW5lczogMjAwMCxcclxuICAgICAgICAgICAgZmlsZU1heFNpemU6IDEwMDAwMDAsXHJcbiAgICAgICAgICAgIHRvdGFsTG9nU2l6ZTogNTAwMDAwMCxcclxuICAgICAgICAgICAgYmFzZURpcjogbnVsbCxcclxuICAgICAgICAgICAgbG9nRGlyOiAnbG9ncycsXHJcbiAgICAgICAgICAgIGxvZ1ByZWZpeDogJ2xvZycsXHJcbiAgICAgICAgICAgIGRldk1vZGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLmRlZmF1bHRDb25maWc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgZmlsZSBsb2dnZXJcclxuICAgICAqL1xyXG4gICAgaW5pdChjb25maWd1cmF0aW9uOiBJTG9nUHJvdmlkZXJDb25maWcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBsYXRmb3JtLnJlYWR5KClcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcgPSBuZXcgTG9nUHJvdmlkZXJDb25maWcoY29uZmlndXJhdGlvbik7XHJcbiAgICAgICAgICAgICAgICAvLyBBbnkgY29uZmlndXJhdGlvbiBub3Qgc3BlY2lmaWVkIHdpbGwgdGFrZSB0aGUgZGVmYXVsdHNcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm1lcmdlKHRoaXMuZGVmYXVsdENvbmZpZyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmJhc2VEaXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDYW4gb25seSBpbml0aWFsaXNlIHRoaXMgYWZ0ZXIgcGxhdGZvcm0gaXMgcmVhZHlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5iYXNlRGlyID0gdGhpcy5maWxlLmRhdGFEaXJlY3Rvcnk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0xvZ1Byb3ZpZGVyIGluaXRpYWxpc2VkIHdpdGggY29uZmlndXJhdGlvbjogJyArIEpTT04uc3RyaW5naWZ5KHRoaXMuY29uZmlnKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGVMb2dnZXJSZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdJbml0aWFsaXNpbmcgZmlsZSBsb2dnZXInKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nKCdJbml0aWFsaXNpbmcgZmlsZSBsb2dnZXInKTtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wbGF0Zm9ybS5pcygnY29yZG92YScpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnTm90IGluaXRpYWxpc2luZyBmaWxlIGxvZ2dlciBhcyB0aGUgaXQgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgcGxhdGZvcm0gJyArIHRoaXMucGxhdGZvcm0udXJsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEZhaWxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdEYXRhIGRpcmVjdG9yeTogJyArIHRoaXMuY29uZmlnLmJhc2VEaXIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5jaGVja0Rpcih0aGlzLmNvbmZpZy5iYXNlRGlyLCB0aGlzLmNvbmZpZy5sb2dEaXIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0ZvdW5kIGxvZ2dpbmcgZGlyZWN0b3J5Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluaXRMb2dGaWxlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdDb3VsZCBub3QgZmluZCBsb2dnaW5nIGRpcmVjdG9yeTogJyArIEpTT04uc3RyaW5naWZ5KGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVMb2dEaXIoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpc1JlYWR5KCk6IGJvb2xlYW4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5maWxlTG9nZ2VyUmVhZHk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRlbXB0cyB0byBjcmVhdGUgdGhlIGxvZ2dpbmcgZGlyZWN0b3J5XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY3JlYXRlTG9nRGlyKCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdBdHRlbXB0aW5nIHRvIGNyZWF0ZSBsb2dnaW5nIGRpcmVjdG9yeScpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZpbGUuY3JlYXRlRGlyKHRoaXMuY29uZmlnLmJhc2VEaXIsIHRoaXMuY29uZmlnLmxvZ0RpciwgZmFsc2UpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnU3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgbG9nZ2luZyBkaXJlY3RvcnknKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluaXRMb2dGaWxlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0RmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnRmFpbGVkIHRvIGNyZWF0ZSBsb2dnaW5nIGRpcmVjdG9yeTogJyArIEpTT04uc3RyaW5naWZ5KGVycikpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGVtcHRzIHRvIGluaXRpYWxpc2UgdGhlIGN1cnJlbnQgbG9nIGZpbGVcclxuICAgICAqIEByZXR1cm5zIGEgcHJvbWlzZSB1cG9uIGNvbXBsZXRpb24gb3IgZmFpbHVyZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGluaXRMb2dGaWxlKCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdBdHRlbXB0aW5nIHRvIGluaXRpYWxpc2UgbG9nIGZpbGUnKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmxpc3REaXIodGhpcy5jb25maWcuYmFzZURpciwgdGhpcy5jb25maWcubG9nRGlyKVxyXG4gICAgICAgICAgICAudGhlbigoZW50cmllczogRW50cnlbXSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVudHJpZXMgJiYgZW50cmllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKGVudHJpZXMubGVuZ3RoICsgJyBleGlzdGluZyBsb2cgZmlsZXMgZm91bmQuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW51cEZpbGVzKGVudHJpZXMpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ05vIGV4aXN0aW5nIGxvZyBmaWxlcyBmb3VuZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbnVwQ29tcGxldGVkKG51bGwsIDAsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnRmFpbGVkIHRvIGdldCBmaWxlIGxpc3Q6ICcgKyBKU09OLnN0cmluZ2lmeShlcnIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGVycikpKTtcclxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgdGhlIHRvdGFsIHNpemUgb2YgbG9nIGZpbGVzIGFnYWluc3QgdGhlIGNvbmZpZ3VyZWQgbWF4aW11bSBzaXplIGFuZCBkZWxldGVzIG9sZGVzdCBpZiBuZWNlc3NhcnlcclxuICAgICAqIEBwYXJhbSBlbnRyaWVzIHRoZSBmaWxlcyBmb3VuZCBpbiB0aGUgbG9nZ2luZyBkaXJlY3RvcnlcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBjbGVhbnVwRmlsZXMoZW50cmllczogRW50cnlbXSk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdTdGFydGluZyBjbGVhbnVwIG9mICcgKyBlbnRyaWVzLmxlbmd0aCArICcgbG9nIGZpbGVzJyk7XHJcbiAgICAgICAgZW50cmllcyA9IF8uZmlsdGVyKGVudHJpZXMsIChlbnRyeTogRW50cnkpID0+IGVudHJ5LmlzRmlsZSAmJiBlbnRyeS5uYW1lICYmIGVudHJ5Lm5hbWUuc3RhcnRzV2l0aCh0aGlzLmNvbmZpZy5sb2dQcmVmaXgpKTtcclxuICAgICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYW51cENvbXBsZXRlZChudWxsLCAwLCBudWxsKVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIC8vIE5vdyB3ZSdyZSB3ZWxsIGFuZCB0cnVseSBidWdnZXJlZFxyXG4gICAgICAgICAgICAgICAgICB0aGlzLmluaXRGYWlsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW50cmllcyA9IF8ub3JkZXJCeShlbnRyaWVzLCBbJ25hbWUnXSxbJ2FzYyddKTtcclxuICAgICAgICBsZXQgdG90YWwgPSBlbnRyaWVzLmxlbmd0aDtcclxuICAgICAgICBsZXQgY2FsY3VsYXRlZCA9IDA7XHJcbiAgICAgICAgbGV0IHNpemVUb3RhbCA9IDA7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGVudHJpZXNcclxuICAgICAgICAgICAgZm9yIChsZXQgZW50cnkgb2YgZW50cmllcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IGF3YWl0IHRoaXMuZ2V0RmlsZVNpemUoZW50cnkpO1xyXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRvdGFsIHNpemUgb2YgbG9nIGZpbGVzXHJcbiAgICAgICAgICAgICAgICBjYWxjdWxhdGVkKys7XHJcbiAgICAgICAgICAgICAgICBzaXplVG90YWwgKz0gc2l6ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnQWZ0ZXIgJyArIGNhbGN1bGF0ZWQgKyAnIGZpbGVzLCB0b3RhbCBzaXplIGlzICcgKyBzaXplVG90YWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNpemVUb3RhbCA+IHRoaXMuY29uZmlnLnRvdGFsTG9nU2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnVG90YWwgbG9nIGZpbGUgc2l6ZSBleGNlZWRzIGxpbWl0OiAnICsgc2l6ZVRvdGFsKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhTaXplRXhjZWVkZWQoZW50cmllcywgc2l6ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm93IHdlJ3JlIHdlbGwgYW5kIHRydWx5IGJ1Z2dlcmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjYWxjdWxhdGVkID09PSB0b3RhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnVG90YWwgbG9nIGZpbGUgc2l6ZSBpcyBvazogJyArIHNpemVUb3RhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQmVsb3cgbWF4IHNpemUsIHNvIHdlJ3JlIHJlYWR5IHRvIGdvXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdEVudHJ5ID0gZW50cmllcy5sZW5ndGggPiAwID8gZW50cmllc1tlbnRyaWVzLmxlbmd0aCAtIDFdIDogbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhbnVwQ29tcGxldGVkKGxhc3RFbnRyeSwgc2l6ZSwgbnVsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm93IHdlJ3JlIHdlbGwgYW5kIHRydWx5IGJ1Z2dlcmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0RmFpbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaChmYWlsdXJlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxhc3RFbnRyeSA9IGVudHJpZXMubGVuZ3RoID4gMCA/IGVudHJpZXNbZW50cmllcy5sZW5ndGggLSAxXSA6IG51bGw7XHJcbiAgICAgICAgICAgIC8vIE5vdCBtdWNoIHdlIGNhbiBkbyBleGNlcHQgdHJ5IHRvIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFudXBDb21wbGV0ZWQobGFzdEVudHJ5LCAwLCBmYWlsdXJlKVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm93IHdlJ3JlIGluIHJlYWwgdHJvdWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEZhaWxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAvKipcclxuICAgKiBXcmFwcyBnZXRNZXRhZGF0YSBpbiBhIFByb21pc2VcclxuICAgKiBAcGFyYW0gZW50cnlcclxuICAgKiBAcmV0dXJucyBhIHByb21pc2VcclxuICAgKi9cclxuICAgIHByaXZhdGUgYXN5bmMgZ2V0RmlsZVNpemUoZW50cnk6IEVudHJ5KTogUHJvbWlzZTxudW1iZXI+IHtcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlOiAoKG51bWJlcikgPT4gdm9pZCksIHJlamVjdCkgPT4ge1xyXG4gICAgICBlbnRyeS5nZXRNZXRhZGF0YShtZXRhZGF0YSA9PiB7XHJcbiAgICAgICAgICByZXNvbHZlKG1ldGFkYXRhLnNpemUpO1xyXG4gICAgICAgIH0sIGZhaWx1cmUgPT4ge1xyXG4gICAgICAgICAgcmVqZWN0KCdTRVZFUkUgRVJST1I6IGNvdWxkIG5vdCByZXRyaWV2ZSBtZXRhZGF0YS4gJyArIEpTT04uc3RyaW5naWZ5KGZhaWx1cmUpKTtcclxuICAgICAgICB9KVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGVtcHRzIHRvIHJlbW92ZSBvbmUgZmlsZSBhbmQgcmVjdXJzaXZlbHkgY2hlY2sgdG90YWwgc2l6ZSBhZ2FpblxyXG4gICAgICogQHBhcmFtIGVudHJpZXNcclxuICAgICAqIEBwYXJhbSBsYXN0RW50cnlTaXplXHJcbiAgICAgKiBAcGFyYW0gcmVzb2x2ZVxyXG4gICAgICogQHBhcmFtIHJlamVjdFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIG1heFNpemVFeGNlZWRlZChlbnRyaWVzOiBFbnRyeVtdLCBsYXN0RW50cnlTaXplOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZUZpbGUoZW50cmllc1swXSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdFbnRyeSBzdWNjZXNzZnVsbHkgcmVtb3ZlZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG9sZGVzdCBlbnRyeVxyXG4gICAgICAgICAgICAgICAgZW50cmllcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgYWdhaW5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFudXBGaWxlcyhlbnRyaWVzKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0RW50cnkgPSBlbnRyaWVzLmxlbmd0aCA+IDAgPyBlbnRyaWVzW2VudHJpZXMubGVuZ3RoIC0gMV0gOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgLy8gTm90IG11Y2ggd2UgY2FuIGRvIGV4Y2VwdCB0cnkgdG8gY29udGludWVcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFudXBDb21wbGV0ZWQobGFzdEVudHJ5LCBsYXN0RW50cnlTaXplLCAnU0VWRVJFIEVSUk9SOiBjb3VsZCBub3QgY2xlYW4gdXAgb2xkIGZpbGVzLiAnICsgZXJyKTtcclxuICAgICAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gZmlsZSBjbGVhbnVwIGlzIGNvbXBsZXRlZCwgYXR0ZW1wdHMgdG8gaW5pdGlhbGlzZSBjb25maWcgdG8gcG9pbnQgdG8gY3VycmVudCBsb2cgZmlsZVxyXG4gICAgICogQHBhcmFtIGxhc3RFbnRyeSBUaGUgbW9zdCByZWNlbnQgZXhpc3RpbmcgbG9nIGZpbGVcclxuICAgICAqIEBwYXJhbSBsYXN0RW50cnlTaXplIFRoZSBzaXplIG9mIHRoZSBtb3N0IHJlY2VudCBleGlzdGluZyBsb2cgZmlsZVxyXG4gICAgICogQHBhcmFtIGVycm9yIEFueSBlcnJvciB0byBiZSBsb2dnZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb25cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjbGVhbnVwQ29tcGxldGVkKGxhc3RFbnRyeTogRW50cnksIGxhc3RFbnRyeVNpemU6IG51bWJlciwgZXJyb3I6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdMb2cgZmlsZSBjbGVhbnVwIGRvbmUnKTtcclxuICAgICAgICBpZiAobGFzdEVudHJ5ICYmIGxhc3RFbnRyeVNpemUgPCB0aGlzLmNvbmZpZy5maWxlTWF4U2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGaWxlID0gbGFzdEVudHJ5O1xyXG4gICAgICAgICAgICB0aGlzLmZpbGVMb2dnZXJSZWFkeSA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnRmlsZSBsb2dnZXIgaW5pdGlhbGlzZWQgYXQgZXhpc3RpbmcgZmlsZTogJyArIHRoaXMuY3VycmVudEZpbGUuZnVsbFBhdGgpO1xyXG4gICAgICAgICAgICB0aGlzLmxvZygnRmlsZSBsb2dnZXIgaW5pdGlhbGlzZWQgYXQgZXhpc3RpbmcgZmlsZTogJyArIHRoaXMuY3VycmVudEZpbGUubmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0xhc3QgZmlsZSBub25leGlzdGVudCBvciB0b28gbGFyZ2UuIENyZWF0aW5nIG5ldyBsb2cgZmlsZScpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXh0RmlsZSgpXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlTG9nZ2VyUmVhZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnRmlsZSBsb2dnZXIgaW5pdGlhbGlzZWQgYXQgbmV3IGZpbGU6ICcgKyB0aGlzLmN1cnJlbnRGaWxlLmZ1bGxQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZygnRmlsZSBsb2dnZXIgaW5pdGlhbGlzZWQgYXQgbmV3IGZpbGU6ICcgKyB0aGlzLmN1cnJlbnRGaWxlLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGVtcHRzIHRvIHJlbW92ZSBhIGZpbGVcclxuICAgICAqIEBwYXJhbSBlbnRyeVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlbW92ZUZpbGUoZW50cnk6IEVudHJ5KTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ1JlbW92aW5nIGZpbGU6ICcgKyBlbnRyeS5mdWxsUGF0aCk7XHJcbiAgICAgICAgY29uc3QgZnVsbFBhdGggPSBlbnRyeS5mdWxsUGF0aDtcclxuICAgICAgICBjb25zdCBwYXRoID0gZnVsbFBhdGgucmVwbGFjZShlbnRyeS5uYW1lLCAnJyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZW1vdmVGaWxlKHRoaXMuY29uZmlnLmJhc2VEaXIgKyBwYXRoLCBlbnRyeS5uYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1dHMgdGhlIG1lc3NhZ2Ugb24gdGhlIHF1ZXVlIGZvciB3cml0aW5nIHRvIGZpbGVcclxuICAgICAqIEBwYXJhbSBtZXNzYWdlXHJcbiAgICAgKiBAcGFyYW0gZXJyLiBJZiB0cnVlLCBsb2dnaW5nIGlzIGF0IGVycm9yIGxldmVsXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgbG9nSW50ZXJuYWwobWVzc2FnZTogc3RyaW5nLCBlcnI/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgY29uc3QgZGF0ZVN0cmluZyA9IHRoaXMuZGF0ZVBpcGUudHJhbnNmb3JtKGRhdGUsIHRoaXMuY29uZmlnLmxvZ0RhdGVGb3JtYXQpO1xyXG4gICAgICAgIGNvbnN0IGxvZ01lc3NhZ2UgPSAnWycgKyBkYXRlU3RyaW5nICsgJ10gJyArIG1lc3NhZ2UgKyAnXFxyXFxuJztcclxuICAgICAgICBpZiAodGhpcy5jb25maWcubG9nVG9Db25zb2xlKSB7XHJcbiAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGxvZ01lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGxvZ01lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmluaXRGYWlsZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdGaWxlIGxvZ2dlciBpbml0IGhhcyBmYWlsZWQhIE1lc3NhZ2UgZGlzY2FyZGVkJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBQdXQgdGhlIG1lc3NhZ2Ugb24gdGhlIHF1ZXVlXHJcbiAgICAgICAgICAgIHRoaXMucXVldWUucHVzaChsb2dNZXNzYWdlKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZmlsZUxvZ2dlclJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPiAwICYmICF0aGlzLnByb2Nlc3NpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9Qcm9jZXNzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0ZpbGUgbG9nZ2VyIGlzIG5vdCByZWFkeSEgTWVzc2FnZSBsZWZ0IG9uIHF1ZXVlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2dzIGEgbWVzc2FnZSBhdCBpbmZvIGxldmVsXHJcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxyXG4gICAgICovXHJcbiAgICBsb2cobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgIHRoaXMubG9nSW50ZXJuYWwobWVzc2FnZSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV2ZWxvcGVyLWxldmVsIGxvZ2dpbmdcclxuICAgICAqIEBwYXJhbSBtZXNzYWdlXHJcbiAgICAgKi9cclxuICAgIGxvZ0RldihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5jb25maWcuZGV2TW9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZygnKkRFQlVHKiAnICsgbWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAvKipcclxuICAgKiBFcnJvci1sZXZlbCBsb2dnaW5nIHdpdGggb3B0aW9uYWwgZXJyb3Igb2JqZWN0XHJcbiAgICogQHBhcmFtIG1lc3NhZ2VcclxuICAgKiBAcGFyYW0gZXJyb3JcclxuICAgKi9cclxuICAgIGVycihtZXNzYWdlOiBzdHJpbmcsIGVycm9yPzogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGxvZ01lc3NhZ2UgPSAnRVJST1IhICcgKyBtZXNzYWdlO1xyXG4gICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICBsb2dNZXNzYWdlICs9ICc6ICcgKyBKU09OLnN0cmluZ2lmeShlcnJvciwgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZXJyb3IpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sb2dJbnRlcm5hbChsb2dNZXNzYWdlLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdyaXRlcyB0aGUgY3VycmVudCBsb2dnaW5nIHF1ZXVlIHRvIGZpbGVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBkb1Byb2Nlc3MoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdCZWdpbm5pbmcgcHJvY2Vzc2luZyBsb29wJyk7XHJcbiAgICAgICAgdGhpcy5wcm9jZXNzUXVldWUoKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb1Byb2Nlc3MoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0ZpbGVMZW5ndGgoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlYnVnX21ldGFMb2coJ0Vycm9yIGNoZWNraW5nIGZpbGUgbGVuZ3RoOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnRXJyb3IgcHJvY2Vzc2luZyBxdWV1ZTogJyArIGVycik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXcml0ZXMgdGhlIG9sZGVzdCBlbnRyeSBpbiB0aGUgcXVldWUgdG8gZmlsZSwgdGhlbiBjaGVja3MgaWYgZmlsZSByb2xsb3ZlciBpcyByZXF1aXJlZFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHByb2Nlc3NRdWV1ZSgpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnUHJvY2Vzc2luZyBxdWV1ZSBvZiBsZW5ndGggJyArIHRoaXMucXVldWUubGVuZ3RoKTtcclxuICAgICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGUud3JpdGVGaWxlKHRoaXMuY29uZmlnLmJhc2VEaXIgKyAnLycgKyB0aGlzLmNvbmZpZy5sb2dEaXIsIHRoaXMuY3VycmVudEZpbGUubmFtZSwgbWVzc2FnZSwge1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogZmFsc2VcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVzKys7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tGaWxlTGVuZ3RoKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdFcnJvciB3cml0aW5nIHRvIGZpbGU6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgdGhlIGZpbGUgbGVuZ3RoIGFuZCBjcmVhdGVzIGEgbmV3IGZpbGUgaWYgcmVxdWlyZWRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja0ZpbGVMZW5ndGgoKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBpZiAodGhpcy5saW5lcyA+PSB0aGlzLmNvbmZpZy5maWxlTWF4TGluZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdDcmVhdGluZyBuZXcgZmlsZSBhcyBtYXggbnVtYmVyIG9mIGxvZyBlbnRyaWVzIGV4Y2VlZGVkJyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5leHRGaWxlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlcyBhIGxvZyBmaWxlIG5hbWUgZnJvbSB0aGUgY3VycmVudCB0aW1lXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY3JlYXRlTG9nRmlsZU5hbWUoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBjb25zdCBkYXRlU3RyaW5nID10aGlzLmRhdGVQaXBlLnRyYW5zZm9ybShkYXRlLCB0aGlzLmNvbmZpZy5maWxlRGF0ZUZvcm1hdCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmxvZ1ByZWZpeCArICcuJyArIGRhdGVTdHJpbmcgKyAnLmxvZydcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgdGhlIG5leHQgbG9nIGZpbGUgYW5kIHVwZGF0ZXMgdGhlIGxvY2FsIHJlZmVyZW5jZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNyZWF0ZU5leHRGaWxlKCk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSB0aGlzLmNyZWF0ZUxvZ0ZpbGVOYW1lKCk7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdBdHRlbXB0aW5nIHRvIGNyZWF0ZSBmaWxlIGF0OiAnICsgdGhpcy5jb25maWcuYmFzZURpciArIHRoaXMuY29uZmlnLmxvZ0RpciArICcvJyArIGZpbGVOYW1lKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5maWxlLmNyZWF0ZUZpbGUodGhpcy5jb25maWcuYmFzZURpciArICcvJyArIHRoaXMuY29uZmlnLmxvZ0RpciwgZmlsZU5hbWUsIHRydWUpXHJcbiAgICAgICAgICAgIC50aGVuKG5ld0ZpbGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saW5lcyA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRGaWxlID0gbmV3RmlsZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnQ3JlYXRlZCBuZXcgZmlsZTogJyArIHRoaXMuY3VycmVudEZpbGUuZnVsbFBhdGgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdfbWV0YUxvZygnRmFpbGVkIHRvIGNyZWF0ZSBuZXcgZmlsZTogJyArIEpTT04uc3RyaW5naWZ5KGVycikpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBsaXN0IG9mIGxvZyBmaWxlcyBpbiB0aGUgbG9nZ2luZyBkaXJlY3RvcnlcclxuICAgICAqL1xyXG4gICAgZ2V0TG9nRmlsZXMoKTogUHJvbWlzZTxFbnRyeVtdPiB7XHJcbiAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdBdHRlbXB0aW5nIHRvIHJldHJpZXZlIGxvZyBmaWxlcycpO1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRGYWlsZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5kZWJ1Z19tZXRhTG9nKCdMb2cgbmV2ZXIgaW5pdGlhbGlzZWQgc28gY2FuXFwndCByZXRyaWV2ZSBmaWxlcycpO1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlLmxpc3REaXIodGhpcy5jb25maWcuYmFzZURpciwgdGhpcy5jb25maWcubG9nRGlyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkZWJ1Z19tZXRhTG9nKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5lbmFibGVNZXRhTG9nZ2luZykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnKipMT0dHRVJfTUVUQSoqOiAnICsgbWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBMb2dQcm92aWRlckNvbmZpZyBpbXBsZW1lbnRzIElMb2dQcm92aWRlckNvbmZpZyB7XHJcbiAgICAvLyBJZiB0cnVlLCBsb2dzIHZlcmJvc2UgZGV0YWlscyBvZiBmaWxlIGxvZ2dpbmcgb3BlcmF0aW9ucyB0byBjb25zb2xlXHJcbiAgICBlbmFibGVNZXRhTG9nZ2luZzogYm9vbGVhbjtcclxuXHJcbiAgICAvLyBJZiB0cnVlLCBhbGwgZmlsZSBsb2cgbWVzc2FnZXMgYWxzbyBhcHBlYXIgaW4gdGhlIGNvbnNvbGVcclxuICAgIGxvZ1RvQ29uc29sZTogYm9vbGVhbjtcclxuXHJcbiAgICAvLyBEYXRlIGZvcm1hdCB1c2VkIGluIGxvZyBzdGF0ZW1lbnRzXHJcbiAgICBsb2dEYXRlRm9ybWF0OiBzdHJpbmc7XHJcblxyXG4gICAgLy8gRGF0ZSBmb3JtYXQgdXNlZCBpbiBsb2cgZmlsZSBuYW1lcy5cclxuICAgIC8vIE5PVEU6IGJlIGNhcmVmdWwgd2l0aCBzcGVjaWFsIGNoYXJhY3RlcnMgbGlrZSAnOicgYXMgdGhpcyBjYW4gY2F1c2UgZmlsZSBzeXN0ZW0gaXNzdWVzXHJcbiAgICBmaWxlRGF0ZUZvcm1hdDogc3RyaW5nO1xyXG5cclxuICAgIC8vIE1heGltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIGJlZm9yZSBmaWxlIHJvbGxvdmVyXHJcbiAgICBmaWxlTWF4TGluZXM6IG51bWJlcjtcclxuXHJcbiAgICAvLyBJZiB0aGUgbGFzdCBsb2cgZmlsZSBleGNlZWRzIHRoaXMgc2l6ZSBvbiBpbml0aWFsaXphdGlvbiwgYSBuZXcgbG9nIGZpbGUgd2lsbCBiZSBjcmVhdGVkXHJcbiAgICBmaWxlTWF4U2l6ZTogbnVtYmVyO1xyXG5cclxuICAgIC8vIElmIHRoZSB0b3RhbCBzaXplIG9mIGFsbCBsb2cgZmlsZXMgZXhjZWVkcyB0aGlzIHNpemUgb24gaW5pdGlhbGlzYXRpb24sIG9sZGVzdCBmaWxlcyB3aWxsIGJlIHJlbW92ZWRcclxuICAgIHRvdGFsTG9nU2l6ZTogbnVtYmVyO1xyXG5cclxuICAgIC8vIE5hbWUgb2YgZGlyZWN0b3J5IHRvIGNyZWF0ZSBmb3IgbG9ncywgd2l0aGluIHRoZSBiYXNlRGlyXHJcbiAgICBsb2dEaXI6IHN0cmluZztcclxuXHJcbiAgICAvLyBOYW1lIG9mIGRpcmVjdG9yeSBpbiB3aGljaCB0byBjcmVhdGUgbG9nIGRpcmVjdG9yeVxyXG4gICAgYmFzZURpcjogc3RyaW5nO1xyXG5cclxuICAgIC8vIFByZWZpeCBmb3IgbG9nIGZpbGVzXHJcbiAgICBsb2dQcmVmaXg6IHN0cmluZztcclxuXHJcbiAgICAvLyBEZXZlbG9wZXItbGV2ZWwgbG9nZ2luZyB3aWxsIGFwcGVhciBpbiBsb2cgZmlsZXMgaWYgdHJ1ZVxyXG4gICAgZGV2TW9kZTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihmaWVsZHM6IGFueSkge1xyXG4gICAgICAgIC8vIFF1aWNrIGFuZCBkaXJ0eSBleHRlbmQvYXNzaWduIGZpZWxkcyB0byB0aGlzIG1vZGVsXHJcbiAgICAgICAgZm9yIChjb25zdCBmIGluIGZpZWxkcykge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIHRoaXNbZl0gPSBmaWVsZHNbZl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3ZlcnJpZGVzIHRoaXMgb2JqZWN0J3MgdW5pbml0aWFsaXplZCBmaWVsZHMgd2l0aCB0aGUgcGFzc2VkIHBhcmFtZXRlcidzIGZpZWxkc1xyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICovXHJcbiAgICBtZXJnZShjb25maWc6IGFueSkge1xyXG4gICAgICBmb3IgKGxldCBrIGluIGNvbmZpZykge1xyXG4gICAgICAgIGlmICghKGsgaW4gdGhpcykpIHtcclxuICAgICAgICAgIHRoaXNba10gPSBjb25maWdba107XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19