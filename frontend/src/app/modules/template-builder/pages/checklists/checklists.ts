import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Template } from '../../models/template.model';
import { TemplateService } from '../../services/template.service';
import { TableService } from '../../services/table.service';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-checklists',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent
  ],
  templateUrl: './checklists.html',
  styleUrl: './checklists.css'
})
export class ChecklistsComponent implements OnInit {

  templates: Template[] = [];

  filterStatus: 'all' | 'published' | 'draft' = 'all';

  searchQuery: string = '';

  constructor(
    private templateService: TemplateService,
    private tableService: TableService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {
    this.loadTemplates();
  }


  // =====================================================
  // LOAD CHECKLISTS
  // =====================================================

  async loadTemplates(): Promise<void> {

    try {

      const templates =
        await this.templateService.loadTemplates();

      this.templates = [...templates];

      // Required because this project uses zoneless
      // change detection for async API calls.
      this.changeDetector.detectChanges();

    } catch (error) {

      console.error(
        'Unable to load checklists from the API.',
        error
      );

      alert(
        'Unable to load checklists. Make sure the backend and MongoDB are running.'
      );
    }
  }


  // =====================================================
  // FILTERED TEMPLATES
  // =====================================================

  get filteredTemplates(): Template[] {

    return this.templates.filter(template => {

      const matchesFilter =
        this.filterStatus === 'all' ||
        template.status === this.filterStatus;

      const matchesSearch =
        !this.searchQuery.trim() ||
        template.name
          .toLowerCase()
          .includes(
            this.searchQuery
              .toLowerCase()
              .trim()
          );

      return matchesFilter && matchesSearch;
    });
  }


  // =====================================================
  // COUNTS
  // =====================================================

  get draftCount(): number {

    return this.templates.filter(
      template =>
        template.status === 'draft'
    ).length;
  }


  get publishedCount(): number {

    return this.templates.filter(
      template =>
        template.status === 'published'
    ).length;
  }


  // =====================================================
  // NEW CHECKLIST
  // =====================================================

  newChecklist(): void {

    this.tableService.resetBuilder();

    this.router.navigate(['/builder']);
  }


  // =====================================================
  // EDIT DRAFT
  // =====================================================

  editDraft(template: Template): void {

    this.tableService.loadTemplate(template);

    this.router.navigate(['/builder']);
  }

// =====================================================
// DUPLICATE
// =====================================================

async duplicateChecklist(
  template: Template
): Promise<void> {

  const duplicate =
    await this.templateService
      .duplicateTemplate(template.id);

  if (!duplicate) {
    return;
  }

  await this.loadTemplates();

  // Tell the builder that this checklist came from Duplicate.
  // The builder will require the user to change this generated
  // template name before editing anything.
  sessionStorage.setItem(
    'duplicateChecklistMode',
    'true'
  );

  sessionStorage.setItem(
    'duplicateOriginalName',
    duplicate.name
  );

  this.tableService.loadTemplate(
    duplicate
  );

  this.router.navigate(['/builder']);
}

  // =====================================================
  // PUBLISH
  // =====================================================

  async publishDraft(
    template: Template
  ): Promise<void> {

    const confirmed = confirm(
      `Are you sure you want to publish "${template.name}"? It will be ready for inspectors.`
    );

    if (!confirmed) {
      return;
    }

    await this.templateService
      .publishTemplateById(template.id);

    await this.loadTemplates();
  }


  // =====================================================
  // VIEW PUBLISHED
  // =====================================================

  viewPublished(
    template: Template
  ): void {

    this.tableService.loadTemplate(
      template
    );

    window.open(
      '/preview?id=' + template.id,
      '_blank'
    );
  }


  // =====================================================
  // DELETE
  // =====================================================

  async deleteChecklist(
    id: number,
    name: string
  ): Promise<void> {

    const confirmed = confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    await this.templateService
      .deleteTemplate(id);

    await this.loadTemplates();
  }
}