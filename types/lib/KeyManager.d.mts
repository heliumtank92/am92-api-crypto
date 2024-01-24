export default KeyManager;
declare namespace KeyManager {
    export { initialize };
    export { getPublicKey };
    export { getPrivateKey };
    export { getAesKey };
}
declare function initialize(): void;
declare function getPublicKey(clientId?: string): Promise<{
    publicKey: any;
    privateKey: any;
    encryptedPrivateKey: any;
    newKey: boolean;
} | {
    publicKey: any;
}>;
declare function getPrivateKey(clientId?: string): Promise<{
    publicKey: any;
    privateKey: any;
    encryptedPrivateKey: any;
    newKey: boolean;
} | {
    privateKey: any;
}>;
declare function getAesKey(encryptedAesKey?: string): Promise<{
    aesKey: any;
}>;
