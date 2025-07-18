import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SemesterService {
  private readonly FETCH_SCHOLARSHIP_URL = `${environment.apiLocalUrl}/semester/filter/scholarship`;

  constructor(private http: HttpClient) {}

  fetchScholarship(credentials: { code: string;}): Observable<any> {
    return this.http.post(this.FETCH_SCHOLARSHIP_URL, credentials);
  }
}
