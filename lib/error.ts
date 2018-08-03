export class UserNotFound extends Error {
    public name = 'UserNotFound';
}

export class UserNotActive extends Error {
    public name = 'UserNotActive';
}

export class InvalidPassword extends Error {
    public name = 'InvalidPassword';
}

export class UnknownClientError extends Error {
    public name = 'UnknownClientError';
}

export class UnexpectedResponse extends Error {
    public name = 'UnexpectedResponse';
}
