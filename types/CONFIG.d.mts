export default CONFIG;
declare namespace CONFIG {
    export { API_CRYPTO_MODE as MODE };
    export { API_CRYPTO_CLIENT_IDS as CLIENT_IDS };
    export { API_CRYPTO_STATIC_PUBLIC_KEY as STATIC_PUBLIC_KEY };
    export { API_CRYPTO_STATIC_PRIVATE_KEY as STATIC_PRIVATE_KEY };
    export { API_CRYPTO_KEY_ROTATION_IN_DAYS as KEY_ROTATION_IN_DAYS };
    export namespace KMS_CONFIG {
        export { API_CRYPTO_KMS_TYPE as TYPE };
        export { API_CRYPTO_KMS_MASTER_KEY_HEX as MASTER_KEY_HEX };
        export { API_CRYPTO_KMS_MASTER_IV_HEX as MASTER_IV_HEX };
        export { API_CRYPTO_KMS_AWS_KEY_ID as AWS_KEY_ID };
        export namespace AWS_CONNECTION_CONFIG {
            export { API_CRYPTO_KMS_AWS_REGION as region };
        }
    }
    export { DEDICATED_REDIS };
    export namespace REDIS_CONFIG {
        export { REDIS_CONNECTION_CONFIG as CONNECTION_CONFIG };
        export { API_CRYPTO_REDIS_KEY_PREFIX as KEY_PREFIX };
    }
}
export const SERVICE: string;
declare const API_CRYPTO_MODE: any;
declare const API_CRYPTO_CLIENT_IDS: any;
declare const API_CRYPTO_STATIC_PUBLIC_KEY: any;
declare const API_CRYPTO_STATIC_PRIVATE_KEY: any;
declare const API_CRYPTO_KEY_ROTATION_IN_DAYS: any;
declare const API_CRYPTO_KMS_TYPE: any;
declare const API_CRYPTO_KMS_MASTER_KEY_HEX: any;
declare const API_CRYPTO_KMS_MASTER_IV_HEX: any;
declare const API_CRYPTO_KMS_AWS_KEY_ID: any;
declare const API_CRYPTO_KMS_AWS_REGION: any;
declare const DEDICATED_REDIS: boolean;
declare let REDIS_CONNECTION_CONFIG: any;
declare const API_CRYPTO_REDIS_KEY_PREFIX: any;
