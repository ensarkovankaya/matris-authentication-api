import { IsEmail, IsIn, IsNumber, IsString, Length } from '../../node_modules/class-validator';
import { IDecodedTokenModel } from '../models/decoded.token.model';
import { Role } from '../models/role.model';
import { Validatable } from './validatable';

export class DecodedToken extends Validatable {

    @IsString()
    @Length(24, 24)
    public id: string | undefined;

    @IsEmail()
    public email: string | undefined;

    @IsIn([Role.ADMIN, Role.MANAGER, Role.INSTRUCTOR, Role.PARENT, Role.STUDENT])
    public role: Role | undefined;

    @IsNumber()
    public iat: number | undefined;

    @IsNumber()
    public exp: number | undefined;

    constructor(data: IDecodedTokenModel) {
        super(data, ['id', 'email', 'role', 'iat', 'exp']);
    }
}
