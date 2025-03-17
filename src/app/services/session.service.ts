import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { GET_SESSIONS_CONCAT } from './queries'
import { Observable, map } from 'rxjs';
import { SessionsCursorResponse } from '../models/speaker.interface';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private apollo = inject(Apollo);

  getSessions(afterCursor: string = '', limit: number = 4): Observable<SessionsCursorResponse> {
    return this.apollo.watchQuery<SessionsCursorResponse>({
      query: GET_SESSIONS_CONCAT,
      variables: {
        afterCursor,
        limit
      }
    }).valueChanges.pipe(
      map(result => result.data)
    );
  }
}
