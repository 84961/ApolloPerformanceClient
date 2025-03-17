import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { currentThemeVar } from '../app.config';
import { checkBoxListVar, allSpeakerIdsVar } from '../graphql/reactive-variables';

interface ThemeData {
  currentTheme: 'light' | 'dark';
}

const GET_THEME = gql`
  query GetTheme {
    currentTheme @client
  }
`;

const GET_SELECTED_SPEAKERS = gql`
  query GetSelectedSpeakers {
    selectedSpeakers @client
    allSpeakerIds @client
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ApolloService {
  constructor(private apollo: Apollo) {
    this.watchTheme();
    this.watchSelections();
  }

  private watchTheme() {
    this.apollo.watchQuery<ThemeData>({
      query: GET_THEME
    }).valueChanges.subscribe(({ data }) => {
      document.body.classList.toggle('dark-theme', data.currentTheme === 'dark');
    });
  }

  private watchSelections() {
    this.apollo.watchQuery({
      query: GET_SELECTED_SPEAKERS
    }).valueChanges.subscribe(({ data }: any) => {
      console.log('Cache selections updated:', data);
    });
  }

  getCurrentTheme() {
    return currentThemeVar();
  }

  setTheme(theme: 'light' | 'dark') {
    currentThemeVar(theme);
  }

  updateAllSpeakerIds(ids: number[]) {
    // Ensure all IDs are numbers
    const numericIds = ids.map(id => Number(id));
    allSpeakerIdsVar(numericIds);
    console.log('Updated allSpeakerIds:', allSpeakerIdsVar());
  }

  toggleAll() {
    const allIds = allSpeakerIdsVar().map(id => Number(id));
    const currentList = checkBoxListVar().map(id => Number(id));
    
    const newSelection = currentList.length === allIds.length ? [] : [...allIds];
    checkBoxListVar(newSelection);

    // Update cache for all speakers
    allIds.forEach(id => {
      this.apollo.client.cache.modify({
        id: this.apollo.client.cache.identify({ __typename: 'Speaker', id: Number(id) }),
        fields: {
          checkBoxColumn: () => newSelection.includes(Number(id))
        }
      });
    });

    console.log('Toggled all selections:', newSelection);
  }
}
