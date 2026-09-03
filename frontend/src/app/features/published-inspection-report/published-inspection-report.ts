import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-published-inspection-report',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './published-inspection-report.html',
  styleUrls: ['./published-inspection-report.css']
})
export class PublishedInspectionReport implements OnInit {

  // =====================================================
  // PUBLISHED TEMPLATE DATA
  // =====================================================

  templateId: string | null = null;

  templateName = '';

  checklistType = 'Inspection';

  generalDetails: any[] = [];

  builderItems: any[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private router: Router
  ) {}


  // =====================================================
  // LOAD PUBLISHED CHECKLIST
  // =====================================================

  ngOnInit(): void {

    const savedData =
      localStorage.getItem(
        'publishedChecklist'
      );


    if (!savedData) {

      console.error(
        'Published checklist data not found.'
      );

      alert(
        'Published checklist data not found.'
      );


      this.router.navigate([
        '/saved-templates'
      ]);

      return;

    }


    try {

      const publishedData =
        JSON.parse(savedData);


      this.templateId =
        publishedData.templateId ?? null;


      this.templateName =
        publishedData.templateName ?? '';


      this.checklistType =
        publishedData.checklistType ??
        'Inspection';


      this.generalDetails =
        publishedData.generalDetails ?? [];


      this.builderItems =
        publishedData.builderItems ?? [];


      console.log(
        'Published Inspection Checklist:',
        publishedData
      );

    }

    catch (error) {

      console.error(
        'Unable to read published checklist:',
        error
      );


      this.templateId = null;

      this.templateName = '';

      this.checklistType =
        'Inspection';

      this.generalDetails = [];

      this.builderItems = [];


      alert(
        'Unable to load published checklist.'
      );


      this.router.navigate([
        '/saved-templates'
      ]);

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
  // NORMALIZE LABEL
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
  // BACK TO SAVED TEMPLATES
  // =====================================================

  backToSavedTemplates(): void {

    this.router.navigate([
      '/saved-templates'
    ]);

  }

}