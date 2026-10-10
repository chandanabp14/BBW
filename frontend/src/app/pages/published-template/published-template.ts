import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MasterConfigService } from '../../modules/template-builder/services/master-config.service';
import { ValidationService } from '../../modules/template-builder/services/validation.service';
import { InspectionService } from '../../modules/template-builder/services/inspection.service';

import {
  CutSectionEntry,
  InspectionInstance,
  InspectionParamEntry,
  InspectionSample,
  MasterConfig,
  MasterConfigParameter,
  ValidationResult,
  ValidationStatus
} from '../../modules/template-builder/models/master-config.model';

import { NavbarComponent } from '../../modules/template-builder/components/navbar/navbar';

export interface TimeSlotRow {
  timeLabel: string;
  sampleCode: 'A' | 'B' | 'C' | 'FIRST OFF';
  values: Record<string, string>; // paramId -> actual string
  results: Record<string, ValidationStatus>; // paramId -> PASS/FAIL/PENDING
}

@Component({
  selector: 'app-published-template',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './published-template.html',
  styleUrl: './published-template.css'
})
export class PublishedTemplateComponent implements OnInit {
  masterConfig?: MasterConfig;
  inspectionInstance!: InspectionInstance;

  displayMode: 'matrix' | 'sections' = 'matrix';
  activeTab: 'all' | 'Setup' | 'Inspection' = 'all';
  viewMode: 'entry' | 'approval' | 'report' = 'entry';

  savedNotice = false;
  submittedNotice = false;

  // Timed inspection rows matching reference PDF
  timeSlotRows: TimeSlotRow[] = [];

  constructor(
    private masterConfigService: MasterConfigService,
    private validationService: ValidationService,
    private inspectionService: InspectionService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id');
    const targetId = idParam ? Number(idParam) : undefined;

    if (targetId) {
      const existingInspection = this.inspectionService.getInspectionById(targetId);

      if (existingInspection) {
        this.inspectionInstance = existingInspection;
        this.masterConfig = this.masterConfigService.getPublishedMasterConfig(existingInspection.masterConfigId) ||
                            this.masterConfigService.getMasterConfigById(existingInspection.masterConfigId);
      } else {
        const config = this.masterConfigService.getPublishedMasterConfig(targetId) ||
                       this.masterConfigService.getMasterConfigById(targetId);

        if (config) {
          this.masterConfig = config;
          this.createNewInspectionInstance(config);
        }
      }
    }

    if (!this.masterConfig) {
      this.masterConfig = this.masterConfigService.getPublishedMasterConfig();
      if (this.masterConfig) {
        this.createNewInspectionInstance(this.masterConfig);
      }
    }

    if (this.masterConfig && this.inspectionInstance?.parameterEntries) {
      for (const param of this.masterConfig.parameters) {
        const entry = this.inspectionInstance.parameterEntries[param.id];
        if (entry) {
          entry.sectionId = entry.sectionId || param.sectionId;
          entry.groupId = entry.groupId || param.groupId;
          entry.parameterCode = entry.parameterCode || param.parameterCode || param.id;
          entry.referenceImage = entry.referenceImage || param.referenceImage;
          entry.acceptanceCriteria = entry.acceptanceCriteria || param.acceptanceCriteria;
          entry.operatorInstructions = entry.operatorInstructions || param.operatorInstructions || param.inspectionInstructions;
          entry.checkingMethod = entry.checkingMethod || param.checkingMethod;
          entry.instrumentId = entry.instrumentId || param.instrumentId;
          entry.workInstructionRef = entry.workInstructionRef || param.workInstructionRef;
          entry.referenceNumber = entry.referenceNumber || param.referenceNumber;
        }
      }
    }

    if (this.route.snapshot.url.some(segment => segment.path === 'report')) {
      this.viewMode = 'report';
    }

    this.initTimeSlotRows();
    this.changeDetector.detectChanges();
  }


  private createNewInspectionInstance(config: MasterConfig): void {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];
    const entries: Record<string, InspectionParamEntry> = {};

