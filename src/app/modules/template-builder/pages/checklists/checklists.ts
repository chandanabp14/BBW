import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Template } from '../../models/template.model';
import { TemplateService } from '../../services/template.service';
import { TableService } from '../../services/table.service';
import { MasterConfigService } from '../../services/master-config.service';
import { InspectionService } from '../../services/inspection.service';
import { InspectionInstance, MasterConfig } from '../../models/master-config.model';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-checklists',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './checklists.html',
  styleUrl: './checklists.css'
})
export class ChecklistsComponent implements OnInit {
  templates: Template[] = [];
  masterConfigs: MasterConfig[] = [];
  inspectionInstances: InspectionInstance[] = [];

  filterStatus: 'all' | 'published' | 'draft' = 'all';
  searchQuery: string = '';

  constructor(
    private templateService: TemplateService,
    private tableService: TableService,
    public masterConfigService: MasterConfigService,
    private inspectionService: InspectionService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.masterConfigs = this.masterConfigService.getMasterConfigs();
    this.inspectionInstances = this.inspectionService.getInspections();
  }

  async loadTemplates(): Promise<void> {
    try {
      const templates = await this.templateService.loadTemplates();
      this.templates = [...templates];
      this.changeDetector.detectChanges();
    } catch (error) {
      console.warn('API unavailable, using local templates fallback.', error);
      this.templates = this.templateService.getTemplates();
      this.changeDetector.detectChanges();
    }
  }

  get filteredTemplates(): Template[] {
    return this.templates.filter(template => {
      const matchesFilter =
        this.filterStatus === 'all' || template.status === this.filterStatus;

      const matchesSearch =
        !this.searchQuery.trim() ||
        template.name.toLowerCase().includes(this.searchQuery.toLowerCase().trim());

      return matchesFilter && matchesSearch;
    });
  }

  get draftCount(): number {
    return this.templates.filter(template => template.status === 'draft').length;
  }

  get publishedCount(): number {
    return this.templates.filter(template => template.status === 'published').length;
  }

  newMasterConfig(): void {
    this.router.navigate(['/master-config']);
  }

  openMasterConfig(id: number): void {
    this.router.navigate(['/master-config', id]);
  }

  generateTemplateFromMaster(config: MasterConfig): void {
    const generated = this.masterConfigService.generateTemplateFromMaster(config);
    this.router.navigate(['/published-template', generated.id]);
  }

  openDataEntry(templateId?: number): void {
    if (templateId) {
      this.router.navigate(['/published-template', templateId]);
    } else {
      this.router.navigate(['/published-template']);
    }
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
    if (!duplicate) return;

    await this.loadTemplates();
    sessionStorage.setItem('duplicateChecklistMode', 'true');
    sessionStorage.setItem('duplicateOriginalName', duplicate.name);
    this.tableService.loadTemplate(duplicate);
    this.router.navigate(['/builder']);
  }

  async publishDraft(template: Template): Promise<void> {
    const confirmed = confirm(`Are you sure you want to publish "${template.name}"? It will be ready for inspectors.`);
    if (!confirmed) return;

    await this.templateService.publishTemplateById(template.id);
    await this.loadTemplates();
  }

  viewPublished(template: Template): void {
    this.router.navigate(['/published-template', template.id]);
  }

  async deleteChecklist(id: number, name: string): Promise<void> {
    const confirmed = confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
    if (!confirmed) return;

    await this.templateService.deleteTemplate(id);
    await this.loadTemplates();
  }
}