import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { MasterConfigService } from '../../modules/template-builder/services/master-config.service';
import { TemplateService } from '../../modules/template-builder/services/template.service';
import { NavbarComponent } from '../../modules/template-builder/components/navbar/navbar';
import {
  ApprovalConfigRole,
  ConfigStatus,
  InspectionFrequencyType,
  MasterConfig,
  MasterConfigGroup,
  MasterConfigParameter,
  MasterConfigSection,
  MasterInputType,
  MasterMcType,
  MasterSpecType,
  ReferenceType,
  ReportLayoutConfig,
  ScopeType
} from '../../modules/template-builder/models/master-config.model';

@Component({
  selector: 'app-master-config',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './master-config.html',
  styleUrl: './master-config.css'
})
export class MasterConfigComponent implements OnInit {
  currentView: 'list' | 'editor' = 'list';
  currentStep: 1 | 2 | 3 | 4 | 5 = 1;
  activeEditorTab: 'doc' | 'sections' | 'params' | 'report' | 'approval' = 'doc';

  config: MasterConfig = this.createEmptyConfig();
  selectedPresetId: number | null = null;
  savedNotice = false;
  publishedNotice = false;

  // Search & filter for list view
  searchQuery = '';
  scopeFilter: 'All' | 'Inspection' | 'Setup' | 'Both' = 'All';

  // Add / Edit Parameter Modal state
  showParamModal = false;
  isEditParamMode = false;
  paramModalSectionId = '';
  paramModalGroupId = '';
  paramModalData: MasterConfigParameter = this.createEmptyParam();
  paramModalTab: 'basic' | 'spec' | 'instrument' | 'ref' | 'acceptance' | 'instructions' | 'frequency' = 'basic';

  // Add / Edit Section Modal
  showSectionModal = false;
  isEditSectionMode = false;
  sectionModalData: MasterConfigSection = { id: '', name: '', code: '', description: '', scope: 'Both', order: 1, active: true };

  // Add / Edit Group Modal
  showGroupModal = false;
  isEditGroupMode = false;
  groupModalData: MasterConfigGroup = { id: '', sectionId: '', name: '', code: '', description: '', order: 1, active: true };

  commonUnits = ['mm', 'bar', '°C', 'grams', 'Kg/cm2', 'sec', 'V', 'ml', 'mm/sec', 'rpm', 'psi', 'microns', 'inches'];

  inputTypes: { value: MasterInputType; label: string }[] = [
    { value: 'number', label: 'Numeric / Measurement' },
    { value: 'text', label: 'Text' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'yes_no', label: 'Yes / No' },
    { value: 'checkbox', label: 'Pass / Fail' },
    { value: 'visual', label: 'Visual Check' },
    { value: 'measurement', label: 'Measurement' }
  ];

  specTypes: { value: MasterSpecType; label: string }[] = [
    { value: 'range', label: 'Range (Min - Max)' },
    { value: 'exact', label: 'Exact Value' },
    { value: 'min', label: 'Minimum (>=)' },
    { value: 'max', label: 'Maximum (<=)' },
    { value: 'selection', label: 'Expected Selection' },
    { value: 'checklist', label: 'Checklist Verification' },
    { value: 'none', label: 'None (Observation Only)' }
  ];

  referenceTypes: ReferenceType[] = [
    'Drawing',
    'Specification Sheet',
    'Work Instruction',
    'Customer Standard',
    'Control Plan',
    'Reference Parameter',
    'Other'
  ];

  frequencyTypes: InspectionFrequencyType[] = [
    'First Piece',
    'Start-up',
    'Hourly',
    'Every 2 Hours',
    'Every Batch',
    'Shift-wise',
    'Random',
    'Last Piece',
    'Final Inspection',
    'Other'
  ];

  constructor(
    private masterConfigService: MasterConfigService,
    private templateService: TemplateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id'));
    if (id && id > 0) {
      const existing = this.masterConfigService.getMasterConfigById(id);
      if (existing) {
        this.config = structuredClone(existing);
        this.ensureConfigFields();
        this.selectedPresetId = id;
        this.currentView = 'editor';
        this.currentStep = 1;
        return;
      }
    }

    const draft = this.masterConfigService.getDraftConfig();
    if (draft && draft.name) {
      this.config = structuredClone(draft);
      this.ensureConfigFields();
    }

    this.currentView = 'list';
  }

  private autoSaveDraft(): void {
    if (this.config) {
      this.masterConfigService.saveDraftConfig(this.config);
    }
  }

