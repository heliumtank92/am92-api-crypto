/** @ignore */
export function constantGenerator<T extends string>(values: T[]) {
  const MAP = values.reduce<{ [key in T]?: key }>(
    (acc, value) => ({ ...acc, [value]: value }),
    {}
  ) as { [key in T]: key }

  return {
    MAP,
    ENUM: values
  }
}

/** @ignore */
export type RsaKeyObject = {
  publicKey: string
  privateKey: string
  encryptedPrivateKey: string
  newKey: boolean
}

/** @ignore */
export type AesKeyObject = {
  aesKey: string
}