    for (const param of config.parameters) {
      const formattedSpec = this.validationService.formatSpecification(param);
      entries[param.id] = {
        parameterId: param.id,
        sectionId: param.sectionId,
        groupId: param.groupId,
        parameterName: param.name,
        parameterCode: param.parameterCode || param.id,
        description: param.description,
        scope: param.scope,
        specificationText: formattedSpec,
        unit: param.unit,
        checkingMethod: param.checkingMethod || 'VISUAL',
        checkingInstrument: param.checkingMethod || 'VISUAL',
        instrumentId: param.instrumentId,
        calibrationFrequency: param.calibrationFrequency,
        calibrationCertNo: param.calibrationCertNo,
        referenceType: param.referenceType,
        referenceNumber: param.referenceNumber,
        referenceRevision: param.referenceRevision,
        workInstructionRef: param.workInstructionRef,
        referenceImage: param.referenceImage,
        imageDescription: param.imageDescription,
        acceptanceCriteria: param.acceptanceCriteria,
        passCondition: param.passCondition,
        failCondition: param.failCondition,
        operatorInstructions: param.operatorInstructions || param.inspectionInstructions,
        safetyInstructions: param.safetyInstructions,
        specialPrecautions: param.specialPrecautions,
        actualValue: '',
        samples: [
          { sampleCode: 'A', value: '', result: 'PENDING' },
          { sampleCode: 'B', value: '', result: 'PENDING' },
          { sampleCode: 'C', value: '', result: 'PENDING' }
        ],
        result: 'PENDING',
        validationMessage: param.required ? 'Required entry' : 'Optional'
      };
    }

