import { expect } from 'chai';
import { describe, it } from 'mocha';
import { PasswordInput } from '../../../lib/inputs/password.input';

class ShouldNotSucceed extends Error {
    public name = 'ShouldNotSucceed';
}

describe('Unit -> Inputs -> PasswordInput', () => {
    describe('Email', () => {
        it('should be valid', async () => {
            const input = new PasswordInput('email@mail.com', '12345678');
            expect(input).to.have.keys(['email', 'password']);
            expect(input.email).to.be.eq('email@mail.com');
            await input.validate();
        });

        it('should raise ValidationError', async () => {
            try {
                await new PasswordInput('notaemail', '12345678').validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('email', 'isEmail')).to.be.eq(true);
            }
        });
    });

    describe('Password', () => {
        it('should be valid', async () => {
            const input1 = new PasswordInput('mail@mail.com', '12345678');
            expect(input1).to.have.keys(['email', 'password']);
            expect(input1.password).to.be.eq('12345678');
            await input1.validate();

            const input2 = new PasswordInput('mail@mail.com', '1237aysd.1öças-*149-*');
            expect(input2).to.have.keys(['email', 'password']);
            expect(input2.password).to.be.eq('1237aysd.1öças-*149-*');
            await input2.validate();
        });

        it('should raise ValidationError', async () => {
            try {
                await new PasswordInput('mail@mail.com', '').validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('password', 'length')).to.be.eq(true);
            }

            try {
                await new PasswordInput('mail@mail.com', 'a'.repeat(41)).validate();
                throw new ShouldNotSucceed();
            } catch (e) {
                expect(e.name).to.be.eq('ArgumentValidationError');
                expect(e.hasError('password', 'length')).to.be.eq(true);
            }
        });
    });
});