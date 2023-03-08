export default KeyManager;
declare namespace KeyManager {
    export { initialize };
    export { getPublicKey };
    export { getPrivateKey };
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
