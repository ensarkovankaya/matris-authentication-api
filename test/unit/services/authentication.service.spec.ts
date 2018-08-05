import { expect } from 'chai';
import { describe, it } from 'mocha';
import { AuthenticationService } from '../../../lib/services/authentication.service';
import { HttpClient, HttpClientError } from '../../../lib/http.client';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

class MethodCalled extends Error {
    public name = 'MethodCalled';

    constructor(public method: string, public args: any) {
        super();
    }
}

describe('Unit -> Services -> AuthenticationService', () => {

    it('should initialize with default options', async () => {
        const service = new AuthenticationService();
        expect(service.baseURL).to.be.eq('');
        expect(service.client).to.be.an('object');
        expect(service.client).to.be.instanceof(HttpClient);
        expect(service.logger).to.be.eq(undefined);
        expect(service.headers).to.be.an('object');
        expect(service.headers).to.be.deep.eq({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
    });

    it('should load configurations', async () => {
        class MockClient {
        }
        const service = new AuthenticationService({
            baseURL: 'http://localhost',
            client: new MockClient() as any,
            logger: console,
            headers: {key: 'value'}
        });
        expect(service.baseURL).to.be.eq('http://localhost');
        expect(service.client).to.be.an('object');
        expect(service.client).to.be.instanceof(MockClient);
        expect(service.logger).to.be.eq(console);
        expect(service.headers).to.be.an('object');
        expect(service.headers).to.be.deep.eq({key: 'value'});
    });

    describe('Password', () => {

        it('should raise ArgumentValidationError', async () => {
            try {
                await new AuthenticationService().password('notamail', 'pass');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('email')).to.be.eq(true);
                expect(e.hasError('password')).to.be.eq(true);
            }
        });

        it('should call "request" from client email and password', async () => {
            try {
                class MockClient {

                    public request(config) {
                        throw new MethodCalled('request', config);
                    }
                }

                const service = new AuthenticationService({
                    baseURL: 'http://localhost',
                    headers: {'Authorization': 'Basic username:password'},
                    client: new MockClient() as any
                });
                await service.password('mail@mail.com', '12345678');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
                expect(e.method).to.be.eq('request');
                expect(e.args).to.be.an('object');
                expect(e.args).to.be.deep.eq({
                    url: 'http://localhost/password',
                    method: 'POST',
                    headers: {'Authorization': 'Basic username:password'},
                    data: {email: 'mail@mail.com', password: '12345678'}
                });
            }
        });

        it('should call "request" from client email, password and expiresIn', async () => {
            try {
                class MockClient {

                    public request(config) {
                        throw new MethodCalled('request', config);
                    }
                }

                const service = new AuthenticationService({
                    baseURL: 'http://localhost',
                    headers: {'Authorization': 'Basic username:password'},
                    client: new MockClient() as any
                });
                await service.password('mail@mail.com', '12345678', 3600);
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
                expect(e.method).to.be.eq('request');
                expect(e.args).to.be.an('object');
                expect(e.args).to.be.deep.eq({
                    url: 'http://localhost/password',
                    method: 'POST',
                    headers: {'Authorization': 'Basic username:password'},
                    data: {email: 'mail@mail.com', password: '12345678', expiresIn: 3600}
                });
            }
        });

        it('should raise UserNotFound', async () => {
            try {
                class MockClient {

                    public request(config) {
                        throw new HttpClientError({
                            response: {
                                status: 400,
                                data: {
                                    data: null,
                                    errors: [
                                        {
                                            location: 'body',
                                            param: 'email',
                                            msg: 'UserNotFound'
                                        }
                                    ]
                                }
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    client: new MockClient() as any
                });
                await service.password('mail@mail.com', '12345678');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('UserNotFound');
            }
        });

        it('should raise UserNotActive', async () => {
            try {
                class MockClient {

                    public request() {
                        throw new HttpClientError({
                            response: {
                                status: 400,
                                data: {
                                    data: null,
                                    errors: [
                                        {
                                            location: 'body',
                                            param: 'email',
                                            msg: 'UserNotActive'
                                        }
                                    ]
                                }
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    client: new MockClient() as any
                });
                await service.password('mail@mail.com', '12345678');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('UserNotActive');
            }
        });

        it('should raise InvalidPassword', async () => {
            try {
                class MockClient {

                    public request() {
                        throw new HttpClientError({
                            response: {
                                status: 400,
                                data: {
                                    data: null,
                                    errors: [
                                        {
                                            location: 'body',
                                            param: 'email',
                                            msg: 'InvalidPassword'
                                        }
                                    ]
                                }
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    client: new MockClient() as any
                });
                await service.password('mail@mail.com', '12345678');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidPassword');
            }
        });

        it('should raise UnknownClientError', async () => {
            try {
                class MockClient {

                    public request() {
                        throw new HttpClientError({
                            response: {
                                status: 500
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    client: new MockClient() as any
                });
                await service.password('mail@mail.com', '12345678');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('UnknownClientError');
            }
        });

        it('should return token', async () => {
            class MockClient {

                public request() {
                    return {
                        data: {
                            data: 'jwt-token'
                        }
                    }
                }
            }

            const service = new AuthenticationService({
                client: new MockClient() as any
            });
            const token = await service.password('mail@mail.com', '12345678');
            expect(token).to.be.eq('jwt-token');
        });
    });

    describe('Verify', () => {
        it('should call "request" method from client', async () => {
            try {
                class MockClient {

                    public request(config) {
                        throw new MethodCalled('request', config);
                    }
                }

                const service = new AuthenticationService({
                    baseURL: 'http://localhost',
                    headers: {'Authorization': 'Basic username:password'},
                    client: new MockClient() as any
                });
                await service.verify('jwt-token');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('MethodCalled');
                expect(e.method).to.be.eq('request');
                expect(e.args).to.be.an('object');
                expect(e.args).to.be.deep.eq({
                    url: 'http://localhost/verify',
                    method: 'POST',
                    headers: {'Authorization': 'Basic username:password'},
                    data: {token: 'jwt-token'}
                });
            }
        });

        it('should raise UnexpectedResponse if response data null', async () => {
            try {
                class MockClient {

                    public request(config) {
                        return { data: null }
                    }
                }

                const service = new AuthenticationService({
                    client: new MockClient() as any
                });
                await service.verify('jwt-token');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('UnexpectedResponse');
            }
        });

        it('should raise UnexpectedResponse if decoded token data not valid', async () => {
            try {
                class MockClient {

                    public request() {
                        return {
                            data: {
                                data: {
                                    id: '12345678',
                                    email: 'notamail',
                                    role: 'GUEST'
                                }
                            }
                        }
                    }
                }

                const service = new AuthenticationService({
                    client: new MockClient() as any
                });
                await service.verify('jwt-token');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('UnexpectedResponse');
            }
        });

        it('should raise TokenExpired', async () => {
            try {
                class MockClient {

                    public request() {
                        throw new HttpClientError({
                            response: {
                                status: 400,
                                data: {
                                    data: null,
                                    errors: [
                                        {
                                            location: 'body',
                                            param: 'token',
                                            msg: 'TokenExpired'
                                        }
                                    ]
                                }
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    client: new MockClient() as any
                });
                await service.verify('jwt-token');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('TokenExpired');
            }
        });

        it('should raise InvalidToken', async () => {
            try {
                class MockClient {

                    public request() {
                        throw new HttpClientError({
                            response: {
                                status: 400,
                                data: {
                                    data: null,
                                    errors: [
                                        {
                                            location: 'body',
                                            param: 'token',
                                            msg: 'InvalidToken'
                                        }
                                    ]
                                }
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    client: new MockClient() as any
                });
                await service.verify('jwt-token');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('InvalidToken');
            }
        });

        it('should raise UnknownClientError', async () => {
            try {
                class MockClient {

                    public request() {
                        throw new HttpClientError({
                            response: {
                                status: 500
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    client: new MockClient() as any
                });
                await service.verify('jwt-token');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('UnknownClientError');
            }
        });

        it('should return decoded token', async () => {
            const mockDecodedToken = {
                "id": "5b4b57f1fc13ae1730000642",
                "role": "ADMIN",
                "email": "cbarstowk2@ftc.gov",
                "iat": 1533402085,
                "exp": 1691190085
            }
            class MockClient {

                public request() {
                    return {data: {data: mockDecodedToken}};
                }
            }

            const service = new AuthenticationService({
                client: new MockClient() as any
            });
            const decoded = await service.verify('jwt-token');
            expect(decoded).to.be.an('object');
            expect(decoded).to.have.keys(['id', 'role', 'email', 'iat', 'exp']);
            expect(decoded).to.be.deep.eq(mockDecodedToken);
        });
    });
});