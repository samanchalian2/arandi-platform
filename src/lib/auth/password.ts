import { hash, verify } from "@node-rs/argon2";

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;

export function validatePassword(password: string): void {
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
        throw new Error(`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`);
    }
    if (!/[A-Za-z\u0600-\u06ff]/u.test(password) || !/\d/.test(password)) {
        throw new Error("Password must contain at least one letter and one number.");
    }
}

export async function hashPassword(password: string): Promise<string> {
    validatePassword(password);
    return hash(password, {
        algorithm: 2,
        memoryCost: 65_536,
        timeCost: 3,
        parallelism: 1,
        outputLen: 32,
    });
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
    if (!passwordHash.startsWith("$argon2id$")) return false;
    try {
        return await verify(passwordHash, password);
    } catch {
        return false;
    }
}
