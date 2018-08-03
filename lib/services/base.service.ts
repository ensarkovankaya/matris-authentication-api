import { ILoggerModel } from '../models/logger.model';

export class BaseService {
    constructor(public logger?: ILoggerModel) {
    }

    public logError(message: string, error: Error, data?: any) {
        if (this.logger && this.logger.error) {
            this.logger.error(message, error, data);
        }
    }

    public logDebug(message: string, data?: any) {
        if (this.logger && this.logger.debug) {
            this.logger.debug(message, data);
        }
    }
}
