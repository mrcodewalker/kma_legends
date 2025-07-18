export interface EncryptedData {
  encryptedKey: string;  // AES key được mã hóa bằng RSA public key
  encryptedData: string; // Dữ liệu được mã hóa bằng AES
  iv: string;           // Initialization vector cho AES
}

export interface EncryptionKeys {
  publicKey: string;    // RSA public key từ server
  timestamp: number;    // Thời điểm nhận key
} 