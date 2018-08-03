import { IHttpClientModel } from "./http.client.model";
import { ILoggerModel } from "./logger.model";

export interface IOptions {
    url?: string;
    logger?: ILoggerModel;
    client?: IHttpClientModel;
    headers?: {[key: string]: string};
}
