import { Routes } from '@angular/router';

import { BuilderComponent }
  from './modules/template-builder/pages/builder/builder';

import { SetupReport }
  from './features/setup-report/setup-report';

import { InspectionReport }
  from './features/inspection-report/inspection-report';

import { SavedTemplates }
  from './features/saved-templates/saved-templates';


export const routes: Routes = [

  // =====================================================
  // BUILDER
  // =====================================================

  {
    path: '',
    component: BuilderComponent
  },


  // =====================================================
  // INSPECTION PREVIEW
  // =====================================================

  {
    path: 'inspection-report',
    component: InspectionReport
  },


  // =====================================================
  // SETUP PREVIEW
  // =====================================================

  {
    path: 'setup-report',
    component: SetupReport
  },


  // =====================================================
  // PUBLISHED INSPECTION PREVIEW
  // =====================================================

  {
    path: 'published-inspection-report',
    component: InspectionReport
  },


  // =====================================================
  // PUBLISHED SETUP PREVIEW
  // =====================================================

  {
    path: 'published-setup-report',
    component: SetupReport
  },


  // =====================================================
  // SAVED TEMPLATES
  // =====================================================

  {
    path: 'saved-templates',
    component: SavedTemplates
  }

];