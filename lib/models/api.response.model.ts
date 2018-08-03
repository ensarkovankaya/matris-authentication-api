import { IValidationError } from "./validation.error.model";

export interface IAPIResponse<T> {
    data: T;
    errors?: IValidationError[];
}
