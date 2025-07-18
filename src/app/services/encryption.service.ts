import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';
import { EncryptedData } from '../models/encryption.model';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly KEY_SIZE = 256; // AES-256

  constructor() {}

  /**
   * Generate random AES key as WordArray
   */
  private generateAESKey(): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(32); // 256 bits = 32 bytes
  }

  /**
   * Generate random IV as WordArray
   */
  private generateIV(): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(16); // 128 bits = 16 bytes
  }

  /**
   * Encrypt data using AES
   */
  private encryptWithAES(data: any, key: CryptoJS.lib.WordArray, iv: CryptoJS.lib.WordArray): string {
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Return Base64 encoded string
    return encrypted.toString();
  }

  /**
   * Encrypt data using RSA public key
   */
  private encryptWithRSA(data: CryptoJS.lib.WordArray, publicKey: string): string {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    
    // Convert WordArray to hex string for RSA encryption
    const dataHex = data.toString(CryptoJS.enc.Hex);
    const encrypted = encrypt.encrypt(dataHex);
    
    if (!encrypted) {
      throw new Error('RSA encryption failed');
    }
    return encrypted; // This is already Base64 encoded
  }

  /**
   * Encrypt data with both AES and RSA
   */
  public encryptData(data: any, publicKey: string): EncryptedData {
    try {
      // Generate new AES key and IV as WordArrays
      const aesKey = this.generateAESKey();
      const iv = this.generateIV();

      // console.log('Debug - Original values:', {
      //   data,
      //   aesKeyHex: aesKey.toString(CryptoJS.enc.Hex),
      //   ivHex: iv.toString(CryptoJS.enc.Hex)
      // });

      // Encrypt data with AES
      const encryptedData = this.encryptWithAES(data, aesKey, iv);

      // Encrypt AES key with RSA public key
      const encryptedKey = this.encryptWithRSA(aesKey, publicKey);

      // Convert IV to hex string for transport
      const ivHex = iv.toString(CryptoJS.enc.Hex);

      // console.log('Debug - Encrypted values:', {
      //   encryptedData,
      //   encryptedKey,
      //   ivHex
      // });

      return {
        encryptedKey,
        encryptedData,
        iv: ivHex
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }
}
