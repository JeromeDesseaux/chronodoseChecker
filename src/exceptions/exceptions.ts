class NetworkException extends Error {
    constructor(m: string) {
        super(m);
    }
}

class ElementNotFoundException extends Error {
    constructor(m: string) {
        super(m);
    }
}

export {
    NetworkException,
    ElementNotFoundException
}