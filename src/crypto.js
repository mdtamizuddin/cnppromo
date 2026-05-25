import CryptoJS from "crypto-js";
const secretKey = "your-secret-key"; // Change this to a secure key

export const handleEncrypt = (data) => {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
    return encryptedData
};

export const handleDecrypt = (encrypted) => {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
};