  private ensureConfigFields(): void {
    if (!this.config.groups) this.config.groups = [];
    if (!this.config.sections) this.config.sections = [];
    if (!this.config.parameters) this.config.parameters = [];
    if (!this.config.status) this.config.status = 'Draft';
    if (!this.config.layoutConfig) {
      this.config.layoutConfig = {
        reportTitle: this.config.reportTitle || this.config.name,
        companyName: this.config.companyName || '',
        companySubtitle: this.config.companySubtitle || '',
        showGroupHeaders: true,
        showPhotoRow: true,
        showMethodRow: true,
        showReqSpecRow: true,
        requiredReadingsCount: 12,
        showStartupIssues: true,
        showCutSection: this.config.mcType === 'PDC',
        showApprovalBlock: true
      };
    }
    if (!this.config.approvalConfig) {
      this.config.approvalConfig = {
        preparedBy: { roleName: 'Prepared By', personName: '', employeeId: '', signatureRequired: true, dateRequired: true, mandatory: true },
        checkedBy: { roleName: 'Checked By', personName: '', employeeId: '', signatureRequired: true, dateRequired: true, mandatory: true },
        approvedBy: { roleName: 'Approved By', personName: '', employeeId: '', signatureRequired: true, dateRequired: true, mandatory: true }
      };
    }
  }

  get existingConfigs(): MasterConfig[] {
    return this.masterConfigService.getMasterConfigs();
  }

  get filteredConfigs(): MasterConfig[] {
    return this.existingConfigs.filter(c => {
      const matchesSearch = !this.searchQuery.trim() ||
        c.name.toLowerCase().includes(this.searchQuery.toLowerCase().trim()) ||
        c.partName.toLowerCase().includes(this.searchQuery.toLowerCase().trim()) ||
        (c.partNumber && c.partNumber.toLowerCase().includes(this.searchQuery.toLowerCase().trim()));

      const matchesScope = this.scopeFilter === 'All' || c.configType === this.scopeFilter;
      return matchesSearch && matchesScope;
    });
  }

  createEmptyConfig(): MasterConfig {
    const now = new Date().toISOString();
    return {
      id: Date.now(),
      name: '',
      status: 'Draft',
      reportTitle: '',
      companyName: '',
      companySubtitle: '',
      companyLogo: '',
      configType: 'Both',
      mcType: 'Press',
      documentCode: '',
      revision: '01',
      effectiveDate: now.split('T')[0],
      partName: '',
      partType: '',
      partNumber: '',
      machineType: '',
      machine: '',
      createdAt: now,
      updatedAt: now,
      sections: [],
      groups: [],
      parameters: [],
      layoutConfig: {
        reportTitle: '',
        companyName: '',
        companySubtitle: '',
        showGroupHeaders: true,
        showPhotoRow: true,
        showMethodRow: true,
        showReqSpecRow: true,
        requiredReadingsCount: 12,
        readingFrequency: 'Hourly',
        readingColumns: 12,
        showStartupIssues: true,
        showRemarks: true,
        showCutSection: true,
        showRefImage: true,
        showDeviationDetails: true,
        showCorrectiveAction: true,
        showApprovalBlock: true
      },
      approvalConfig: {
        preparedBy: { roleName: 'Prepared By', personName: '', employeeId: '', signatureRequired: true, dateRequired: true, mandatory: true },
        checkedBy: { roleName: 'Checked By', personName: '', employeeId: '', signatureRequired: true, dateRequired: true, mandatory: true },
        approvedBy: { roleName: 'Approved By', personName: '', employeeId: '', signatureRequired: true, dateRequired: true, mandatory: true }
      }
    };
  }

  createEmptyParam(sectionId?: string, groupId?: string): MasterConfigParameter {
    const secId = sectionId || (this.config?.sections[0]?.id ?? '');
    const grpId = groupId || (this.getGroupsForSection(secId)[0]?.id ?? '');
    return {
      id: 'pm_' + Date.now() + Math.floor(Math.random() * 100),
      sectionId: secId,
      groupId: grpId,
      name: '',
      parameterCode: '',
      description: '',
      scope: 'Both',
      inputType: 'number',
      specificationType: 'range',
      nominalValue: undefined,
      minValue: undefined,
      maxValue: undefined,
      unit: 'mm',
      decimalPlaces: 2,
      expectedValue: '',
      allowedValues: [],
      dropdownOptions: [],
      tolerance: '',
      toleranceType: 'symmetric',

      checkingMethod: 'VISUAL',
      instrumentId: '',
      calibrationRequired: false,
      calibrationFrequency: 'Monthly',
      calibrationCertNo: '',

      referenceType: 'Drawing',
      referenceNumber: '',
      referenceRevision: '',
      referenceDescription: '',
      workInstructionRef: '',

      referenceImage: '',
      imageDescription: '',
      imageRef: '',

      acceptanceCriteria: '',
      passCondition: '',
      failCondition: '',
      deviationAllowed: false,
      deviationLimit: '',
      remarksRequiredOnFailure: true,

      inspectionInstructions: '',
      operatorInstructions: '',
      specialPrecautions: '',
      safetyInstructions: '',
      remarks: '',

      frequency: 'Hourly',
      readingsCount: 12,
      frequencyDescription: 'Hourly shopfloor check',

      required: true,
      order: (this.config?.parameters?.length || 0) + 1
    };
  }

