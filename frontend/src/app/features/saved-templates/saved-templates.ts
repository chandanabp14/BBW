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
  // LOAD PAGE
  // =====================================================

  ngOnInit(): void {

    this.loadTemplates();

  }


  // =====================================================
  // DRAFT TEMPLATES
  // =====================================================

  get draftTemplates(): any[] {

    return this.templates.filter(
      (template) =>
        template.status !== 'Published'
    );

  }


  // =====================================================
  // PUBLISHED TEMPLATES
  // =====================================================

  get publishedTemplates(): any[] {

    return this.templates.filter(
      (template) =>
        template.status === 'Published'
    );

  }


  // =====================================================
  // LOAD ALL TEMPLATES
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
  // DRAFT PREVIEW
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


      // -------------------------------------------------
      // LOAD LATEST VERSION
      // -------------------------------------------------

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


      // -------------------------------------------------
      // PREVIEW DATA
      // -------------------------------------------------

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
          templateJson.builderItems ?? [],

        status:
          template.status ?? 'Draft'

      };


      localStorage.setItem(
        'previewChecklist',
        JSON.stringify(previewData)
      );


      // -------------------------------------------------
      // DRAFT ROUTING
      // -------------------------------------------------

      if (
        template.checklist_type === 'Setup'
      ) {

        await this.router.navigate([
          '/setup-report'
        ]);

        return;

      }


      await this.router.navigate([
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
  // OPEN PUBLISHED CHECKLIST
  // =====================================================

  async openPublishedChecklist(
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


      // -------------------------------------------------
      // SAFETY CHECK
      // -------------------------------------------------

      if (
        template.status !== 'Published'
      ) {

        alert(
          'This template is not published.'
        );

        return;

      }


      // -------------------------------------------------
      // LOAD LATEST VERSION
      // -------------------------------------------------

      const response = await fetch(
        `http://localhost:3000/api/templates/${templateId}/version/latest`
      );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          'Unable to load published checklist.'
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


      // -------------------------------------------------
      // PUBLISHED CHECKLIST DATA
      // -------------------------------------------------

      const publishedData = {

        templateId:
          templateId,

        templateName:
          template.template_name ?? '',

        checklistType:
          template.checklist_type ?? 'Inspection',

        generalDetails:
          templateJson.generalDetails ?? [],

        builderItems:
          templateJson.builderItems ?? [],

        status:
          'Published',

        isPublished:
          true

      };


      // Published page can use this

      localStorage.setItem(
        'publishedChecklist',
        JSON.stringify(publishedData)
      );


      // Keep this also because your existing
      // report components may currently read previewChecklist

      localStorage.setItem(
        'previewChecklist',
        JSON.stringify(publishedData)
      );


      // -------------------------------------------------
      // PUBLISHED ROUTING
      // -------------------------------------------------

      if (
        template.checklist_type === 'Setup'
      ) {

        await this.router.navigate([
          '/published-setup-report'
        ]);

        return;

      }


      await this.router.navigate([
        '/published-inspection-report'
      ]);

    }

    catch (error) {

      console.error(
        'Published Checklist Error:',
        error
      );


      alert(
        'Unable to open published checklist.'
      );

    }

  }


  // =====================================================
  // EDIT DRAFT TEMPLATE
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


      await this.router.navigate([
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
  // DELETE DRAFT TEMPLATE
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

  async backToBuilder(): Promise<void> {

    await this.router.navigate([
      '/'
    ]);

  }

}