    this.inspectionInstance = {
      id: Date.now(),
      masterConfigId: config.id,
      templateId: config.publishedTemplateId || Date.now(),
      templateName: config.name,
      documentCode: config.documentCode || '',
      mcType: config.mcType,
      partName: config.partName || '',
      partNumber: config.partNumber || '',
      machine: config.machine || '',
      operator: '',
      supervisor: '',
      qcName: '',
      date: today,
      shift: 'Day',
      settingTime: '',
      settingBy: '',
      batchNo: '',
      inspectionType: config.configType,
      parameterEntries: entries,
      generalDetails: {},
      startupIssues: [],
      cutSectionEntries: [],
      approval: {
        preparedBy: config.approvalConfig?.preparedBy?.personName || '',
        checkedBy: config.approvalConfig?.checkedBy?.personName || '',
        approvedBy: config.approvalConfig?.approvedBy?.personName || '',
        status: 'PENDING'
      },
      overallResult: 'PENDING',
      createdAt: now,
      updatedAt: now
    };
  }

  private initTimeSlotRows(): void {
    if (this.timeSlotRows.length > 0) return;

    // Build timing rows matching reference PDF (10:30 FIRST OFF A/B/C, 12:40 A/B/C, 3:00 A/B/C, 5:40 A/B/C)
    const slots: { time: string; samples: ('A' | 'B' | 'C')[] }[] = [
      { time: '10:30 FIRST OFF', samples: ['A', 'B', 'C'] },
      { time: '12:40 SHIFT-I', samples: ['A', 'B', 'C'] },
      { time: '03:00 SHIFT-II', samples: ['A', 'B', 'C'] },
      { time: '05:40 SHIFT-III', samples: ['A', 'B', 'C'] }
    ];

    for (const slot of slots) {
      for (const sampleCode of slot.samples) {
        const valMap: Record<string, string> = {};
        const resMap: Record<string, ValidationStatus> = {};

        for (const param of this.masterConfig?.parameters || []) {
          valMap[param.id] = '';
          resMap[param.id] = 'PENDING';
        }

        this.timeSlotRows.push({
          timeLabel: slot.time,
          sampleCode,
          values: valMap,
          results: resMap
        });
      }
    }
  }

  onMatrixCellInput(param: MasterConfigParameter, row: TimeSlotRow): void {
    const val = row.values[param.id];
    const valResult = this.validationService.validateValue(param, val);
    row.results[param.id] = valResult.status;

    // Also update main parameter entry
    const entry = this.inspectionInstance.parameterEntries[param.id];
    if (entry) {
      if (row.sampleCode === 'A') entry.samples[0].value = val;
      if (row.sampleCode === 'B') entry.samples[1].value = val;
      if (row.sampleCode === 'C') entry.samples[2].value = val;

      this.onSampleChange(param, entry.samples[0]);
    }
  }

  // Real-time automatic data validation on sample entry!
  onSingleValueChange(param: MasterConfigParameter, actualValue: string): void {
    const entry = this.inspectionInstance.parameterEntries[param.id];
    if (!entry) return;

    entry.actualValue = actualValue;
    const valResult: ValidationResult = this.validationService.validateValue(param, actualValue);
    entry.result = valResult.status;
    entry.validationMessage = valResult.message;

    this.inspectionInstance.overallResult = this.computeOverallResult();
  }

  onSampleChange(param: MasterConfigParameter, sample: InspectionSample): void {
    const entry = this.inspectionInstance.parameterEntries[param.id];
    if (!entry) return;

    const valResult: ValidationResult = this.validationService.validateValue(param, sample.value);
    sample.result = valResult.status;

    let hasFail = false;
    let hasPending = false;
    let hasPass = false;

    for (const s of entry.samples) {
      if (s.result === 'FAIL') hasFail = true;
      else if (s.result === 'PENDING') hasPending = true;
      else if (s.result === 'PASS') hasPass = true;
    }

    if (hasFail) {
      entry.result = 'FAIL';
      entry.validationMessage = valResult.message;
    } else if (hasPending && !hasPass) {
      entry.result = 'PENDING';
      entry.validationMessage = 'Pending entry';
    } else {
      entry.result = 'PASS';
      entry.validationMessage = '✓ PASS';
      entry.actualValue = entry.samples.map(s => s.value).filter(Boolean).join(', ');
    }

    this.inspectionInstance.overallResult = this.computeOverallResult();
  }

  getValidationResult(paramId: string): ValidationStatus {
    return this.inspectionInstance?.parameterEntries?.[paramId]?.result ?? 'PENDING';
  }

  getValidationMessage(paramId: string): string {
    return this.inspectionInstance?.parameterEntries?.[paramId]?.validationMessage ?? '';
  }

  getFormattedSpec(param: MasterConfigParameter): string {
    if (!param) return '—';
    return this.validationService.formatSpecification(param);
  }

  getParamActualValue(paramId: string): string {
    return this.inspectionInstance?.parameterEntries?.[paramId]?.actualValue || '';
  }

  getParamResult(paramId: string): ValidationStatus {
    return this.inspectionInstance?.parameterEntries?.[paramId]?.result || 'PENDING';
  }

  getParamRemark(paramId?: string): string {
    if (!paramId) return '';
    const entry = this.inspectionInstance?.parameterEntries?.[paramId];
    if (entry && entry.remark && entry.remark.trim()) {
      return entry.remark.trim();
    }
    return '';
  }

  hasAnyParameterImage(): boolean {
    if (!this.masterConfig || !this.masterConfig.parameters) return false;
    return this.masterConfig.parameters.some(p => !!p.referenceImage);
  }

  showImageColumn(): boolean {
    if (this.masterConfig?.layoutConfig?.showRefImage === false) return false;
    return this.hasAnyParameterImage();
  }

  getReportColSpan(): number {
    let count = 5; // Time, Parameter, Actual Reading, Result, Remarks
    if (this.masterConfig?.layoutConfig?.showReqSpecRow !== false) count++;
    if (this.masterConfig?.layoutConfig?.showMethodRow !== false) count++;
    if (this.showImageColumn()) count++;
    return count;
  }

  getUngroupedParametersForSection(sectionId: string): MasterConfigParameter[] {
    if (!this.masterConfig) return [];
    return this.masterConfig.parameters
      .filter(p => p.sectionId === sectionId && (!p.groupId || !this.masterConfig?.groups.some(g => g.id === p.groupId)))
      .sort((a, b) => a.order - b.order);
  }

  shouldShowStartupIssues(): boolean {
    if (this.masterConfig?.layoutConfig?.showStartupIssues === false) return false;
    return !!(this.inspectionInstance?.startupIssues && this.inspectionInstance.startupIssues.length > 0);
  }

  shouldShowCutSection(): boolean {
    if (this.masterConfig?.layoutConfig?.showCutSection === false) return false;
    return !!(this.inspectionInstance?.cutSectionEntries && this.inspectionInstance.cutSectionEntries.length > 0);
  }

  shouldShowApprovalBlock(): boolean {
    return this.masterConfig?.layoutConfig?.showApprovalBlock !== false;
  }

  getGroupsForSection(sectionId: string) {
    if (!this.masterConfig || !this.masterConfig.groups) return [];
    return this.masterConfig.groups.filter(g => g.sectionId === sectionId).sort((a, b) => a.order - b.order);
  }

  getParametersForGroup(groupId: string): MasterConfigParameter[] {
    if (!this.masterConfig) return [];
    return this.masterConfig.parameters.filter(p => p.groupId === groupId).sort((a, b) => a.order - b.order);
  }

  getInspectionParameters(): MasterConfigParameter[] {
    if (!this.masterConfig) return [];
    return this.masterConfig.parameters
      .filter(p => p.scope === 'Inspection' || p.scope === 'Both')
      .sort((a, b) => a.order - b.order);
  }

  getSetupParameters(): MasterConfigParameter[] {
    if (!this.masterConfig) return [];
    return this.masterConfig.parameters
      .filter(p => p.scope === 'Setup' || p.scope === 'Both')
      .sort((a, b) => a.order - b.order);
  }

  getParameterChunks(params: MasterConfigParameter[], chunkSize = 10): MasterConfigParameter[][] {
    if (!params || params.length === 0) return [];
    const chunks: MasterConfigParameter[][] = [];
    for (let i = 0; i < params.length; i += chunkSize) {
      chunks.push(params.slice(i, i + chunkSize));
    }
    return chunks;
  }

  getGroupName(groupId?: string): string {
    if (!groupId || !this.masterConfig || !this.masterConfig.groups) return '';
    const grp = this.masterConfig.groups.find(g => g.id === groupId);
    return grp ? grp.name : '';
  }

  getSectionName(sectionId: string): string {
    if (!sectionId || !this.masterConfig || !this.masterConfig.sections) return '';
    const sec = this.masterConfig.sections.find(s => s.id === sectionId);
    return sec ? sec.name : '';
  }

  addInspectionReadingRow(): void {
    const nextSlotNum = Math.floor(this.timeSlotRows.length / 3) + 1;
    const timeLabel = `Reading Slot ${nextSlotNum}`;

    for (const sampleCode of ['A', 'B', 'C'] as const) {
      const valMap: Record<string, string> = {};
      const resMap: Record<string, ValidationStatus> = {};

      for (const param of this.masterConfig?.parameters || []) {
        valMap[param.id] = '';
        resMap[param.id] = 'PENDING';
      }

      this.timeSlotRows.push({
        timeLabel,
        sampleCode,
        values: valMap,
        results: resMap
      });
    }
  }

  getFilteredSections() {
    if (!this.masterConfig) return [];
    if (this.activeTab === 'all') return this.masterConfig.sections;
    return this.masterConfig.sections.filter(s => s.scope === 'Both' || s.scope === this.activeTab);
  }

  getParametersForSection(sectionId: string): MasterConfigParameter[] {
    if (!this.masterConfig) return [];
    const params = this.masterConfig.parameters.filter(p => p.sectionId === sectionId);
    if (this.activeTab === 'all') return params;
    return params.filter(p => p.scope === 'Both' || p.scope === this.activeTab);
  }

  get totalParamsCount(): number {
    return Object.keys(this.inspectionInstance?.parameterEntries || {}).length;
  }

  get passedParamsCount(): number {
    return Object.values(this.inspectionInstance?.parameterEntries || {}).filter(e => e.result === 'PASS').length;
  }

  get failedParamsCount(): number {
    return Object.values(this.inspectionInstance?.parameterEntries || {}).filter(e => e.result === 'FAIL').length;
  }

  get pendingParamsCount(): number {
    return Object.values(this.inspectionInstance?.parameterEntries || {}).filter(e => e.result === 'PENDING').length;
  }

  get failedParametersList(): InspectionParamEntry[] {
    return Object.values(this.inspectionInstance?.parameterEntries || {}).filter(e => e.result === 'FAIL');
  }

  private computeOverallResult(): ValidationStatus {
    const entries = Object.values(this.inspectionInstance.parameterEntries || {});
    let hasFail = false;
    let hasPending = false;

    for (const entry of entries) {
      if (entry.result === 'FAIL') hasFail = true;
      if (entry.result === 'PENDING') hasPending = true;
    }

    if (hasFail) return 'FAIL';
    if (hasPending) return 'PENDING';
    return 'PASS';
  }

  addStartupIssueRow(): void {
    this.inspectionInstance.startupIssues.push({
      sNo: this.inspectionInstance.startupIssues.length + 1,
      description: '',
      rootCause: '',
      action: '',
      responsibility: '',
      targetDate: '',
      remarks: ''
    });
  }

  addCutSectionRow(): void {
    this.inspectionInstance.cutSectionEntries.push({
      time: '12:00',
      model: '',
      gramWeight: '',
      result: 'PENDING',
      checkedBy: '',
      approvedBy: ''
    });
  }

  saveProgress(): void {
    const saved = this.inspectionService.saveInspection(this.inspectionInstance);
    this.inspectionInstance = structuredClone(saved);
    this.savedNotice = true;
    setTimeout(() => this.savedNotice = false, 3000);
  }

  submitInspection(): void {
    if (this.pendingParamsCount > 0) {
      const confirmSubmit = confirm(`There are ${this.pendingParamsCount} pending parameter(s). Submit anyway?`);
      if (!confirmSubmit) return;
    }

    const submitted = this.inspectionService.submitInspection(this.inspectionInstance);
    this.inspectionInstance = structuredClone(submitted);
    this.submittedNotice = true;
    setTimeout(() => this.submittedNotice = false, 3000);
  }

  approveInspection(): void {
    if (this.failedParamsCount > 0) {
      const override = confirm(`ATTENTION: ${this.failedParamsCount} parameter(s) have FAILED validation. Are you sure you want to APPROVE this inspection sheet?`);
      if (!override) return;
    }

    const approved = this.inspectionService.approveInspection(this.inspectionInstance.id, {
      preparedBy: this.inspectionInstance.approval.preparedBy || this.masterConfig?.approvalConfig?.preparedBy?.personName || this.inspectionInstance.operator || '',
      checkedBy: this.inspectionInstance.approval.checkedBy || this.masterConfig?.approvalConfig?.checkedBy?.personName || this.inspectionInstance.supervisor || '',
      approvedBy: this.inspectionInstance.approval.approvedBy || this.masterConfig?.approvalConfig?.approvedBy?.personName || this.inspectionInstance.qcName || '',
      status: 'APPROVED'
    });

    if (approved) {
      this.inspectionInstance = structuredClone(approved);
      alert('Inspection sheet successfully APPROVED and archived!');
      this.viewMode = 'report';
    }
  }

  rejectInspection(): void {
    const reason = prompt('Please enter the reason for REJECTING this inspection sheet:');
    if (reason === null) return;

    const rejected = this.inspectionService.approveInspection(this.inspectionInstance.id, {
      preparedBy: this.inspectionInstance.approval.preparedBy || this.masterConfig?.approvalConfig?.preparedBy?.personName || this.inspectionInstance.operator || '',
      checkedBy: this.inspectionInstance.approval.checkedBy || this.masterConfig?.approvalConfig?.checkedBy?.personName || this.inspectionInstance.supervisor || '',
      approvedBy: this.inspectionInstance.approval.approvedBy || this.masterConfig?.approvalConfig?.approvedBy?.personName || this.inspectionInstance.qcName || '',
      status: 'REJECTED',
      comments: reason
    });

    if (rejected) {
      this.inspectionInstance = structuredClone(rejected);
      alert('Inspection sheet marked as REJECTED!');
    }
  }

  printReport(): void {
    window.print();
  }

  exportInspectionToCSV(): void {
    if (!this.inspectionInstance || !this.masterConfig) {
      alert('No active inspection sheet data to export.');
      return;
    }

    const headers = ['Parameter ID', 'Parameter Name', 'Specification / Range', 'Checking Method', 'Sample A', 'Sample B', 'Sample C', 'Actual Recorded Value', 'Validation Result', 'Message'];
    const rows: string[][] = [];

    for (const param of this.masterConfig.parameters || []) {
      const entry = this.inspectionInstance.parameterEntries[param.id];
      const sampleA = entry?.samples[0]?.value || '';
      const sampleB = entry?.samples[1]?.value || '';
      const sampleC = entry?.samples[2]?.value || '';
      const actualVal = entry?.actualValue || '';
      const result = entry?.result || 'PENDING';
      const msg = entry?.validationMessage || '';

      rows.push([
        param.id,
        param.name,
        entry?.specificationText || this.validationService.formatSpecification(param),
        param.checkingMethod || 'VISUAL',
        sampleA,
        sampleB,
        sampleC,
        actualVal,
        result,
        msg
      ]);
    }

    const csvLines = [
      `"INSPECTION REPORT - ${this.masterConfig.name}"`,
      `"Part Name: ${this.inspectionInstance.partName}","ERP Part No: ${this.inspectionInstance.partNumber}","M/C No: ${this.inspectionInstance.machine}","Date: ${this.inspectionInstance.date}"`,
      `"Overall Result: ${this.inspectionInstance.overallResult}"`,
      '',
      headers.join(','),
      ...rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))
    ];

    const csvBlob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(this.inspectionInstance.partName || 'InspectionReport').replace(/\s+/g, '_')}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  backToMasterConfig(): void {
    this.router.navigate(['/master-config']);
  }
}

