import { IsEmail, Length } from "class-validator";
import { Validatable } from "./validatable";

export class PasswordInput extends Validatable {

    @IsEmail({}, {message: 'InvalidEmail'})
    public email: string;

    @Length(8, 32, {message: 'InvalidLength'})
    public password: string;

    constructor(email: string, password: string) {
        super({}, ['email', 'password']);
        this.email = email;
        this.password = password;
    }
}
