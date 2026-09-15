import { Component } from '@angular/core';
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
export class ChecklistsComponent {

  templates: Template[] = [];
  filterStatus: 'all' | 'published' | 'draft' = 'all';
  searchQuery: string = '';

  constructor(
    private templateService: TemplateService,
    private tableService: TableService,
    private router: Router
  ) { this.loadTemplates(); }

  async loadTemplates(): Promise<void> {
    try {
      this.templates = await this.templateService.loadTemplates();
    } catch (error) {
      console.error('Unable to load checklists from the API.', error);
      alert('Unable to load checklists. Make sure the backend and MongoDB are running.');
    }
  }

  get filteredTemplates(): Template[] {
    return this.templates.filter(t => {
      const matchesFilter =
        this.filterStatus === 'all' || t.status === this.filterStatus;
      const matchesSearch =
        !this.searchQuery.trim() ||
        t.name.toLowerCase().includes(this.searchQuery.toLowerCase().trim());
      return matchesFilter && matchesSearch;
    });
  }

  get draftCount(): number {
    return this.templates.filter(t => t.status === 'draft').length;
  }

  get publishedCount(): number {
    return this.templates.filter(t => t.status === 'published').length;
  }

  newChecklist(): void {
    this.tableService.resetBuilder();
    this.router.navigate(['/builder']);
  }

  editDraft(template: Template): void {
    this.tableService.loadTemplate(template);
    this.router.navigate(['/builder']);
  }

  async duplicateChecklist(template: Template): Promise<void> {
    const duplicate = await this.templateService.duplicateTemplate(template.id);

    if (!duplicate) {
      return;
    }

    this.loadTemplates();
    this.tableService.loadTemplate(duplicate);
    this.router.navigate(['/builder']);
  }

  async publishDraft(template: Template): Promise<void> {
    if (confirm(`Are you sure you want to publish "${template.name}"? It will be ready for inspectors.`)) {
      await this.templateService.publishTemplateById(template.id);
      await this.loadTemplates();
    }
  }

  viewPublished(template: Template): void {
    this.tableService.loadTemplate(template);
    window.open('/preview?id=' + template.id, '_blank');
  }

  async deleteChecklist(id: number, name: string): Promise<void> {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      await this.templateService.deleteTemplate(id);
      await this.loadTemplates();
    }
  }

}
