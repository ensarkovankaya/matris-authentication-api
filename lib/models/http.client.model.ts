import { ILoggerModel } from './logger.model';

export interface IHttpRequestConfig {
    url?: string;
    method?: string;
    headers?: {[key: string]: string};
    params?: any;
    data?: any;
    timeout?: number;
}

export interface IHttpResponseModel<T> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config?: IHttpRequestConfig;
    request?: any;
}

export interface IHttpErrorModel extends Error {
    name: string;
    config: IHttpRequestConfig;
    code?: string;
    request?: any;
    response?: IHttpResponseModel<any>;
    data?: any;
    status?: number;
    hasErrors(): boolean;
    hasError(msg: string): boolean;
}

export interface IHttpClientModel {
    request<T>(config: IHttpRequestConfig): Promise<IHttpResponseModel<T>>;
}
