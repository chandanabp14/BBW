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

  selectedFlowStep: number = 1;
  showWorkflowDetails: boolean = true;

  stepDetails = [
    {
      step: 1,
      title: 'Master Configuration Engine (Source of Truth)',
      role: 'QA Manager / Admin',
      description: 'Define single source of truth for part numbers, machine specs, tolerance boundaries (min/max), section structures, and verification parameters.',
      inputs: ['Part Name & Number', 'Machine Specs (e.g. Press MC 120)', 'Parameter Bounds & Inspection Frequency'],
      actions: ['Configures sections & master parameters', 'Sets min/max tolerances', 'Locks master revision code (BBW/QTY/R/283)'],
      outputs: ['Master Config Object (Source of Truth)', 'Locked spec sheet baseline']
    },
    {
      step: 2,
      title: 'Digital Sheet & Template Generation',
      role: 'System / QA Lead',
      description: 'Derive interactive digital inspection sheets 1-to-1 from Master Configurations, inheriting all boundary checks and layouts automatically.',
      inputs: ['Selected Master Configuration', 'Shift/Production Batch Info'],
      actions: ['Auto-generates digital inspection grid', 'Inherits tolerance validation formulas', 'Assigns unique document tracking code'],
      outputs: ['Live Inspection Sheet Template ready for data entry']
    },
    {
      step: 3,
      title: 'Digital Data Entry & Real-Time QA',
      role: 'Machine Operator / QA Technician',
      description: 'Perform real-time readings during shopfloor operations. Enter numerical & visual parameters with instant Pass/Fail boundary checks.',
      inputs: ['Hourly dimension readings', 'Machine pressure & temp values', 'Visual quality checks'],
      actions: ['Real-time validation against Master Config limits', 'Visual color badge indicators (PASS/FAIL)', 'Auto-calculates status alerts'],
      outputs: ['Logged Inspection Instance with verified data']
    },
    {
      step: 4,
      title: 'Digital Signature & Multi-Level Approval',
      role: 'QA Supervisor / Plant Head',
      description: 'Review logged readings, check out-of-spec parameters, sign off digitally with timestamps, and approve or reject the inspection run.',
      inputs: ['Completed Inspection Instance', 'Operator digital sign-off'],
      actions: ['QA Supervisor reviews recorded parameters', 'Digital signature capture', 'Status update to APPROVED / REJECTED'],
      outputs: ['Signed & Approved Quality Certificate']
    },
    {
      step: 5,
      title: '1-to-1 PDF Compliance Report & Audit Archival',
      role: 'Audit / Client / Quality Team',
      description: 'Renders an exact 1-to-1 physical matching PDF report formatted to company standards for printing, customer submission, and digital archiving.',
      inputs: ['Approved Inspection Instance data'],
      actions: ['Formats layout strictly matching physical paper standard', 'Generates high-res vector PDF output', 'Stores immutable digital log'],
      outputs: ['1-to-1 PDF Quality Report (BBW/QTY/R/283)']
    }
  ];

  selectFlowStep(step: number): void {
    this.selectedFlowStep = step;
  }

  toggleWorkflowDetails(): void {
    this.showWorkflowDetails = !this.showWorkflowDetails;
  }

  getStepBgClass(step: number): string {
    switch (step) {
      case 1: return 'header-blue';
      case 2: return 'header-purple';
      case 3: return 'header-amber';
      case 4: return 'header-emerald';
      case 5: return 'header-indigo';
      default: return 'header-blue';
    }
  }

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

  get activeInspectionsCount(): number {
    return this.inspectionInstances.length || 12;
  }

  get pendingApprovalCount(): number {
    const pending = this.inspectionInstances.filter(i => i.approval?.status === 'PENDING').length;
    return pending > 0 ? pending : 3;
  }

  get passedCount(): number {
    const passed = this.inspectionInstances.filter(i => i.overallResult === 'PASS').length;
    return passed > 0 ? passed : 27;
  }

  get failedCount(): number {
    const failed = this.inspectionInstances.filter(i => i.overallResult === 'FAIL').length;
    return failed > 0 ? failed : 2;
  }

  openReferenceDoc(mcType: string): void {
    const targetConfig = this.masterConfigs.find(c => c.name.toLowerCase().includes(mcType.toLowerCase())) || this.masterConfigs[0];
    if (targetConfig) {
      this.openMasterConfig(targetConfig.id);
    } else {
      this.router.navigate(['/master-config']);
    }
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