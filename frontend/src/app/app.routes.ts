import { Routes } from '@angular/router';

import {
  BuilderComponent
} from './pages/builder/builder';

import {
  ChecklistsComponent
} from './pages/checklists/checklists';

import { PreviewComponent }
from './pages/preview/preview';

import { InspectionComponent }
from './pages/inspection/inspection';

import { MasterConfigComponent }
from './pages/master-config/master-config';

import { PublishedTemplateComponent }
from './pages/published-template/published-template';

export const routes: Routes = [

  {
    path: '',
    component: ChecklistsComponent
  },

  {
    path: 'master-config',
    component: MasterConfigComponent
  },

  {
    path: 'master-config/:id',
    component: MasterConfigComponent
  },

  {
    path: 'published-template',
    component: PublishedTemplateComponent
  },

  {
    path: 'published-template/:id',
    component: PublishedTemplateComponent
  },

  {
    path: 'report',
    component: PublishedTemplateComponent
  },

  {
    path: 'report/:id',
    component: PublishedTemplateComponent
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

