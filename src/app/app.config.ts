import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    provideApollo(() => {
      const httpLink = inject(HttpLink); // Properly inject HttpLink
      const cache = new InMemoryCache();
      return {
        cache,
        link: httpLink.create({ uri: 'http://localhost:4000/graphql/' }),
      };
    }),
  ],
};
