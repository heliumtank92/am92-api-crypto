export default ApiCrypto;
declare namespace ApiCrypto {
    export { initialize };
    export { getPublicKey };
    export { decryptKey };
    export { encryptData };
    export { decryptData };
}
declare function initialize(validateClient?: (clientId: any) => Promise<boolean>): Promise<void>;
declare function getPublicKey(clientId: any): Promise<any>;
declare function decryptKey(clientId?: string, ciphertextKey?: string): Promise<any>;
declare function encryptData(data: any, key: any): string;
declare function decryptData(payload: any, key: any): any;
