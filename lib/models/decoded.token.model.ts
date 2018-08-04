import { Role } from './role.model';

export interface IDecodedTokenModel {
    id: string;
    email: string;
    role: Role;
    iat: number;
    expr: number;
}
