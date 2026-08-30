import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-saved-templates',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './saved-templates.html',

  styleUrls: ['./saved-templates.css']
})
export class SavedTemplates implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  templates: any[] = [];

  loading = false;

  errorMessage = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  ngOnInit(): void {

    this.loadTemplates();

  }


  // =====================================================
  // LOAD ALL TEMPLATES FROM MONGODB
  // =====================================================

  async loadTemplates(): Promise<void> {

    this.loading = true;

    this.errorMessage = '';

    try {

      const response = await fetch(
        'http://localhost:3000/api/templates'
      );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          'Unable to load templates.'
        );

      }


      this.templates =
        result.data ?? [];


      console.log(
        'Saved MongoDB templates:',
        this.templates
      );

    }

    catch (error) {

      console.error(
        'Load Templates Error:',
        error
      );


      this.templates = [];


      this.errorMessage =
        'Unable to load saved templates.';

    }

    finally {

      this.loading = false;

      this.cdr.detectChanges();

    }

  }


  // =====================================================
  // PREVIEW TEMPLATE
  // =====================================================

  async previewTemplate(
    template: any
  ): Promise<void> {

    try {

      const templateId =
        template._id;


      if (!templateId) {

        alert(
          'Template ID not found.'
        );

        return;

      }


      const response = await fetch(
        `http://localhost:3000/api/templates/${templateId}/version/latest`
      );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          'Unable to load template preview.'
        );

      }


      const version =
        result.data;


      if (!version) {

        alert(
          'No saved version found for this template.'
        );

        return;

      }


      const templateJson =
        version.template_json ?? {};


      const previewData = {

        templateId:
          templateId,

        templateName:
          template.template_name ?? '',

        checklistType:
          template.checklist_type ?? 'Inspection',

        generalDetails:
          templateJson.generalDetails ?? [],

        builderItems:
          templateJson.builderItems ?? []

      };


      localStorage.setItem(
        'previewChecklist',
        JSON.stringify(previewData)
      );


      if (
        template.checklist_type === 'Setup'
      ) {

        this.router.navigate([
          '/setup-report'
        ]);

        return;

      }


      this.router.navigate([
        '/inspection-report'
      ]);

    }

    catch (error) {

      console.error(
        'Preview Template Error:',
        error
      );


      alert(
        'Unable to preview template.'
      );

    }

  }


  // =====================================================
  // EDIT TEMPLATE
  // =====================================================

  async editTemplate(
    template: any
  ): Promise<void> {

    try {

      const templateId =
        template._id;


      if (!templateId) {

        alert(
          'Template ID not found.'
        );

        return;

      }


      const response = await fetch(
        `http://localhost:3000/api/templates/${templateId}/version/latest`
      );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          'Unable to load template.'
        );

      }


      const version =
        result.data;


      if (!version) {

        alert(
          'No saved version found for this template.'
        );

        return;

      }


      const templateJson =
        version.template_json ?? {};


      const editData = {

        templateId:
          templateId,

        templateName:
          template.template_name ?? '',

        checklistType:
          template.checklist_type ?? 'Inspection',

        generalDetails:
          templateJson.generalDetails ?? [],

        builderItems:
          templateJson.builderItems ?? []

      };


      localStorage.setItem(
        'editChecklist',
        JSON.stringify(editData)
      );


      this.router.navigate([
        '/'
      ]);

    }

    catch (error) {

      console.error(
        'Edit Template Error:',
        error
      );


      alert(
        'Unable to open template.'
      );

    }

  }


  // =====================================================
  // DELETE TEMPLATE
  // =====================================================

  async deleteTemplate(
    template: any
  ): Promise<void> {

    const templateId =
      template._id;


    if (!templateId) {

      alert(
        'Template ID not found.'
      );

      return;

    }


    const confirmed =
      confirm(
        `Are you sure you want to delete "${template.template_name}"?`
      );


    if (!confirmed) {

      return;

    }


    try {

      const response = await fetch(
        `http://localhost:3000/api/templates/${templateId}`,
        {
          method: 'DELETE'
        }
      );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          'Unable to delete template.'
        );

      }


      alert(
        'Template deleted successfully.'
      );


      await this.loadTemplates();

    }

    catch (error) {

      console.error(
        'Delete Template Error:',
        error
      );


      alert(
        'Unable to delete template.'
      );

    }

  }


  // =====================================================
  // BACK TO BUILDER
  // =====================================================

  backToBuilder(): void {

    this.router.navigate([
      '/'
    ]);

  }

}