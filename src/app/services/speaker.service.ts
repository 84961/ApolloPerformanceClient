import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { Speaker, SpeakersResponse } from '../models/speaker.interface';

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
          favorite
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

  addSpeaker(first: string, last: string, favorite: boolean): Observable<Speaker> {
    return this.apollo.mutate<{addSpeaker: Speaker}>({
      mutation: this.ADD_SPEAKER,
      variables: { first, last, favorite },
      refetchQueries: [{ query: this.GET_SPEAKERS }]
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
}
