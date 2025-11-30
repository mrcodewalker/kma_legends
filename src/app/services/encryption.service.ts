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

  private generateAESKey(): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(32); // 256 bits = 32 bytes
  }

  private generateIV(): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(16); // 128 bits = 16 bytes
  }

  private encryptWithAES(data: any, key: CryptoJS.lib.WordArray, iv: CryptoJS.lib.WordArray): string {
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }
  private encryptWithRSA(data: CryptoJS.lib.WordArray, publicKey: string): string {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);

    const dataHex = data.toString(CryptoJS.enc.Hex);
    const encrypted = encrypt.encrypt(dataHex);

    if (!encrypted) {
      throw new Error('RSA encryption failed');
    }
    return encrypted; // This is already Base64 encoded
  }
  public encryptData(data: any, publicKey: string): EncryptedData {
    try {
      const aesKey = this.generateAESKey();
      const iv = this.generateIV();
      const encryptedData = this.encryptWithAES(data, aesKey, iv);
      const encryptedKey = this.encryptWithRSA(aesKey, publicKey);
      const ivHex = iv.toString(CryptoJS.enc.Hex);
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
