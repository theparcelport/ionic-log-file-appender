import { DatePipe } from '@angular/common';
import { Entry, File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';
import { ILogProviderConfig } from './config';
/**
 * SmartMove Ionic rolling log file appender
 * CellTrack Systems Pty Ltd 2018
 */
export declare class LogProvider {
    private file;
    private platform;
    private datePipe;
    private fileLoggerReady;
    private initFailed;
    private currentFile;
    private lines;
    private queue;
    private processing;
    private readonly defaultConfig;
    private config;
    constructor(file: File, platform: Platform, datePipe: DatePipe);
    /**
     * Initializes the file logger
     */
    init(configuration: ILogProviderConfig): Promise<any>;
    isReady(): boolean;
    /**
     * Attempts to create the logging directory
     */
    private createLogDir;
    /**
     * Attempts to initialise the current log file
     * @returns a promise upon completion or failure
     */
    private initLogFile;
    /**
     * Checks the total size of log files against the configured maximum size and deletes oldest if necessary
     * @param entries the files found in the logging directory
     */
    private cleanupFiles;
    /**
     * Wraps getMetadata in a Promise
     * @param entry
     * @returns a promise
     */
    private getFileSize;
    /**
     * Attempts to remove one file and recursively check total size again
     * @param entries
     * @param lastEntrySize
     * @param resolve
     * @param reject
     */
    private maxSizeExceeded;
    /**
     * When file cleanup is completed, attempts to initialise config to point to current log file
     * @param lastEntry The most recent existing log file
     * @param lastEntrySize The size of the most recent existing log file
     * @param error Any error to be logged after initialization
     */
    private cleanupCompleted;
    /**
     * Attempts to remove a file
     * @param entry
     */
    private removeFile;
    /**
     * Puts the message on the queue for writing to file
     * @param message
     * @param err. If true, logging is at error level
     */
    private logInternal;
    /**
     * Logs a message at info level
     * @param message
     */
    log(message: string): void;
    /**
     * Developer-level logging
     * @param message
     */
    logDev(message: string): void;
    /**
     * Error-level logging with optional error object
     * @param message
     * @param error
     */
    err(message: string, error?: any): void;
    /**
     * Writes the current logging queue to file
     */
    private doProcess;
    /**
     * Writes the oldest entry in the queue to file, then checks if file rollover is required
     */
    private processQueue;
    /**
     * Checks the file length and creates a new file if required
     */
    private checkFileLength;
    /**
     * Generates a log file name from the current time
     */
    private createLogFileName;
    /**
     * Creates the next log file and updates the local reference
     */
    private createNextFile;
    /**
     * Retrieves the current list of log files in the logging directory
     */
    getLogFiles(): Promise<Entry[]>;
    private debug_metaLog;
}
