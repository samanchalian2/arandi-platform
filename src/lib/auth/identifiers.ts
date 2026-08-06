const IRAN_MOBILE_PATTERN = /^9\d{9}$/;

export function normalizeIranianMobile(value: string): string {
    let digits = value.trim().replace(/[\s()-]/g, "");

    if (digits.startsWith("+")) digits = digits.slice(1);
    if (digits.startsWith("0098")) digits = digits.slice(4);
    else if (digits.startsWith("98")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = digits.slice(1);

    if (!IRAN_MOBILE_PATTERN.test(digits)) {
        throw new Error("Mobile number must be a valid Iranian mobile number.");
    }

    return `+98${digits}`;
}

export function normalizeEmail(value: string): string {
    const email = value.trim().toLowerCase();
    if (
        email.length > 254
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        throw new Error("Email address is invalid.");
    }
    return email;
}
