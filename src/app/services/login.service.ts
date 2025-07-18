import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly LOGIN_URL = `${environment.apiLocalUrl}/auth/login`;
  private readonly LOGIN_VIRTUAL_CALENDAR_URL = `${environment.apiLocalUrl}/auth/virtual-calendar`;

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(this.LOGIN_URL, credentials);
  }
  loginVirtualCalendar(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(this.LOGIN_VIRTUAL_CALENDAR_URL, credentials);
  }
}
