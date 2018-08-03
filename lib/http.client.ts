import Axios from 'axios';
import { IHttpClientModel, IHttpErrorModel, IHttpRequestConfig, IHttpResponseModel } from './models/http.client.model';
import { ILoggerModel } from './models/logger.model';
import { IValidationError } from './models/validation.error.model';

export class HttpClientError<T> extends Error implements IHttpErrorModel {
    public name = 'HttpClientError';

    public config: IHttpRequestConfig;
    public code?: string;
    public request?: any;
    public response?: IHttpResponseModel<{data: T, errors: IValidationError[]}>;

    public status?: number | undefined;
    public data?: T;
    public errors?: IValidationError[];

    constructor(e: IHttpErrorModel) {
        super();
        this.config = e.config;
        this.code = e.code;
        this.request = e.request;
        this.response = e.response;
        this.status = this.response ? this.response.status : undefined;
        this.data = this.response ? (this.response.data ? this.response.data.data : undefined) : undefined;
        this.errors = this.response ? (this.response.data ? this.response.data.errors : undefined) : undefined;
    }

    public hasErrors(): boolean {
        return !!this.errors;
    }

    public hasError(msg: string): boolean {
        return this.errors ? !!this.errors.find(e => e.msg === msg) : false;
    }
}

export class HttpClient implements IHttpClientModel {

    constructor(private logger?: ILoggerModel) {
    }

    public async request<T>(config: IHttpRequestConfig): Promise<IHttpResponseModel<T>> {
        this.logDebug('Requesting.', config);
        try {
            return await Axios.request<T>(config);
        } catch (e) {
            this.logError('Request failed.', e, config);
            throw new HttpClientError(e);
        }
    }

    private logError(message: string, error: Error, data?: any) {
        if (this.logger && this.logger.error) {
            this.logger.error(message, error, data);
        }
    }

    private logDebug(message: string, data?: any) {
        if (this.logger && this.logger.error) {
            this.logger.debug(message, data);
        }
    }
}
