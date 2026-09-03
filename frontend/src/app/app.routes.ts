import { Routes } from '@angular/router';

import { BuilderComponent }
  from './modules/template-builder/pages/builder/builder';

import { InspectionReport }
  from './features/inspection-report/inspection-report';

import { SetupReport }
  from './features/setup-report/setup-report';

import { SavedTemplates }
  from './features/saved-templates/saved-templates';

import { PublishedInspectionReport }
  from './features/published-inspection-report/published-inspection-report';

import { PublishedSetupReport }
  from './features/published-setup-report/published-setup-report';


export const routes: Routes = [

  // BUILDER
  {
    path: '',
    component: BuilderComponent
  },

  // NORMAL INSPECTION PREVIEW
  {
    path: 'inspection-report',
    component: InspectionReport
  },

  // NORMAL SETUP PREVIEW
  {
    path: 'setup-report',
    component: SetupReport
  },

  // PUBLISHED INSPECTION
  {
    path: 'published-inspection-report',
    component: PublishedInspectionReport
  },

  // PUBLISHED SETUP
  {
    path: 'published-setup-report',
    component: PublishedSetupReport
  },

  // SAVED TEMPLATES
  {
    path: 'saved-templates',
    component: SavedTemplates
  }

];