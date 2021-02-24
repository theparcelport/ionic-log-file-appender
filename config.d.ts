/** Copyright 2019 SmartMove */
export interface ILogProviderConfig {
    enableMetaLogging?: boolean;
    logToConsole?: boolean;
    logDateFormat?: string;
    fileDateFormat?: string;
    fileMaxLines?: number;
    fileMaxSize?: number;
    totalLogSize?: number;
    logDir?: string;
    baseDir?: string;
    logPrefix?: string;
    devMode?: boolean;
}
