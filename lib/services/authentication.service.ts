import { InvalidPassword, UnexpectedResponse, UnknownClientError, UserNotActive, UserNotFound } from '../error';
import { HttpClient } from '../http.client';
import { PasswordInput } from '../inputs/password.input';
import { IAPIResponse } from '../models/api.response.model';
import { IHttpClientModel } from '../models/http.client.model';
import { IOptions } from '../models/options.model';
import { BaseService } from './base.service';

export class AuthenticationService extends BaseService {

    public url: string;
    public client: IHttpClientModel;
    public headers: {[key: string]: string};

    constructor(options: IOptions = {}) {
        super(options.logger);
        this.headers = options.headers || {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        this.client = options.client || new HttpClient();
        this.url = options.url || '';
    }

    public configure(options: IOptions) {
        if (options.logger) {
            this.logger = options.logger;
        }
        if (options.url) {
            this.url = options.url;
        }
        if (options.client) {
            this.client = options.client;
        }
        if (options.headers) {
            this.headers = options.headers;
        }
    }

    public async password(email: string, password: string): Promise<string> {
        this.logDebug('Password', {email, password});
        await new PasswordInput(email, password).validate();
        try {
            const response = await this.client.request<IAPIResponse<string>>({
                url: this.url,
                method: 'POST',
                headers: this.headers,
                data: {email, password}
            });
            this.logDebug('Password', {response});
            if (!response.data || !response.data.data || typeof response.data.data !== 'string') {
                throw new UnexpectedResponse();
            }
            return response.data.data;
        } catch (e) {
            this.logError('Password', e, {email, password});
            if (e.name === 'HttpClientError') {
                if (e.hasError('UserNotFound')) {
                    throw new UserNotFound();
                } else if (e.hasError('UserNotActive')) {
                    throw new UserNotActive();
                } else if (e.hasError('InvalidPassword')) {
                    throw new InvalidPassword();
                } else {
                    throw new UnknownClientError();
                }
            }
            throw e;
        }
    }
}
