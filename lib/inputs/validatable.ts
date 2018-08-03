import { validateOrReject, ValidationError } from 'class-validator';
import { ValidatorOptions } from 'class-validator/validation/ValidatorOptions';

export class ArgumentValidationError extends Error {
    public name = 'ArgumentValidationError';
    public validationErrors: ValidationError[];
    public errors: { [key: string]: {[key: string]: string} };
    public fields: string[];

    constructor(errors: ValidationError[]) {
        super();
        this.validationErrors = errors;
        this.errors = {};
        errors.forEach(err => this.errors[err.property] = err.constraints);
        this.fields = Object.keys(this.errors);
    }

    /**
     * Check field has error. If error is given checks error exists on field
     * @param {string} field: Field name
     * @param {string} error: Error name for the field
     */
    public hasError(field: string, error?: string): boolean {
        if (field in this.errors) {
            return error ? error in this.errors[field] : true;
        }
        return false;
    }
}

export class Validatable {

    constructor(data: object = {}, fields: string[]) {
        Object.keys(data).forEach(key => {
            if (fields.find(field => field === key)) {
                this[key] = data[key];
            }
        });
    }

    public async validate(overwrites: ValidatorOptions = {}) {
        try {
            await validateOrReject(this, {
                skipMissingProperties: false,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
                ...overwrites
            });
        } catch (e) {
            if (Array.isArray(e)) {
                throw new ArgumentValidationError(e);
            }
            throw e;
        }
        return this;
    }
}
