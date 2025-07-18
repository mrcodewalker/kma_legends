import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { EncryptionKeys } from '../models/encryption.model';
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PublicKeyService {
  private readonly RSA_KEY_ENDPOINT = `${environment.apiLocalUrl}/encryption/public-key`;
  private publicKey$: Observable<EncryptionKeys> | null = null;

  constructor(private http: HttpClient) {}

  getPublicKey(): Observable<EncryptionKeys> {
    if (!this.publicKey$) {
      this.publicKey$ = this.http.get(this.RSA_KEY_ENDPOINT, { responseType: 'text' })
        .pipe(
          map(publicKey => ({
            publicKey,
            timestamp: Date.now()
          })),
          shareReplay(1)
        );
    }
    return this.publicKey$;
  }
}
