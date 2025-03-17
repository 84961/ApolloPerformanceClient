import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ApolloClientOptions, InMemoryCache, makeVar } from '@apollo/client/core';
import { APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { onError } from '@apollo/client/link/error';
import { ApolloLink } from '@apollo/client/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { allSpeakerIdsVar, checkBoxListVar } from './graphql/reactive-variables';

export const currentThemeVar = makeVar<'light' | 'dark'>('light');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink): ApolloClientOptions<any> {
        console.log('Configuring Apollo Client...');

        const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
          console.log('Apollo operation:', operation.operationName);

          if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path }) => {
              console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation.operationName}`
              );
            });
          }
          if (networkError) {
            console.error(`[Network error]:`, networkError);
          }
        });

        const http = httpLink.create({
          uri: 'http://localhost:4000/graphql',
        });

        console.log('Apollo Client configured with endpoint:', 'http://localhost:4000/graphql');

        return {
          cache: new InMemoryCache({
            typePolicies: {
              Query: {
                fields: {
                  currentTheme: {
                    read() {
                      return currentThemeVar();
                    }
                  },
                  selectedSpeakers: {
                    read() {
                      const selectedIds = checkBoxListVar();
                      console.log('Reading selectedSpeakers from cache:', selectedIds);
                      return selectedIds;
                    }
                  },
                  allSpeakerIds: {
                    read() {
                      console.log('Reading allSpeakerIds:', allSpeakerIdsVar());
                      return allSpeakerIdsVar();
                    }
                  }
                }
              },
              Speaker: {
                fields: {
                  fullName: {
                    read(_, { readField }) {
                      const first = readField('first') || '';
                      const last = readField('last') || '';
                      return `${first} ${last}`;
                    }
                  },
                  checkBoxColumn: {
                    read(existing, { readField }) {
                      const id = readField<number>('id');
                      if (id === undefined) return false;
                      
                      const selectedIds = checkBoxListVar();
                      console.log(`Reading checkbox state for speaker ${id}:`, selectedIds);
                      return selectedIds.includes(Number(id));
                    }
                  }
                }
              }
            }
          }),
          link: ApolloLink.from([errorLink, http]),
          defaultOptions: {
            watchQuery: {
              errorPolicy: 'all',
              fetchPolicy: 'cache-and-network',
            },
            query: {
              errorPolicy: 'all',
              fetchPolicy: 'network-only',
            },
            mutate: {
              errorPolicy: 'all',
            },
          },
          connectToDevTools: true // Enable Apollo dev tools
        };
      },
      deps: [HttpLink]
    },
    Apollo
  ]
};
