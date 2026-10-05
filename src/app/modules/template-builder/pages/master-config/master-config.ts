import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { MasterConfigService } from '../../services/master-config.service';
import { TemplateService } from '../../services/template.service';
import { NavbarComponent } from '../../components/navbar/navbar';
import {
  MasterConfig,
  MasterConfigGroup,
  MasterConfigParameter,
  MasterConfigSection,
  MasterInputType,
  MasterMcType,
  MasterSpecType,
  ReportLayoutConfig,
  ScopeType
} from '../../models/master-config.model';

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

  config: MasterConfig = this.createEmptyConfig();
  selectedPresetId: number | null = null;
  savedNotice = false;

  // Search & filter for list view
  searchQuery = '';
  scopeFilter: 'All' | 'Inspection' | 'Setup' | 'Both' = 'All';

  // Add / Edit Parameter Modal state
  showParamModal = false;
  isEditParamMode = false;
  paramModalSectionId = '';
  paramModalGroupId = '';
  paramModalData: MasterConfigParameter = this.createEmptyParam();

  commonUnits = ['mm', 'bar', '°C', 'grams', 'Kg/cm2', 'sec', 'V', 'ml', 'mm/sec', 'rpm', 'psi'];
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
    if (!this.config.layoutConfig) {
      this.config.layoutConfig = {
        reportTitle: this.config.reportTitle || this.config.name,
        companyName: this.config.companyName || 'BHARAT BALANCING WEIGHT & CO',
        companySubtitle: this.config.companySubtitle || 'BBW GLOBAL Tek Pvt Ltd',
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
    const defaultSecId = 'sec_' + Date.now();
    const defaultGrpId = 'grp_' + Date.now();
    return {
      id: Date.now(),
      name: 'New Master Configuration',
      reportTitle: 'INPROCESS INSPECTION & SETUP REPORT',
      companyName: 'BHARAT BALANCING WEIGHT & CO',
      companySubtitle: 'BBW GLOBAL Tek Pvt Ltd',
      configType: 'Both',
      mcType: 'Press',
      partName: '',
      partType: '',
      partNumber: '',
      machineType: '',
      machine: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [
        { id: defaultSecId, name: 'PRODUCT PARAMETERS', scope: 'Inspection', order: 1 }
      ],
      groups: [
        { id: defaultGrpId, sectionId: defaultSecId, name: 'RAW MATERIAL SPECIFICATION', order: 1 }
      ],
      parameters: [
        {
          id: 'pm_' + Date.now(),
          sectionId: defaultSecId,
          groupId: defaultGrpId,
          name: 'Raw Material Width',
          reqSpec: '124.40 - 124.60 mm',
          scope: 'Inspection',
          inputType: 'number',
          specificationType: 'range',
          minValue: 124.40,
          maxValue: 124.60,
          unit: 'mm',
          checkingMethod: 'D. VERNIER',
          required: true,
          order: 1
        }
      ],
      layoutConfig: {
        reportTitle: 'INPROCESS INSPECTION & SETUP REPORT',
        companyName: 'BHARAT BALANCING WEIGHT & CO',
        companySubtitle: 'BBW GLOBAL Tek Pvt Ltd',
        showGroupHeaders: true,
        showPhotoRow: true,
        showMethodRow: true,
        showReqSpecRow: true,
        requiredReadingsCount: 12,
        showStartupIssues: true,
        showApprovalBlock: true
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
      scope: 'Both',
      inputType: 'number',
      specificationType: 'range',
      minValue: 0,
      maxValue: 100,
      unit: 'mm',
      checkingMethod: 'VISUAL',
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

  setStep(step: 1 | 2 | 3 | 4 | 5): void {
    this.currentStep = step;
    this.autoSaveDraft();
  }

  nextStep(): void {
    if (this.currentStep < 5) {
      this.currentStep++;
      this.autoSaveDraft();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.autoSaveDraft();
    }
  }

  // Hierarchy Builders: Section -> Group -> Parameter
  addSection(): void {
    const name = prompt('Enter New Section Title:', `SECTION 0${this.config.sections.length + 1}`);
    if (!name || !name.trim()) return;

    const secId = 'sec_' + Date.now();
    this.config.sections.push({
      id: secId,
      name: name.trim(),
      scope: 'Both',
      order: this.config.sections.length + 1
    });
    this.autoSaveDraft();
  }

  editSection(sec: MasterConfigSection): void {
    const newName = prompt('Edit Section Title:', sec.name);
    if (newName && newName.trim()) {
      sec.name = newName.trim();
      this.autoSaveDraft();
    }
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

  addGroup(sectionId: string): void {
    const name = prompt('Enter New Group Title (e.g. RAW MATERIAL SPECIFICATION):');
    if (!name || !name.trim()) return;

    const grpId = 'grp_' + Date.now();
    this.config.groups.push({
      id: grpId,
      sectionId,
      name: name.trim(),
      order: this.getGroupsForSection(sectionId).length + 1
    });
    this.autoSaveDraft();
  }

  editGroup(grp: MasterConfigGroup): void {
    const newName = prompt('Edit Group Title:', grp.name);
    if (newName && newName.trim()) {
      grp.name = newName.trim();
      this.autoSaveDraft();
    }
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
    this.paramModalSectionId = sectionId;
    this.paramModalGroupId = groupId || (this.getGroupsForSection(sectionId)[0]?.id ?? '');
    this.paramModalData = this.createEmptyParam(sectionId, this.paramModalGroupId);
    this.showParamModal = true;
  }

  openEditParamModal(param: MasterConfigParameter): void {
    this.isEditParamMode = true;
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
      alert('Please enter a parameter specification name.');
      return;
    }

    // Always update sectionId and groupId on the parameter object
    this.paramModalData.sectionId = this.paramModalSectionId;
    this.paramModalData.groupId = this.paramModalGroupId;

    // Auto-compute reqSpec string
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

  formatParamReqSpec(param: MasterConfigParameter): string {
    if (param.reqSpec && param.reqSpec.trim()) return param.reqSpec;

    if (param.inputType === 'number' || param.inputType === 'measurement') {
      const unitStr = param.unit ? ` ${param.unit}` : '';
      if (param.minValue !== undefined && param.maxValue !== undefined) {
        return `${param.minValue} - ${param.maxValue}${unitStr}`;
      } else if (param.minValue !== undefined) {
        return `>= ${param.minValue}${unitStr}`;
      } else if (param.maxValue !== undefined) {
        return `<= ${param.maxValue}${unitStr}`;
      }
    }
    if (param.inputType === 'checkbox' || param.inputType === 'yes_no' || param.inputType === 'visual') {
      return `Expected: ${param.expectedValue || 'OK'}`;
    }
    if (param.inputType === 'dropdown') {
      return `Options: ${(param.dropdownOptions || []).join(' / ')}`;
    }
    return param.expectedValue ? `Expected: ${param.expectedValue}` : 'Text Entry';
  }

  onParamTypeChange(param: MasterConfigParameter): void {
    if (param.inputType === 'number' || param.inputType === 'measurement') {
      param.specificationType = 'range';
    } else if (param.inputType === 'checkbox' || param.inputType === 'yes_no' || param.inputType === 'visual') {
      param.specificationType = 'checklist';
      if (!param.expectedValue) param.expectedValue = 'OK';
    } else {
      param.specificationType = 'none';
    }
  }

  handleImageUpload(event: Event, param: MasterConfigParameter): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      param.referenceImage = String(reader.result);
      this.autoSaveDraft();
    };
    reader.readAsDataURL(file);
  }

  updateDropdownOptions(param: MasterConfigParameter, rawOptions: string): void {
    if (!rawOptions) {
      param.dropdownOptions = [];
      return;
    }
    param.dropdownOptions = rawOptions.split(',').map(s => s.trim()).filter(Boolean);
  }

  exportMasterConfigToCSV(): void {
    if (!this.config || !this.config.parameters || this.config.parameters.length === 0) {
      alert('No parameters to export in this configuration.');
      return;
    }

    const headers = ['Section', 'Group', 'Parameter Name', 'Scope', 'Input Type', 'Spec Type', 'Req Spec', 'Min Value', 'Max Value', 'Expected Value', 'Unit', 'Checking Method', 'Required'];
    const rows: string[][] = [];

    for (const param of this.config.parameters) {
      const secName = this.config.sections.find(s => s.id === param.sectionId)?.name || '';
      const grpName = this.config.groups.find(g => g.id === param.groupId)?.name || '';

      rows.push([
        secName,
        grpName,
        param.name || '',
        param.scope || 'Both',
        param.inputType || 'number',
        param.specificationType || 'range',
        this.formatParamReqSpec(param),
        param.minValue !== undefined ? String(param.minValue) : '',
        param.maxValue !== undefined ? String(param.maxValue) : '',
        param.expectedValue || '',
        param.unit || '',
        param.checkingMethod || 'VISUAL',
        param.required ? 'Yes' : 'No'
      ]);
    }

    const csvLines = [
      headers.join(','),
      ...rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ];
    const csvBlob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(this.config.name || 'MasterConfig').replace(/\s+/g, '_')}_Parameters.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  importMasterConfigFromCSV(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      this.parseCSVAndPopulate(text);
      input.value = '';
    };
    reader.readAsText(file);
  }

  private parseCSVAndPopulate(csvText: string): void {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      alert('CSV file is empty or missing data rows.');
      return;
    }

    let importedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',');
      const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').trim());

      if (cleanCols.length < 3) continue;

      const secName = cleanCols[0] || 'PRODUCT PARAMETERS';
      const grpName = cleanCols[1] || 'GENERAL PARAMETERS';
      const paramName = cleanCols[2];

      if (!paramName) continue;

      let sec = this.config.sections.find(s => s.name.toLowerCase() === secName.toLowerCase());
      if (!sec) {
        sec = {
          id: 'sec_' + Date.now() + Math.floor(Math.random() * 1000),
          name: secName,
          scope: 'Both',
          order: this.config.sections.length + 1
        };
        this.config.sections.push(sec);
      }

      let grp = this.config.groups.find(g => g.sectionId === sec.id && g.name.toLowerCase() === grpName.toLowerCase());
      if (!grp) {
        grp = {
          id: 'grp_' + Date.now() + Math.floor(Math.random() * 1000),
          sectionId: sec.id,
          name: grpName,
          order: this.getGroupsForSection(sec.id).length + 1
        };
        this.config.groups.push(grp);
      }

      const newParam: MasterConfigParameter = {
        id: 'pm_' + Date.now() + Math.floor(Math.random() * 10000),
        sectionId: sec.id,
        groupId: grp.id,
        name: paramName,
        scope: (cleanCols[3] as any) || 'Both',
        inputType: (cleanCols[4] as any) || 'number',
        specificationType: (cleanCols[5] as any) || 'range',
        reqSpec: cleanCols[6] || '',
        minValue: cleanCols[7] ? Number(cleanCols[7]) : undefined,
        maxValue: cleanCols[8] ? Number(cleanCols[8]) : undefined,
        expectedValue: cleanCols[9] || undefined,
        unit: cleanCols[10] || '',
        checkingMethod: cleanCols[11] || 'VISUAL',
        required: cleanCols[12]?.toLowerCase() === 'yes' || cleanCols[12]?.toLowerCase() === 'true',
        order: this.config.parameters.length + 1
      };

      this.config.parameters.push(newParam);
      importedCount++;
    }

    this.autoSaveDraft();
    alert(`Successfully imported ${importedCount} parameters into Master Configuration!`);
  }

  saveMasterConfig(): void {
    if (!this.config.name.trim()) {
      alert('Please enter a Configuration Name.');
      return;
    }

    const saved = this.masterConfigService.saveMasterConfig(this.config);
    this.config = structuredClone(saved);
    this.selectedPresetId = saved.id;
    this.savedNotice = true;
    setTimeout(() => this.savedNotice = false, 3000);
  }


  createTemplate(configToUse?: MasterConfig): void {
    const targetConfig = configToUse || this.config;
    if (!targetConfig.name.trim()) {
      alert('Please save configuration basic details first.');
      return;
    }

    const savedConfig = this.masterConfigService.publishMasterConfig(targetConfig);
    const generatedTemplate = this.masterConfigService.generateTemplateFromMaster(savedConfig);

    this.templateService.publish(
      generatedTemplate.name,
      generatedTemplate.items,
      generatedTemplate.id,
      generatedTemplate.checklistType,
      generatedTemplate.generalDetailsRows,
      generatedTemplate.tables
    );

    this.router.navigate(['/published-template', generatedTemplate.id]);
  }


  openReferencePreset(mcType: string): void {
    const found = this.existingConfigs.find(c => c.name.toLowerCase().includes(mcType.toLowerCase())) || this.existingConfigs[0];
    if (found) {
      this.editConfig(found.id);
    }
  }
}
