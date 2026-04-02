import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET || "default_fajiri_secret_key_123456";

export function encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

export function decryptData(encryptedData: string): string | null {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || null;
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
}
