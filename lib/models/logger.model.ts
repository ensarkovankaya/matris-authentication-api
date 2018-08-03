export interface ILoggerModel {
    debug(message: string, data?: any): void;

    error(message: string, err: Error, data?: any): void;
}
