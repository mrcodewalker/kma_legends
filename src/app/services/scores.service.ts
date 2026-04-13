import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListScoreResponse, VirtualScoreTable, ScoreBatchRequest } from '../models/scores.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScoresService {
  private readonly SCORES_URL = `${environment.apiLocalUrl}/scores/users`;
  private readonly VIRTUAL_SCORES_SAVE_URL = `${environment.apiLocalUrl}/score-batch/create-or-update`;
  private readonly VIRTUAL_SCORES_GET_URL = `${environment.apiLocalUrl}/score-batch/student`;
  private readonly VIRTUAL_SCORES_GET_ENCRYPTED_URL = `${environment.apiLocalUrl}/score-batch/get-by-encrypted`;

  constructor(private http: HttpClient) { }

  /** GET /api/v1/scores/users/{studentCode} — plain, response masked */
  fetchScores(studentCode: string): Observable<ListScoreResponse> {
    return this.http.get<ListScoreResponse>(`${this.SCORES_URL}/${studentCode}`);
  }

  /** POST /api/v1/score-batch/create-or-update — body encrypted by interceptor */
  saveVirtualScores(virtualTable: VirtualScoreTable): Observable<any> {
    const payload: ScoreBatchRequest = {
      studentInfo: {
        studentCode: virtualTable.studentInfo.studentCode,
        studentName: virtualTable.studentInfo.studentName,
        studentClass: virtualTable.studentInfo.studentClass
      },
      scores: virtualTable.scores,
      lastUpdated: virtualTable.lastUpdated instanceof Date
        ? virtualTable.lastUpdated.toISOString()
        : new Date().toISOString()
    };
    return this.http.post(this.VIRTUAL_SCORES_SAVE_URL, payload);
  }

  /** POST /api/v1/score-batch/student/encrypted — interceptor tự encrypt body */
  getVirtualScoresEncrypted(studentCode: string): Observable<any> {
    return this.http.post<any>(this.VIRTUAL_SCORES_GET_ENCRYPTED_URL, { studentCode });
  }

  /** POST /api/v1/scores/restore — lấy điểm không mask để restore bảng ảo, encrypted by interceptor */
  restoreScores(studentCode: string): Observable<ListScoreResponse> {
    return this.http.post<ListScoreResponse>(`${environment.apiLocalUrl}/scores/restore`, { studentCode });
  }
}
