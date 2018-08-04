import { expect } from 'chai';
import { describe, it } from 'mocha';
import { AuthenticationService } from '../../lib/services/authentication.service';
import { DataSource } from '../data/data';
import { IDBUserModel } from '../data/valid/db.model';

const endpoint = process.env.AUTH_ENDPOINT || 'http://localhost:3001/v1/';

const PATH = __dirname + '/../data/valid/db.json';
const database = new DataSource<IDBUserModel>().load(PATH);

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('E2E', () => {
    it('should return token', async () => {
        const service = new AuthenticationService({baseURL: endpoint});
        const user = database.one(d => d.deleted === false && d.active === true);
        const token = await service.password(user.email, user.email);
        expect(token).to.be.a('string');
        expect(token.length).to.be.gte(150);
    });

    it('should return token with expiresIn', async () => {
        const service = new AuthenticationService({baseURL: endpoint});
        const user = database.one(d => d.deleted === false && d.active === true);
        const token = await service.password(user.email, user.email, 3600);
        expect(token).to.be.a('string');
        expect(token.length).to.be.gte(150);
    });

    it('should raise UserNotFound for not existing user', async () => {
        try {
            const service = new AuthenticationService({baseURL: endpoint});
            await service.password('notexists@user.com', '12345678');
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('UserNotFound');
        }
    });

    it('should raise UserNotFound for deleted user', async () => {
        try {
            const service = new AuthenticationService({baseURL: endpoint});
            const user = database.one(d => d.deleted === true && d.active === true);
            await service.password(user.email, user.email);
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('UserNotFound');
        }
    });

    it('should raise UserNotActive for inactive user', async () => {
        try {
            const service = new AuthenticationService({baseURL: endpoint});
            const user = database.one(d => d.deleted === false && d.active === false);
            await service.password(user.email, user.email);
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('UserNotActive');
        }
    });

    it('should raise InvalidPassword for inactive user', async () => {
        try {
            const service = new AuthenticationService({baseURL: endpoint});
            const user = database.one(d => d.deleted === false && d.active === true);
            await service.password(user.email, user.firstName + user.lastName);
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('InvalidPassword');
        }
    });

    it('should raise UnknownClientError', async () => {
        try {
            const service = new AuthenticationService({baseURL: 'invalidurl'});
            const user = database.one(d => d.deleted === false && d.active === true);
            await service.password(user.email, user.email);
            throw new ShouldNotSucceed();
        } catch (e) {
            expect(e.name).to.be.eq('UnknownClientError');
        }
    });
});
