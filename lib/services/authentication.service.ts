import {
    InvalidPassword,
    InvalidToken,
    TokenExpired,
    UnexpectedResponse,
    UnknownClientError,
    UserNotActive,
    UserNotFound
} from '../error';
import { HttpClient } from '../http.client';
import { DecodedToken } from '../inputs/decoded.token';
import { PasswordInput } from '../inputs/password.input';
import { IAPIResponse } from '../models/api.response.model';
import { IDecodedTokenModel } from '../models/decoded.token.model';
import { IHttpClientModel } from '../models/http.client.model';
import { IOptions } from '../models/options.model';
import { BaseService } from './base.service';

export class AuthenticationService extends BaseService {

    public baseURL: string;
    public client: IHttpClientModel;
    public headers: {[key: string]: string};

    constructor(options: IOptions = {}) {
        super(options.logger);
        this.headers = options.headers || {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        this.client = options.client || new HttpClient();
        this.baseURL = options.baseURL || '';
    }

    public configure(options: IOptions) {
        if (options.logger) {
            this.logger = options.logger;
        }
        if (options.baseURL) {
            this.baseURL = options.baseURL;
        }
        if (options.client) {
            this.client = options.client;
        }
        if (options.headers) {
            this.headers = options.headers;
        }
    }

    public async password(email: string, password: string, expiresIn?: number): Promise<string> {
        this.logDebug('Password', {email, password});
        await new PasswordInput(email, password, expiresIn).validate();
        try {
            const response = await this.client.request<IAPIResponse<string>>({
                url: this.appendPath('password'),
                method: 'POST',
                headers: this.headers,
                data: expiresIn !== undefined ? {email, password, expiresIn} : {email, password}
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

    public async verify(token: string) {
        try {
            this.logDebug('Verifing token', {token});
            const response = await this.client.request<IAPIResponse<IDecodedTokenModel>>({
                url: this.appendPath('verify'),
                method: 'POST',
                headers: this.headers,
                data: {token}
            });
            this.logDebug('Client responded with 200', {response});

            // Validate response data is valid
            if (!response.data || !response.data.data || typeof response.data.data !== 'object') {
                throw new UnexpectedResponse();
            } else {
                try {
                    await new DecodedToken(response.data.data).validate();
                } catch (e) {
                    throw new UnexpectedResponse();
                }
            }
            return response.data.data;
        } catch (e) {
            this.logError('Token validation failed', e, {token});
            if (e.name === 'HttpClientError') {
                if (e.hasError('TokenExpired')) {
                    throw new TokenExpired();
                } else if (e.hasError('InvalidToken')) {
                    throw new InvalidToken();
                } else {
                    throw new UnknownClientError();
                }
            }
            throw e;
        }
    }

    /**
     * Appends path to base url.
     * @param path: Endpoint path
     */
    private appendPath(path: string): string {
        if (this.baseURL.endsWith('/')) {
            return `${this.baseURL}${path}`;
        }
        return `${this.baseURL}/${path}`;
    }
}
