import crypto from "crypto"
import dotenv from 'dotenv';
dotenv.config()
const secretKey = process.env.ENCRYPTION_KEY || "your-256-bit-secret-key"; // Use an environment variable for security

// Encrypt data
function encryptData(data) {
    const iv = crypto.randomBytes(16); // Initialization vector for AES-256-CBC
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secretKey, "hex"), iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted; // Store IV with encrypted data
}

// Decrypt data
function decryptData(encryptedData) {
    const [ivHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secretKey, "hex"), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

export { encryptData, decryptData };
