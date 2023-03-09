export default class ApiCryptoError extends Error {
    constructor(e: {}, eMap: any);
    _isCustomError: boolean;
    _isApiCryptoError: boolean;
    service: string;
    message: any;
    statusCode: any;
    errorCode: any;
    error: {};
}
