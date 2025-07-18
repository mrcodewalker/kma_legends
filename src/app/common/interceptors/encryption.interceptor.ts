import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { EncryptionService } from '../../services/encryption.service';
import { PublicKeyService } from '../../services/public-key.service';

@Injectable()
export class EncryptionInterceptor implements HttpInterceptor {
  constructor(
    private encryptionService: EncryptionService,
    private publicKeyService: PublicKeyService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.shouldEncrypt(request)) {
      return next.handle(request);
    }

    return from(this.encryptData(request.body)).pipe(
      switchMap(encryptedData => {
        // console.log('Request to encrypt:', request.body);
        // console.log('Encrypted request body:', encryptedData);

        const encryptedRequest = request.clone({
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'X-Encrypted': 'true'
          }),
          body: encryptedData
        });
        return next.handle(encryptedRequest);
      }),
      catchError(error => {
        console.error('Encryption interceptor error:', error);
        throw error;
      })
    );
  }

  private shouldEncrypt(request: HttpRequest<any>): boolean {
    return request.method === 'POST' &&
      request.body &&
      !request.url.includes('/api/v1/encryption/public-key');
  }

  private async encryptData(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.publicKeyService.getPublicKey().subscribe({
        next: (keys) => {
          try {
            // console.log('Using public key:', keys.publicKey);
            const encryptedData = this.encryptionService.encryptData(data, keys.publicKey);
            resolve(encryptedData);
          } catch (error) {
            console.error('Error encrypting data:', error);
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error getting public key:', error);
          reject(error);
        }
      });
    });
  }
}
