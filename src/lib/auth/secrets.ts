export function requireAuthPepper(
    env: { AUTH_TOKEN_PEPPER?: string; NODE_ENV?: string } = process.env,
): string {
    const pepper = env.AUTH_TOKEN_PEPPER?.trim();
    if (!pepper || pepper.length < 32) {
        throw new Error("AUTH_TOKEN_PEPPER must contain at least 32 characters.");
    }
    return pepper;
}
