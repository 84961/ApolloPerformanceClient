import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('Starting application bootstrap...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Application bootstrap successful'))
  .catch(err => console.error('Bootstrap error:', err));
