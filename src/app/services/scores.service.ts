import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListScoreResponse } from '../models/scores.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScoresService {
  private readonly FETCH_SCORES_URL = `${environment.apiLocalUrl}/ranking/scores`;
  constructor(private http: HttpClient) {}

  fetchScores(credentials: { studentCode: string }): Observable<any> {
    return this.http.post(this.FETCH_SCORES_URL, credentials);
  }
}
