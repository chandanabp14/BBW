import { Routes } from '@angular/router';

import {
  BuilderComponent
} from './modules/template-builder/pages/builder/builder';

import {
  ChecklistsComponent
} from './modules/template-builder/pages/checklists/checklists';

import { PreviewComponent }
from './modules/template-builder/pages/preview/preview';

import { InspectionComponent }
from './modules/template-builder/pages/inspection/inspection';

export const routes: Routes = [

  {
    path: '',
    component: ChecklistsComponent
  },

  {
    path: 'builder',
    component: BuilderComponent
  },

  {
    path: 'checklists',
    redirectTo: '',
    pathMatch: 'full'
  },

  {
    path: 'preview',
    component: PreviewComponent
  },

  {
    path: 'inspection',
    component: InspectionComponent
  },

  {
    path: '**',
    redirectTo: ''
  }

];
