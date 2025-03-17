import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Observable, map, tap } from 'rxjs';
import { PaginationParams, Speaker, SpeakerInput, SpeakersPaginatedResponse, SpeakersResponse } from '../models/speaker.interface';

@Injectable({
  providedIn: 'root'
})
export class SpeakerService {
  private apollo = inject(Apollo);

  private GET_SPEAKERS = gql`
    query {
      speakers {
        datalist {
          id
          first
          last
          fullName @client
          checkBoxColumn @client
          favorite
        }
      }
    }
  `;

  GET_SPEAKERS_OFFSET_PAGINATED = gql`
    query GetSpeakersOffsetPaginated($offset: Int, $limit: Int) {
      speakers(offset: $offset, limit: $limit) {
        datalist {
          id
          first
          last
          favorite
          fullName @client
          checkBoxColumn @client
        }
        pageInfo {
          totalItemCount
        }
      }
    }
  `;


  private ADD_SPEAKER = gql`
    mutation AddSpeaker($first: String, $last: String, $favorite: Boolean) {
      addSpeaker(speaker: { first: $first, last: $last, favorite: $favorite }) {
        id
        first
        last
        favorite
      }
    }
  `;

  private TOGGLE_FAVORITE = gql`
    mutation ToggleSpeakerFavorite($speakerId: Int!) {
      toggleSpeakerFavorite(speakerId: $speakerId) {
        id
        first
        last
        favorite
      }
    }
  `;

  private DELETE_SPEAKER = gql`
    mutation DeleteSpeaker($speakerId: Int!) {
      deleteSpeaker(speakerId: $speakerId) {
        id
        first
        last
        favorite
      }
    }
  `;

  getSpeakers(): Observable<Speaker[]> {
    return this.apollo.watchQuery<SpeakersResponse>({
      query: this.GET_SPEAKERS
    }).valueChanges.pipe(
      map(({ data }) => data.speakers.datalist)
    );
  }

  getSpeakersOffsetPaginated(params: PaginationParams): Observable<SpeakersPaginatedResponse> {
    return this.apollo.watchQuery<SpeakersPaginatedResponse>({
      query: this.GET_SPEAKERS_OFFSET_PAGINATED,
      variables: {
        offset: params.offset,
        limit: params.limit
      }
    }).valueChanges.pipe(
      map(result => result.data)
    );
  }

  addSpeaker(speaker:SpeakerInput): Observable<Speaker> {
    const { first, last, favorite } = speaker;
    return this.apollo.mutate<{addSpeaker: Speaker}>({
      mutation: this.ADD_SPEAKER,
      variables: { first, last, favorite },
      refetchQueries: [{ query: this.GET_SPEAKERS }]
    }).pipe(
      map(result => result.data!.addSpeaker)
    );
  }


  addSpeakerOptimistic(speaker: SpeakerInput): Observable<Speaker> {
    return this.apollo.mutate<{addSpeaker: Speaker}>({
      mutation: gql`
        mutation AddSpeaker($first: String, $last: String, $favorite: Boolean) {
          addSpeaker(speaker: { first: $first, last: $last, favorite: $favorite }) {
            id
            first
            last
            favorite
          }
        }
      `,
      variables: speaker,
      update: (cache, { data }) => {
        const existingData = cache.readQuery<{speakers: {datalist: Speaker[]}}>({
          query: this.GET_SPEAKERS
        });
        
        cache.writeQuery({
          query: this.GET_SPEAKERS,
          data: {
            speakers: {
              __typename: 'SpeakerResults',
              datalist: [data!.addSpeaker, ...(existingData?.speakers.datalist || [])]
            }
          }
        });
      }
    }).pipe(
      map(result => result.data!.addSpeaker)
    );
  }

  toggleFavorite(speakerId: number | string): Observable<Speaker> {
    const id = Number(speakerId);
    return this.apollo.mutate<{toggleSpeakerFavorite: Speaker}>({
      mutation: this.TOGGLE_FAVORITE,
      variables: { speakerId: id }
    }).pipe(
      map(result => result.data!.toggleSpeakerFavorite)
    );
  }


  toggleFavoriteOptimistic(id: number, speaker: Speaker): Observable<Speaker> {
    return this.apollo.mutate<{toggleSpeakerFavorite: Speaker}>({
      mutation: gql`
        mutation ToggleSpeakerFavorite($speakerId: Int!) {
          toggleSpeakerFavorite(speakerId: $speakerId) {
            id
            first
            last
            favorite
          }
        }
      `,
      variables: { speakerId: id },
      optimisticResponse: {
        toggleSpeakerFavorite: {
          __typename: 'Speaker',
          id: speaker.id,
          first: speaker.first,
          last: speaker.last,
          favorite: !speaker.favorite
        }
      }
    }).pipe(
      map(result => result.data!.toggleSpeakerFavorite)
    );
  }

  deleteSpeaker(speakerId: number | string): Observable<Speaker> {
    const id = Number(speakerId);
    return this.apollo.mutate<{deleteSpeaker: Speaker}>({
      mutation: this.DELETE_SPEAKER,
      variables: { speakerId: id },
      refetchQueries: [{ query: this.GET_SPEAKERS }]
    }).pipe(
      map(result => result.data!.deleteSpeaker)
    );
  }


  deleteSpeakerOptimistic(id: number, speaker: Speaker): Observable<Speaker> {
    return this.apollo.mutate<{deleteSpeaker: Speaker}>({
      mutation: this.DELETE_SPEAKER,
      variables: { speakerId: id },
      optimisticResponse: {
        deleteSpeaker: {
          __typename: 'Speaker',
          id: speaker.id,
          first: speaker.first,
          last: speaker.last,
          favorite: speaker.favorite
        }
      },
      update: (cache, { data }) => {
        try {
          const existingData = cache.readQuery<{speakers: {datalist: Speaker[]}}>({
            query: this.GET_SPEAKERS
          });
  
          if (existingData) {
            const updatedList = existingData.speakers.datalist.filter(s => Number(s.id) != Number(id));
            
            cache.writeQuery({
              query: this.GET_SPEAKERS,
              data: {
                speakers: {
                  __typename: 'SpeakerResults',
                  datalist: updatedList
                }
              }
            });
          }
        } catch (error) {
          console.error('Cache update error:', error);
        }
      }
      // Removed fetchPolicy: 'no-cache' to allow cache updates
    }).pipe(
      tap(response => console.log('Delete mutation response:', response)),
      map(result => result.data!.deleteSpeaker)
    );
  }

  sortSpeakersDescending(): void {
    const cache = this.apollo.client.cache;
    const existingData = cache.readQuery<{speakers: {datalist: Speaker[]}}>({
      query: this.GET_SPEAKERS
    });

    if (existingData) {
      cache.writeQuery({
        query: this.GET_SPEAKERS,
        data: {
          speakers: {
            __typename: 'SpeakerResults',
            datalist: [...existingData.speakers.datalist].sort((a, b) => b.id - a.id)
          }
        }
      });
    }
  }

  watchSpeakers(): Observable<Speaker[]> {
    console.log('Initiating watchSpeakers query');
    return this.apollo.watchQuery<SpeakersResponse>({
      query: this.GET_SPEAKERS,
      fetchPolicy: 'network-only', // Force network request on first call
      nextFetchPolicy: 'cache-first', // Use cache for subsequent updates
      notifyOnNetworkStatusChange: true // Get notified of loading states
    }).valueChanges.pipe(
      tap(response => {
        console.log('Apollo response:', response);
        console.log('Network status:', response.networkStatus);
      }),
      map(({ data }) => data.speakers.datalist)
    );
  }

}
