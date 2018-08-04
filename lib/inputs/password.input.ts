import { IsEmail, IsNumber, Length, Max, Min, ValidateIf } from "class-validator";
import { Validatable } from "./validatable";

export class PasswordInput extends Validatable {

    @IsEmail({}, {message: 'InvalidEmail'})
    public email: string;

    @Length(8, 32, {message: 'InvalidLength'})
    public password: string;

    @ValidateIf((object, value) => value !== undefined)
    @IsNumber({}, {message: 'InvalidNumber'})
    @Min(0, {message: 'Min'})
    @Max(2592000, {message: 'Max'})
    public expiresIn: number | undefined;

    constructor(email: string, password: string, expiresIn?: number) {
        super({}, ['email', 'password']);
        this.email = email;
        this.password = password;
        this.expiresIn = expiresIn;
    }
}
