import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup-report',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './setup-report.html',
  styleUrls: ['./setup-report.css']
})
export class SetupReport implements OnInit {

  // =====================================================
  // TEMPLATE DATA
  // =====================================================

  templateId: string | null = null;

  templateName = '';

  checklistType = 'Setup';

  generalDetails: any[] = [];

  builderItems: any[] = [];

  isPublished = false;

  publishing = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private router: Router
  ) {}


  // =====================================================
  // LOAD PREVIEW
  // =====================================================

  ngOnInit(): void {

    const savedData =
      localStorage.getItem(
        'previewChecklist'
      );


    if (!savedData) {
      return;
    }


    try {

      const previewData =
        JSON.parse(savedData);


      this.templateId =
        previewData.templateId ?? null;


      this.templateName =
        previewData.templateName ?? '';


      this.checklistType =
        previewData.checklistType ??
        'Setup';


      this.generalDetails =
        previewData.generalDetails ?? [];


      this.builderItems =
        previewData.builderItems ?? [];


      if (this.templateId) {
        this.loadTemplateStatus();
      }

    }

    catch (error) {

      console.error(
        'Unable to read setup preview:',
        error
      );


      this.templateId = null;

      this.templateName = '';

      this.checklistType = 'Setup';

      this.generalDetails = [];

      this.builderItems = [];

      this.isPublished = false;

    }

  }


  // =====================================================
  // LOAD TEMPLATE STATUS FROM MONGODB
  // =====================================================

  async loadTemplateStatus(): Promise<void> {

    if (!this.templateId) {
      return;
    }


    try {

      const response = await fetch(
        `http://localhost:3000/api/templates/${this.templateId}`
      );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          'Unable to load template status.'
        );

      }


      this.isPublished =
        result.data?.status ===
        'Published';

    }

    catch (error) {

      console.error(
        'Load Template Status Error:',
        error
      );

    }

  }


  // =====================================================
  // FIND GENERAL DETAIL VALUE
  // =====================================================

  getGeneralValue(
    ...names: string[]
  ): string {

    const wantedNames =
      names.map(
        name =>
          this.normalizeLabel(name)
      );


    for (
      const row
      of this.generalDetails
    ) {

      const fields =
        row?.fields ?? [];


      for (
        const field
        of fields
      ) {

        const fieldLabel =
          this.normalizeLabel(
            field?.label ?? ''
          );


        if (
          wantedNames.includes(
            fieldLabel
          )
        ) {

          return (
            field?.value ??
            ''
          );

        }

      }

    }


    return '';

  }


  // =====================================================
  // NORMALIZE GENERAL DETAIL LABEL
  // =====================================================

  private normalizeLabel(
    value: string
  ): string {

    return String(value)

      .toLowerCase()

      .replace(
        /[^a-z0-9]/g,
        ''
      );

  }


  // =====================================================
  // EDIT TEMPLATE
  // =====================================================

  editTemplate(): void {

    const editData = {

      templateId:
        this.templateId,

      templateName:
        this.templateName,

      checklistType:
        this.checklistType,

      generalDetails:
        this.generalDetails,

      builderItems:
        this.builderItems

    };


    localStorage.setItem(
      'editChecklist',
      JSON.stringify(editData)
    );


    this.router.navigate([
      '/'
    ]);

  }


  // =====================================================
  // PUBLISH TEMPLATE
  // =====================================================

  async publishTemplate(): Promise<void> {

    if (!this.templateId) {

      alert(
        'Please save the template before publishing.'
      );

      return;

    }


    if (this.isPublished) {

      alert(
        'This template is already published.'
      );

      return;

    }


    this.publishing = true;


    try {

      const response = await fetch(
        `http://localhost:3000/api/templates/publish/${this.templateId}`,
        {
          method: 'PUT'
        }
      );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          'Unable to publish template.'
        );

      }


      this.isPublished = true;


      const publishedData = {

        templateId:
          this.templateId,

        templateName:
          this.templateName,

        checklistType:
          this.checklistType,

        generalDetails:
          this.generalDetails,

        builderItems:
          this.builderItems,

        status:
          'Published'

      };


      localStorage.setItem(
        'publishedChecklist',
        JSON.stringify(
          publishedData
        )
      );


      alert(
        'Template published successfully!'
      );


      this.router.navigate([
        '/published-setup-report'
      ]);

    }

    catch (error) {

      console.error(
        'Publish Template Error:',
        error
      );


      alert(
        'Failed to publish template.'
      );

    }

    finally {

      this.publishing = false;

    }

  }


  // =====================================================
  // DELETE TEMPLATE
  // =====================================================

  async deleteTemplate(): Promise<void> {

    if (!this.templateId) {

      alert(
        'Please save the template before deleting it.'
      );

      return;

    }


    const confirmed =
      confirm(
        'Are you sure you want to delete this template?'
      );


    if (!confirmed) {
      return;
    }


    try {

      const response = await fetch(
        `http://localhost:3000/api/templates/${this.templateId}`,
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


      localStorage.removeItem(
        'previewChecklist'
      );

      localStorage.removeItem(
        'editChecklist'
      );

      localStorage.removeItem(
        'publishedChecklist'
      );


      alert(
        'Template deleted successfully.'
      );


      this.router.navigate([
        '/'
      ]);

    }

    catch (error) {

      console.error(
        'Delete Template Error:',
        error
      );


      alert(
        'Failed to delete template.'
      );

    }

  }

}