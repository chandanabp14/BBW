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

import { MasterConfigComponent }
from './modules/template-builder/pages/master-config/master-config';

import { PublishedTemplateComponent }
from './modules/template-builder/pages/published-template/published-template';

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

