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
    describe('Password', () => {

        it('should initialize with default options', async () => {
            const service = new AuthenticationService();
            expect(service.url).to.be.eq('');
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
                url: 'http://localhost',
                client: new MockClient() as any,
                logger: console,
                headers: {key: 'value'}
            });
            expect(service.url).to.be.eq('http://localhost');
            expect(service.client).to.be.an('object');
            expect(service.client).to.be.instanceof(MockClient);
            expect(service.logger).to.be.eq(console);
            expect(service.headers).to.be.an('object');
            expect(service.headers).to.be.deep.eq({key: 'value'});
        });

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

        it('should call "request" from client', async () => {
            try {
                class MockClient {

                    public request(config) {
                        throw new MethodCalled('request', config);
                    }
                }

                const service = new AuthenticationService({
                    url: 'http://localhost',
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
                    url: 'http://localhost',
                    method: 'POST',
                    headers: {'Authorization': 'Basic username:password'},
                    data: {email: 'mail@mail.com', password: '12345678'}
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
                    url: 'http://localhost',
                    headers: {'Authorization': 'Basic username:password'},
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
                                            msg: 'UserNotActive'
                                        }
                                    ]
                                }
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    url: 'http://localhost',
                    headers: {'Authorization': 'Basic username:password'},
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
                                            msg: 'InvalidPassword'
                                        }
                                    ]
                                }
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    url: 'http://localhost',
                    headers: {'Authorization': 'Basic username:password'},
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

                    public request(config) {
                        throw new HttpClientError({
                            response: {
                                status: 500
                            }
                        } as any);
                    }
                }

                const service = new AuthenticationService({
                    url: 'http://localhost',
                    headers: {'Authorization': 'Basic username:password'},
                    client: new MockClient() as any
                });
                await service.password('mail@mail.com', '12345678');
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('UnknownClientError');
            }
        });
    });
});