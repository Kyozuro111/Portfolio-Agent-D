import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32

function getKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, "sha512")
}

export class SecretProvider {
  private appSecret: string

  constructor(appSecret: string) {
    this.appSecret = appSecret || "default-secret-for-hardcoded-keys-only"
  }

  encrypt(text: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const key = getKey(this.appSecret, salt)
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    return Buffer.concat([salt, iv, tag, Buffer.from(encrypted, "hex")]).toString("base64")
  }

  decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, "base64")

    const salt = buffer.subarray(0, SALT_LENGTH)
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)

    const key = getKey(this.appSecret, salt)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  maskKey(key: string): string {
    if (key.length <= 4) return "****"
    return "****" + key.slice(-4)
  }
}

export function getSecretProvider(): SecretProvider {
  return new SecretProvider("default-secret-for-hardcoded-keys-only")
}