  goToList(): void {
    this.currentView = 'list';
  }

  startNewConfig(): void {
    this.config = this.createEmptyConfig();
    this.selectedPresetId = null;
    this.currentStep = 1;
    this.currentView = 'editor';
    this.autoSaveDraft();
  }

  editConfig(id: number): void {
    const found = this.masterConfigService.getMasterConfigById(id);
    if (found) {
      this.config = structuredClone(found);
      this.ensureConfigFields();
      this.selectedPresetId = id;
      this.currentStep = 1;
      this.currentView = 'editor';
      this.autoSaveDraft();
    }
  }

  deleteConfig(id: number, name: string): void {
    const confirmed = confirm(`Are you sure you want to delete master configuration "${name}"? This action cannot be undone.`);
    if (!confirmed) return;

    this.masterConfigService.deleteMasterConfig(id);
    if (this.selectedPresetId === id) {
      this.selectedPresetId = null;
    }
  }

  stepValidationErrors: string[] = [];

  validateStep(step: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (step === 1) {
      if (!this.config.name || !this.config.name.trim()) {
        errors.push('Configuration Name is required.');
      }
      if (!this.config.partName || !this.config.partName.trim()) {
        errors.push('Part Name is required.');
      }
      if (!this.config.partNumber || !this.config.partNumber.trim()) {
        errors.push('ERP Part Number is required.');
      }
      if (!this.config.machine || !this.config.machine.trim()) {
        errors.push('Machine / M/C Number is required.');
      }
    } else if (step === 2) {
      if (!this.config.sections || this.config.sections.length === 0) {
        errors.push('At least 1 Section is required in the Inspection Structure.');
      }
      if (!this.config.groups || this.config.groups.length === 0) {
        errors.push('At least 1 Group is required in the Inspection Structure.');
      }
    } else if (step === 3) {
      if (!this.config.parameters || this.config.parameters.length === 0) {
        errors.push('At least 1 Inspection Parameter row is required.');
      } else {
        const invalidParams = this.config.parameters.filter(p => !p.name || !p.name.trim());
        if (invalidParams.length > 0) {
          errors.push(`${invalidParams.length} parameter(s) have empty specification names.`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  canNavigateToStep(targetStep: number): boolean {
    if (targetStep <= this.currentStep) return true;

    for (let s = 1; s < targetStep; s++) {
      const res = this.validateStep(s);
      if (!res.valid) return false;
    }
    return true;
  }

  setStep(step: 1 | 2 | 3 | 4 | 5): void {
    if (step > this.currentStep) {
      if (!this.canNavigateToStep(step)) {
        const currentRes = this.validateStep(this.currentStep);
        if (!currentRes.valid) {
          this.stepValidationErrors = currentRes.errors;
        } else {
          for (let s = 1; s < step; s++) {
            const check = this.validateStep(s);
            if (!check.valid) {
              this.stepValidationErrors = [`Step ${s} is incomplete: ${check.errors.join(', ')}`];
              break;
            }
          }
        }
        return;
      }
    }

    this.stepValidationErrors = [];
    this.currentStep = step;
    this.autoSaveDraft();
  }

  nextStep(): void {
    const res = this.validateStep(this.currentStep);
    if (!res.valid) {
      this.stepValidationErrors = res.errors;
      return;
    }

    this.stepValidationErrors = [];
    if (this.currentStep < 5) {
      this.currentStep++;
      this.autoSaveDraft();
    }
  }

  prevStep(): void {
    this.stepValidationErrors = [];
    if (this.currentStep > 1) {
      this.currentStep--;
      this.autoSaveDraft();
    }
  }

  get isConfigFullyValid(): boolean {
    return this.validateStep(1).valid && this.validateStep(2).valid && this.validateStep(3).valid;
  }

  get allConfigValidationErrors(): string[] {
    return [
      ...this.validateStep(1).errors,
      ...this.validateStep(2).errors,
      ...this.validateStep(3).errors
    ];
  }

  // Section Modal Handlers
  openAddSectionModal(): void {
    this.isEditSectionMode = false;
    this.sectionModalData = {
      id: 'sec_' + Date.now(),
      name: '',
      code: '',
      description: '',
      scope: 'Both',
      order: this.config.sections.length + 1,
      active: true
    };
    this.showSectionModal = true;
  }

  openEditSectionModal(sec: MasterConfigSection): void {
    this.isEditSectionMode = true;
    this.sectionModalData = structuredClone(sec);
    this.showSectionModal = true;
  }

  closeSectionModal(): void {
    this.showSectionModal = false;
  }

  saveSectionModal(): void {
    if (!this.sectionModalData.name.trim()) {
      alert('Please enter a Section Name.');
      return;
    }

    if (this.isEditSectionMode) {
      const idx = this.config.sections.findIndex(s => s.id === this.sectionModalData.id);
      if (idx >= 0) {
        this.config.sections[idx] = structuredClone(this.sectionModalData);
      }
    } else {
      this.config.sections.push(structuredClone(this.sectionModalData));
    }

    this.showSectionModal = false;
    this.autoSaveDraft();
  }

  removeSection(index: number): void {
    const sec = this.config.sections[index];
    if (!sec) return;
    if (!confirm(`Are you sure you want to delete section "${sec.name}" and all its groups & parameters?`)) return;

    this.config.sections.splice(index, 1);
    this.config.groups = this.config.groups.filter(g => g.sectionId !== sec.id);
    this.config.parameters = this.config.parameters.filter(p => p.sectionId !== sec.id);
    this.autoSaveDraft();
  }

  // Group Modal Handlers
  openAddGroupModal(sectionId: string): void {
    this.isEditGroupMode = false;
    this.groupModalData = {
      id: 'grp_' + Date.now(),
      sectionId,
      name: '',
      code: '',
      description: '',
      order: this.getGroupsForSection(sectionId).length + 1,
      active: true
    };
    this.showGroupModal = true;
  }

  openEditGroupModal(grp: MasterConfigGroup): void {
    this.isEditGroupMode = true;
    this.groupModalData = structuredClone(grp);
    this.showGroupModal = true;
  }

  closeGroupModal(): void {
    this.showGroupModal = false;
  }

  saveGroupModal(): void {
    if (!this.groupModalData.name.trim()) {
      alert('Please enter a Group Name.');
      return;
    }
    if (!this.groupModalData.sectionId) {
      alert('Please select a Parent Section.');
      return;
    }

    if (this.isEditGroupMode) {
      const idx = this.config.groups.findIndex(g => g.id === this.groupModalData.id);
      if (idx >= 0) {
        this.config.groups[idx] = structuredClone(this.groupModalData);
      }
    } else {
      this.config.groups.push(structuredClone(this.groupModalData));
    }

    this.showGroupModal = false;
    this.autoSaveDraft();
  }

  removeGroup(groupId: string): void {
    const grp = this.config.groups.find(g => g.id === groupId);
    if (!grp) return;
    if (!confirm(`Are you sure you want to delete group "${grp.name}" and its parameters?`)) return;

    this.config.groups = this.config.groups.filter(g => g.id !== groupId);
    this.config.parameters = this.config.parameters.filter(p => p.groupId !== groupId);
    this.autoSaveDraft();
  }

  getGroupsForSection(sectionId: string): MasterConfigGroup[] {
    return (this.config.groups || []).filter(g => g.sectionId === sectionId).sort((a, b) => a.order - b.order);
  }

  getParametersForGroup(groupId: string): MasterConfigParameter[] {
    return (this.config.parameters || []).filter(p => p.groupId === groupId).sort((a, b) => a.order - b.order);
  }

  getParametersForSection(sectionId: string): MasterConfigParameter[] {
    return (this.config.parameters || []).filter(p => p.sectionId === sectionId).sort((a, b) => a.order - b.order);
  }

  openAddParamModal(sectionId: string, groupId?: string): void {
    this.isEditParamMode = false;
    this.paramModalTab = 'basic';
    this.paramModalSectionId = sectionId || (this.config.sections[0]?.id ?? '');
    this.paramModalGroupId = groupId || (this.getGroupsForSection(this.paramModalSectionId)[0]?.id ?? '');
    this.paramModalData = this.createEmptyParam(this.paramModalSectionId, this.paramModalGroupId);
    this.showParamModal = true;
  }

  openEditParamModal(param: MasterConfigParameter): void {
    this.isEditParamMode = true;
    this.paramModalTab = 'basic';
    this.paramModalSectionId = param.sectionId;
    this.paramModalGroupId = param.groupId || '';
    this.paramModalData = structuredClone(param);
    this.showParamModal = true;
  }

  closeParamModal(): void {
    this.showParamModal = false;
  }

  saveParamModal(): void {
    if (!this.paramModalData.name.trim()) {
      alert('Please enter a Parameter Name.');
      return;
    }

    this.paramModalData.sectionId = this.paramModalSectionId;
    this.paramModalData.groupId = this.paramModalGroupId;
    this.paramModalData.reqSpec = this.formatParamReqSpec(this.paramModalData);

    if (this.isEditParamMode) {
      const idx = this.config.parameters.findIndex(p => p.id === this.paramModalData.id);
      if (idx >= 0) {
        this.config.parameters[idx] = structuredClone(this.paramModalData);
      }
    } else {
      this.config.parameters.push(structuredClone(this.paramModalData));
    }

    this.showParamModal = false;
    this.autoSaveDraft();
  }

  removeParameter(index: number): void {
    this.config.parameters.splice(index, 1);
    this.autoSaveDraft();
  }

  moveParameter(param: MasterConfigParameter, direction: 'up' | 'down'): void {
    const list = this.config.parameters;
    const index = list.findIndex(p => p.id === param.id);
    if (index < 0) return;

    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    this.autoSaveDraft();
  }

  onParamTypeChange(param: MasterConfigParameter): void {
    if (param.inputType === 'number' || param.inputType === 'measurement') {
      param.specificationType = 'range';
    } else if (param.inputType === 'dropdown') {
      param.specificationType = 'selection';
      if (!param.dropdownOptions || param.dropdownOptions.length === 0) {
        param.dropdownOptions = ['OK', 'NOT OK'];
      }
    } else if (param.inputType === 'yes_no' || param.inputType === 'checkbox' || param.inputType === 'visual') {
      param.specificationType = 'checklist';
      param.expectedValue = 'OK';
    }
  }

  updateDropdownOptions(param: MasterConfigParameter, csvStr: string): void {
    param.dropdownOptions = csvStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    param.allowedValues = param.dropdownOptions;
  }

  handleImageUpload(event: Event, targetObj: { referenceImage?: string; companyLogo?: string }): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      targetObj.referenceImage = reader.result as string;
      this.autoSaveDraft();
    };
    reader.readAsDataURL(file);
  }

  handleLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.config.companyLogo = reader.result as string;
      if (this.config.layoutConfig) {
        this.config.layoutConfig.companyLogo = reader.result as string;
      }
      this.autoSaveDraft();
    };
    reader.readAsDataURL(file);
  }

  formatParamReqSpec(param: MasterConfigParameter): string {
    if (param.reqSpec && param.reqSpec.trim() && param.specificationType !== 'range') {
      return param.reqSpec;
    }

    const unit = param.unit ? ` ${param.unit}` : '';

    switch (param.specificationType) {
      case 'range':
        if (param.minValue !== undefined && param.maxValue !== undefined) {
          return `${param.minValue} - ${param.maxValue}${unit}`;
        }
        return param.reqSpec || 'Range Spec';
      case 'exact':
        return `${param.expectedValue || param.nominalValue || ''}${unit}`;
      case 'min':
        return `>= ${param.minValue ?? ''}${unit}`;
      case 'max':
        return `<= ${param.maxValue ?? ''}${unit}`;
      case 'selection':
      case 'checklist':
        return `Expected: ${param.expectedValue || 'OK'}`;
      default:
        return param.expectedValue ? `${param.expectedValue}${unit}` : (param.reqSpec || 'Visual Check');
    }
  }

  saveMasterConfig(): void {
    this.config.status = 'Saved';
    const saved = this.masterConfigService.saveMasterConfig(this.config);
    this.config = structuredClone(saved);
    this.savedNotice = true;
    setTimeout(() => this.savedNotice = false, 3000);
  }

  publishConfig(): void {
    const validation = this.allConfigValidationErrors;
    if (validation.length > 0) {
      alert('Cannot publish configuration due to validation errors:\n- ' + validation.join('\n- '));
      return;
    }

    const published = this.masterConfigService.publishMasterConfig(this.config);
    this.config = structuredClone(published);
    this.publishedNotice = true;
    alert(`Master Configuration "${published.name}" has been Published successfully! Digital Inspection template snapshot locked.`);
    this.goToList();
  }

  createTemplate(c?: MasterConfig): void {
    const targetConfig = c || this.config;
    const generated = this.masterConfigService.generateTemplateFromMaster(targetConfig);
    this.router.navigate(['/published-template', generated.id]);
  }
}
