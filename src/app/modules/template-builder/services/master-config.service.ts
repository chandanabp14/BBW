import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MasterConfig, MasterConfigGroup, MasterConfigParameter, MasterConfigSection } from '../models/master-config.model';
import { Template } from '../models/template.model';
import { DynamicTable, TableCell } from '../models/table.model';
import { GeneralDetailsRow } from '../models/general-details.model';

@Injectable({
  providedIn: 'root'
})
export class MasterConfigService {
  private readonly storageKey = 'bbw-master-configurations';
  private readonly draftKey = 'masterConfigurationDraft';
  private readonly publishedKey = 'publishedMasterConfiguration';
  private readonly publishedChecklistKey = 'publishedChecklist';
  private readonly apiUrl = 'http://localhost:3000/api/master-configs';

  private masterConfigs: MasterConfig[] = [];
  configsSignal = signal<MasterConfig[]>([]);

  constructor(private http: HttpClient) {
    this.initMasterConfigs();
  }

  private async initMasterConfigs(): Promise<void> {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.masterConfigs = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved master configs', e);
        this.masterConfigs = this.getDefaultConfigs();
      }
    } else {
      this.masterConfigs = this.getDefaultConfigs();
      this.saveToStorage();
    }
    this.configsSignal.set([...this.masterConfigs]);

    // Async sync with Backend API if available
    try {
      const res = await firstValueFrom(this.http.get<{ success: boolean; data: MasterConfig[] }>(this.apiUrl));
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        // Merge with local configs
        for (const remoteConfig of res.data) {
          const idx = this.masterConfigs.findIndex(c => c.id === remoteConfig.id);
          if (idx >= 0) {
            this.masterConfigs[idx] = { ...this.masterConfigs[idx], ...remoteConfig };
          } else {
            this.masterConfigs.push(remoteConfig);
          }
        }
        this.saveToStorage();
      }
    } catch {
      // Backend optional fallback
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.masterConfigs));
    this.configsSignal.set([...this.masterConfigs]);
  }

  getMasterConfigs(): MasterConfig[] {
    return [...this.masterConfigs];
  }

  getMasterConfigById(id: number): MasterConfig | undefined {
    return this.masterConfigs.find(c => c.id === id);
  }

  saveDraftConfig(config: MasterConfig): void {
    if (!config) return;
    localStorage.setItem(this.draftKey, JSON.stringify(config));
  }

  getDraftConfig(): MasterConfig | null {
    const saved = localStorage.getItem(this.draftKey);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  clearDraftConfig(): void {
    localStorage.removeItem(this.draftKey);
  }

  saveMasterConfig(config: MasterConfig): MasterConfig {
    const now = new Date().toISOString();

    // Preserve all existing fields and clone completely
    const completeConfig: MasterConfig = {
      id: config.id || Date.now(),
      name: config.name || 'Untitled Master Configuration',
      reportTitle: config.reportTitle || config.name || 'INPROCESS INSPECTION & SETUP REPORT',
      companyName: config.companyName || 'BHARAT BALANCING WEIGHT & CO',
      companySubtitle: config.companySubtitle || 'BBW GLOBAL Tek Pvt Ltd',
      configType: config.configType || 'Both',
      mcType: config.mcType || 'Press',
      documentCode: config.documentCode || 'BBW/QTY/R/283',
      partName: config.partName || '',
      partType: config.partType || '',
      partNumber: config.partNumber || '',
      machineType: config.machineType || '',
      machine: config.machine || '',
      sections: structuredClone(config.sections || []),
      groups: structuredClone(config.groups || []),
      parameters: structuredClone(config.parameters || []),
      layoutConfig: structuredClone(config.layoutConfig || {
        reportTitle: config.reportTitle || config.name,
        companyName: config.companyName || 'BHARAT BALANCING WEIGHT & CO',
        companySubtitle: config.companySubtitle || 'BBW GLOBAL Tek Pvt Ltd',
        showGroupHeaders: true,
        showPhotoRow: true,
        showMethodRow: true,
        showReqSpecRow: true,
        requiredReadingsCount: 12,
        showStartupIssues: true,
        showApprovalBlock: true
      }),
      createdAt: config.createdAt || now,
      updatedAt: now,
      publishedTemplateId: config.publishedTemplateId
    };

    const existingIndex = this.masterConfigs.findIndex(c => c.id === completeConfig.id);

    if (existingIndex >= 0) {
      this.masterConfigs[existingIndex] = completeConfig;
    } else {
      this.masterConfigs.push(completeConfig);
    }

    this.saveToStorage();
    this.saveDraftConfig(completeConfig);

    // Sync to Backend API in background
    this.http.put(`${this.apiUrl}/${completeConfig.id}`, completeConfig).subscribe({
      error: () => {
        // Silent fallback to local storage
        this.http.post(this.apiUrl, completeConfig).subscribe({ error: () => {} });
      }
    });

    return completeConfig;
  }

  publishMasterConfig(config: MasterConfig): MasterConfig {
    const savedConfig = this.saveMasterConfig(config);

    // Take complete snapshot for published state
    const publishedSnapshot = structuredClone(savedConfig);
    localStorage.setItem(this.publishedKey, JSON.stringify(publishedSnapshot));
    localStorage.setItem(this.publishedChecklistKey, JSON.stringify([publishedSnapshot]));

    return savedConfig;
  }

  getPublishedMasterConfig(id?: number): MasterConfig | undefined {
    if (id) {
      const found = this.masterConfigs.find(c => c.id === id);
      if (found) return found;
    }

    const saved = localStorage.getItem(this.publishedKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }

    const checklistSaved = localStorage.getItem(this.publishedChecklistKey);
    if (checklistSaved) {
      try {
        const parsed = JSON.parse(checklistSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        } else if (parsed && parsed.name) {
          return parsed;
        }
      } catch {
        // Fallback
      }
    }

    return this.masterConfigs[0];
  }

  deleteMasterConfig(id: number): void {
    this.masterConfigs = this.masterConfigs.filter(c => c.id !== id);
    this.saveToStorage();
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({ error: () => {} });
  }

  /**
   * GENERATE DIGITAL TEMPLATE FROM MASTER CONFIGURATION

   * Maps Master Configuration (Sections -> Groups -> Parameters) dynamically into Template structure.
   */
  generateTemplateFromMaster(config: MasterConfig): Template {
    const now = new Date().toISOString();
    const templateId = Date.now();

    const generalDetailsRows: GeneralDetailsRow[] = [
      {
        id: 1,
        fields: [
          { id: 101, label: 'ERP PART NUMBER', value: config.partNumber || '1A1-03220 / BL', inputType: 'text', inputMode: 'admin' },
          { id: 102, label: 'PART DESCRIPTION', value: config.partName || 'PLATE HINGE', inputType: 'text', inputMode: 'admin' },
          { id: 103, label: 'M/C NO', value: config.machine || '120', inputType: 'text', inputMode: 'admin' }
        ]
      },
      {
        id: 2,
        fields: [
          { id: 104, label: 'DATE', value: now.split('T')[0], inputType: 'date', inputMode: 'inspector' },
          { id: 105, label: 'SHIFT', value: 'Day', inputType: 'text', inputMode: 'inspector' },
          { id: 106, label: 'OPERATOR', value: '', inputType: 'text', inputMode: 'inspector' },
          { id: 107, label: 'SUPERVISOR', value: 'SELVA', inputType: 'text', inputMode: 'inspector' }
        ]
      }
    ];

    const tables: DynamicTable[] = [];

    for (const section of config.sections) {
      const sectionParams = config.parameters.filter(p => p.sectionId === section.id);
      if (sectionParams.length === 0) continue;

      const rows: { cells: TableCell[] }[] = [];

      // Header Row
      const headerRowCells: TableCell[] = [
        { value: 'SPECIFICATION / QUESTION', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 220, height: 35 },
        { value: 'REQUIREMENT / SPECIFICATION', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 180, height: 35 },
        { value: 'CHECKING METHOD', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 140, height: 35 },
        { value: 'ACTUAL OBSERVATION', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 200, height: 35 },
        { value: 'VALIDATION RESULT', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 140, height: 35 }
      ];
      rows.push({ cells: headerRowCells });

      // Parameter Rows
      for (const param of sectionParams) {
        const formattedSpec = this.formatParamSpec(param);

        const rowCells: TableCell[] = [
          { value: param.name, rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 220, height: 40 },
          { value: formattedSpec, rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 180, height: 40 },
          { value: param.checkingMethod || 'VISUAL', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 140, height: 40 },
          { value: '', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'inspector', inputType: param.inputType as any, required: param.required, width: 200, height: 40 },
          { value: 'PENDING', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'inspector', inputType: 'text', required: false, width: 140, height: 40 }
        ];
        rows.push({ cells: rowCells });
      }

      tables.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: `${section.name} (${section.scope})`,
        rows
      });
    }

    const generatedTemplate: Template = {
      id: templateId,
      name: `${config.name} (Digital Template)`,
      checklistType: config.configType,
      generalDetailsRows,
      tables,
      status: 'published',
      items: [
        {
          id: 1,
          type: 'heading',
          text: `${config.reportTitle || config.name}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    config.publishedTemplateId = templateId;
    this.saveMasterConfig(config);

    return generatedTemplate;
  }

  private formatParamSpec(param: MasterConfigParameter): string {
    if (param.reqSpec && param.reqSpec.trim()) return param.reqSpec;
    const unit = param.unit ? ` ${param.unit}` : '';
    switch (param.specificationType) {
      case 'range':
        return `${param.minValue} - ${param.maxValue}${unit}`;
      case 'exact':
        return `${param.expectedValue}${unit}`;
      case 'min':
        return `>= ${param.minValue}${unit}`;
      case 'max':
        return `<= ${param.maxValue}${unit}`;
      case 'selection':
      case 'checklist':
        return `Expected: ${param.expectedValue || 'OK'}`;
      default:
        return param.expectedValue ? `${param.expectedValue}${unit}` : 'Visual Inspection';
    }
  }

  private getDefaultConfigs(): MasterConfig[] {
    const now = new Date().toISOString();

    const secP1 = 'sec_p1';
    const secP2 = 'sec_p2';
    const secP3 = 'sec_p3';

    const grpRM = 'grp_rm';
    const grpBPE = 'grp_bpe';
    const grpTap = 'grp_tap';
    const grpProc = 'grp_proc';
    const grpTools = 'grp_tools';
    const grpClean = 'grp_clean';

    return [
      {
        id: 1001,
        name: 'PRESS MC 120 - Plate Hinge Inspection & Setup Master',
        reportTitle: 'PRESS MC 120 INPROCESS INSPECTION & SETUP REPORT',
        companyName: 'BHARAT BALANCING WEIGHT & CO',
        companySubtitle: 'BBW GLOBAL Tek Pvt Ltd',
        configType: 'Both',
        mcType: 'Press',
        documentCode: 'BBW/QTY/R/283',
        partName: 'PLATE HINGE',
        partType: 'Sheet Metal Pressing',
        partNumber: '1A1-03220 / BL',
        machineType: 'Press Machine',
        machine: '120',
        createdAt: now,
        updatedAt: now,
        layoutConfig: {
          reportTitle: 'PRESS MC 120 INPROCESS INSPECTION & SETUP REPORT',
          companyName: 'BHARAT BALANCING WEIGHT & CO',
          showGroupHeaders: true,
          showPhotoRow: true,
          showMethodRow: true,
          showReqSpecRow: true,
          requiredReadingsCount: 12,
          showStartupIssues: true,
          showApprovalBlock: true
        },
        sections: [
          { id: secP1, name: 'PRODUCT PARAMETERS', scope: 'Inspection', order: 1 },
          { id: secP2, name: 'PROCESS PARAMETERS & LUBRICATIONS', scope: 'Both', order: 2 },
          { id: secP3, name: 'SET UP AND START UP CHECK SHEET', scope: 'Setup', order: 3 }
        ],
        groups: [
          { id: grpRM, sectionId: secP1, name: 'RAW MATERIAL SPECIFICATION', order: 1 },
          { id: grpBPE, sectionId: secP1, name: 'BLANKING / PIERCING / EMBOSSING', order: 2 },
          { id: grpTap, sectionId: secP1, name: 'TAPPING', order: 3 },
          { id: grpProc, sectionId: secP2, name: 'PROCESS CONTROLS & LUBRICATION', order: 1 },
          { id: grpTools, sectionId: secP3, name: 'SETTING TOOLS & PARAMETERS', order: 1 },
          { id: grpClean, sectionId: secP3, name: 'M/C CLEANING AND LUBRICATION', order: 2 }
        ],
        parameters: [
          // RAW MATERIAL SPECIFICATION
          { id: 'pm_101', sectionId: secP1, groupId: grpRM, name: 'Raw Material Width', reqSpec: '124.40 - 124.60 mm', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 124.40, maxValue: 124.60, unit: 'mm', checkingMethod: 'D. VERNIER', required: true, order: 1 },
          { id: 'pm_102', sectionId: secP1, groupId: grpRM, name: 'Raw Material Thickness', reqSpec: '2.90 - 3.10 mm', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 2.90, maxValue: 3.10, unit: 'mm', checkingMethod: 'MICRO METER', required: true, order: 2 },
          { id: 'pm_103', sectionId: secP1, groupId: grpRM, name: 'Raw Material Length', reqSpec: '117.20 - 117.76 mm', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 117.20, maxValue: 117.76, unit: 'mm', checkingMethod: 'D. VERNIER', required: true, order: 3 },
          { id: 'pm_103b', sectionId: secP1, groupId: grpRM, name: 'Flange Width 2', reqSpec: '34.65 - 35.21 mm', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 34.65, maxValue: 35.21, unit: 'mm', checkingMethod: 'D. VERNIER', required: true, order: 4 },

          // BLANKING / PIERCING / EMBOSSING
          { id: 'pm_104', sectionId: secP1, groupId: grpBPE, name: 'Embossing Height', reqSpec: '4.87 - 5.43 mm', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 4.87, maxValue: 5.43, unit: 'mm', checkingMethod: 'HEIGHT GAUGE', required: true, order: 5 },
          { id: 'pm_105', sectionId: secP1, groupId: grpBPE, name: 'Hole Dia - 1', reqSpec: '3.29 - 3.35 mm', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 3.29, maxValue: 3.35, unit: 'mm', checkingMethod: 'PLUG GAUGE', required: true, order: 6 },
          { id: 'pm_106', sectionId: secP1, groupId: grpBPE, name: 'Hole Dia - 2', reqSpec: '3.29 - 3.35 mm', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 3.29, maxValue: 3.35, unit: 'mm', checkingMethod: 'PLUG GAUGE', required: true, order: 7 },
          { id: 'pm_107', sectionId: secP1, groupId: grpBPE, name: 'Hole Dia - 3', reqSpec: '3.29 - 3.36 mm', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 3.29, maxValue: 3.36, unit: 'mm', checkingMethod: 'PLUG GAUGE', required: true, order: 8 },
          { id: 'pm_108', sectionId: secP1, groupId: grpBPE, name: 'Position Gauge Answering', reqSpec: 'Expected: OK', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 9 },

          // TAPPING
          { id: 'pm_109', sectionId: secP1, groupId: grpTap, name: 'Tapping Hole 1 Thread Gauge GO/NOGO', reqSpec: 'Expected: OK', scope: 'Inspection', inputType: 'dropdown', specificationType: 'selection', expectedValue: 'OK', dropdownOptions: ['OK', 'NOT OK'], checkingMethod: 'THREAD GAUGE', required: true, order: 10 },
          { id: 'pm_109b', sectionId: secP1, groupId: grpTap, name: 'Tapping Hole 2 Thread Gauge GO/NOGO', reqSpec: 'Expected: OK', scope: 'Inspection', inputType: 'dropdown', specificationType: 'selection', expectedValue: 'OK', dropdownOptions: ['OK', 'NOT OK'], checkingMethod: 'THREAD GAUGE', required: true, order: 11 },

          // PROCESS PARAMETERS & LUBRICATION
          { id: 'pm_110', sectionId: secP2, groupId: grpProc, name: 'Air Pressure Gauge', reqSpec: '4.0 - 6.0 Kg/cm2', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 4.0, maxValue: 6.0, unit: 'Kg/cm2', checkingMethod: 'VISUAL', required: true, order: 12 },
          { id: 'pm_111', sectionId: secP2, groupId: grpProc, name: 'Oil Pumping to M/C', reqSpec: 'Expected: OK', scope: 'Both', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'MANUAL', required: true, order: 13 },
          { id: 'pm_112', sectionId: secP2, groupId: grpProc, name: 'Tool Oiling Interval', reqSpec: 'Every 2 hours', scope: 'Both', inputType: 'text', specificationType: 'exact', expectedValue: 'Every 2 hours', checkingMethod: 'MANUAL', required: false, order: 14 },

          // SETTING TOOLS & PARAMETERS
          { id: 'pm_112a', sectionId: secP3, groupId: grpTools, name: 'Coil & Tool Alignment', reqSpec: 'Expected: OK', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'MODEL VISE', required: true, order: 15 },
          { id: 'pm_112b', sectionId: secP3, groupId: grpTools, name: 'Ejection Cylinder Function', reqSpec: 'Expected: OK', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'MODEL VISE', required: true, order: 16 },
          { id: 'pm_112c', sectionId: secP3, groupId: grpTools, name: 'Feeder Stroke Length', reqSpec: '118 - 122 mm', scope: 'Setup', inputType: 'number', specificationType: 'range', minValue: 118, maxValue: 122, unit: 'mm', checkingMethod: 'VERNIER', required: true, order: 17 },
          { id: 'pm_112d', sectionId: secP3, groupId: grpTools, name: 'Stroke Length Scale', reqSpec: '318 - 322 mm', scope: 'Setup', inputType: 'number', specificationType: 'range', minValue: 318, maxValue: 322, unit: 'mm', checkingMethod: 'SCALE', required: true, order: 18 },

          // M/C CLEANING
          { id: 'pm_113', sectionId: secP3, groupId: grpClean, name: 'Ram & Ram Bed Free From Dust', reqSpec: 'Expected: OK', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 19 },
          { id: 'pm_114', sectionId: secP3, groupId: grpClean, name: 'Oil Collector Cleanliness', reqSpec: 'Expected: OK', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 20 }
        ]
      },
      {
        id: 1002,
        name: 'PDC MC 07 - PDC Inprocess Inspection & Setup Master',
        reportTitle: 'PDC MC 07 INPROCESS INSPECTION & SETUP REPORT',
        companyName: 'BHARAT BALANCING WEIGHT & CO',
        companySubtitle: 'BBW GLOBAL Tek Pvt Ltd',
        configType: 'Both',
        mcType: 'PDC',
        documentCode: 'BBW/QTY/R/05 REV 02',
        partName: '5512 - 20 - cast 20g',
        partType: 'Aluminum Die Casting',
        partNumber: '5512 - 20 - 0281 / 2097',
        machineType: 'PDC Machine',
        machine: '07',
        createdAt: now,
        updatedAt: now,
        layoutConfig: {
          reportTitle: 'PDC MC 07 INPROCESS INSPECTION REPORT',
          showGroupHeaders: true,
          showPhotoRow: true,
          showMethodRow: true,
          showReqSpecRow: true,
          requiredReadingsCount: 12,
          showStartupIssues: true,
          showCutSection: true,
          showApprovalBlock: true
        },
        sections: [
          { id: 'sec_pdc1', name: 'PROCESS PARAMETERS', scope: 'Both', order: 1 },
          { id: 'sec_pdc2', name: 'PRODUCT PARAMETERS & WEIGHT', scope: 'Inspection', order: 2 },
          { id: 'sec_pdc3', name: 'SET UP AND START UP CHECK SHEET', scope: 'Setup', order: 3 }
        ],
        groups: [
          { id: 'grp_pdc_proc', sectionId: 'sec_pdc1', name: 'THERMAL & PRESSURE CONTROLS', order: 1 },
          { id: 'grp_pdc_prod', sectionId: 'sec_pdc2', name: 'PRODUCT WEIGHT & PLUG GAUGE', order: 1 },
          { id: 'grp_pdc_vis', sectionId: 'sec_pdc2', name: 'POKE YOKE & VISUAL INSPECTION', order: 2 },
          { id: 'grp_pdc_setup', sectionId: 'sec_pdc3', name: 'SETTING METHODS & TOOLING CONTROLS', order: 1 }
        ],
        parameters: [
          { id: 'pm_201', sectionId: 'sec_pdc1', groupId: 'grp_pdc_proc', name: 'Furnace Temperature', reqSpec: '350 - 450 °C', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 350, maxValue: 450, unit: '°C', checkingMethod: 'TEMP INDICATOR', required: true, order: 1 },
          { id: 'pm_202', sectionId: 'sec_pdc1', groupId: 'grp_pdc_proc', name: 'Sprue Temperature', reqSpec: '350 - 460 °C', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 350, maxValue: 460, unit: '°C', checkingMethod: 'TEMP INDICATOR', required: true, order: 2 },
          { id: 'pm_203', sectionId: 'sec_pdc1', groupId: 'grp_pdc_proc', name: 'Pump Pressure', reqSpec: '3 - 6 bar', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 3, maxValue: 6, unit: 'bar', checkingMethod: 'PRESSURE GAUGE', required: true, order: 3 },

          { id: 'pm_208', sectionId: 'sec_pdc2', groupId: 'grp_pdc_prod', name: 'Mass / Gram Weight', reqSpec: '19.00 - 20.50 grams', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 19.00, maxValue: 20.50, unit: 'grams', checkingMethod: 'WEIGHING SCALE', required: true, order: 4 },
          { id: 'pm_209', sectionId: 'sec_pdc2', groupId: 'grp_pdc_prod', name: 'Hole GO Gauge', reqSpec: 'Expected: OK', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'OK', checkingMethod: 'PLUG GAUGE', required: true, order: 5 },

          { id: 'pm_211', sectionId: 'sec_pdc2', groupId: 'grp_pdc_vis', name: 'Blow Holes / Porosity', reqSpec: 'Nill Allowed', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'Nill Allowed', checkingMethod: 'VISUAL', required: true, order: 6 },
          { id: 'pm_212', sectionId: 'sec_pdc2', groupId: 'grp_pdc_vis', name: 'Short Mould / Coverage', reqSpec: 'Expected: OK', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 7 },

          { id: 'pm_214', sectionId: 'sec_pdc3', groupId: 'grp_pdc_setup', name: 'Sprue Line Blockage Check', reqSpec: 'Expected: OK', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: '5mm Drill Bit', required: true, order: 8 },
          { id: 'pm_217', sectionId: 'sec_pdc3', groupId: 'grp_pdc_setup', name: 'Vibrator & M/C Panel Cleanliness', reqSpec: 'Clean', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'Clean', checkingMethod: 'VISUAL', required: true, order: 9 }
        ]
      }
    ];
  }
}
