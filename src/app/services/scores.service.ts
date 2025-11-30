import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListScoreResponse, VirtualScoreTable } from '../models/scores.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScoresService {
  private readonly FETCH_SCORES_URL = `${environment.apiLocalUrl}/ranking/scores`;
  private readonly VIRTUAL_SCORES_SAVE_URL = `${environment.apiLocalUrl}/score-batch/create-or-update`;
  private readonly VIRTUAL_SCORES_GET_URL = `${environment.apiLocalUrl}/score-batch/student`;

  constructor(private http: HttpClient) {}

  fetchScores(credentials: { studentCode: string }): Observable<any> {
    return this.http.post(this.FETCH_SCORES_URL, credentials);
  }

  saveVirtualScores(virtualTable: VirtualScoreTable): Observable<any> {
    return this.http.post(this.VIRTUAL_SCORES_SAVE_URL, virtualTable);
  }

  getVirtualScores(studentCode: string): Observable<any> {
    // Server có thể trả về cấu trúc khác với VirtualScoreTable (ví dụ: scoreItems,...)
    // Vì vậy để linh hoạt, ta để any và chuẩn hóa ở component.
    return this.http.get<any>(`${this.VIRTUAL_SCORES_GET_URL}/${studentCode}`);
  }
}
