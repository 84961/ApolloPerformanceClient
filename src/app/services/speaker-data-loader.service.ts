import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { Speaker } from '../models/speaker-data-loader.interface';
import { SpeakersResponse,PaginationParams } from '../models/speaker-data-loader.interface';
import { GET_SPEAKERS } from './data-loader.queries';
@Injectable({
  providedIn: 'root'
})
export class SpeakerDataLoaderService {
  private apollo = inject(Apollo);

  getSpeakers(params: PaginationParams): Observable<SpeakersResponse> {
      return this.apollo.watchQuery<SpeakersResponse>({
        query: GET_SPEAKERS,
        variables: {
          offset: params.offset,
          limit: params.limit
        }
      }).valueChanges.pipe(
        map(result => result.data)
      );
    }
}