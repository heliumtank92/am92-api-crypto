export default Redis;
declare namespace Redis {
    export { initialize };
    export { getPublicKey };
    export { setPublicKey };
    export { getPrivateKey };
    export { setPrivateKey };
    export { getEncryptedPrivateKey };
    export { setEncryptedPrivateKey };
    export { setAesKey };
    export { getAesKey };
}
declare function initialize(): Promise<void>;
declare function getPublicKey(clientId?: string): Promise<any>;
declare function setPublicKey(clientId?: string, key?: string): Promise<any>;
declare function getPrivateKey(clientId?: string): Promise<any>;
declare function setPrivateKey(clientId?: string, key?: string): Promise<any>;
declare function getEncryptedPrivateKey(clientId?: string): Promise<any>;
declare function setEncryptedPrivateKey(clientId?: string, key?: string): Promise<any>;
declare function setAesKey(encryptedKey?: string, plaintextKey?: string): Promise<any>;
declare function getAesKey(encryptedKey?: string): Promise<any>;
