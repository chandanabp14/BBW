import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MasterConfig, MasterConfigParameter, MasterConfigSection } from '../models/master-config.model';
import { Template } from '../models/template.model';
import { DynamicTable, TableCell } from '../models/table.model';
import { GeneralDetailsRow } from '../models/general-details.model';

@Injectable({
  providedIn: 'root'
})
export class MasterConfigService {
  private readonly storageKey = 'bbw-master-configurations';
  private masterConfigs: MasterConfig[] = [];
  configsSignal = signal<MasterConfig[]>([]);

  constructor(private http: HttpClient) {
    this.initMasterConfigs();
  }

  private initMasterConfigs(): void {
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

  saveMasterConfig(config: MasterConfig): MasterConfig {
    const now = new Date().toISOString();
    const existingIndex = this.masterConfigs.findIndex(c => c.id === config.id);

    if (existingIndex >= 0) {
      config.updatedAt = now;
      this.masterConfigs[existingIndex] = structuredClone(config);
    } else {
      if (!config.id) {
        config.id = Date.now();
      }
      config.createdAt = now;
      config.updatedAt = now;
      this.masterConfigs.push(structuredClone(config));
    }

    this.saveToStorage();
    return config;
  }

  deleteMasterConfig(id: number): void {
    this.masterConfigs = this.masterConfigs.filter(c => c.id !== id);
    this.saveToStorage();
  }

  /**
   * GENERATE DIGITAL TEMPLATE FROM MASTER CONFIGURATION
   *
   * Maps the Master Configuration into the Digital Template structure
   * matching the reference PDF layout (Header block, document code, part specs,
   * checking methods, parameter tables, sample entry rows, checklists, startup issues).
   */
  generateTemplateFromMaster(config: MasterConfig): Template {
    const now = new Date().toISOString();
    const templateId = Date.now();

    // 1. General Details Rows (PDF Document Header)
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

    // 2. Build PDF-structured Dynamic Tables
    const tables: DynamicTable[] = [];

    for (const section of config.sections) {
      const sectionParams = config.parameters.filter(p => p.sectionId === section.id);
      if (sectionParams.length === 0) continue;

      const rows: { cells: TableCell[] }[] = [];

      // Header Row
      const headerRowCells: TableCell[] = [
        { value: 'CHECKING PART / PARAMETER', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 220, height: 35 },
        { value: 'REQUIREMENT / SPECIFICATION', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 180, height: 35 },
        { value: 'CHECKING METHOD', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 140, height: 35 },
        { value: 'ACTUAL OBSERVATION / READINGS', rowspan: 1, colspan: 1, hidden: false, selected: false, inputMode: 'admin', inputType: 'text', required: false, width: 200, height: 35 },
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
      name: `${config.name} (Digital PDF Template)`,
      checklistType: config.configType,
      generalDetailsRows,
      tables,
      status: 'published',
      items: [
        {
          id: 1,
          type: 'heading',
          text: `${config.mcType} ${config.configType.toUpperCase()} REPORT - ${config.partName}`
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
        return `Expected: ${param.expectedValue || 'OK'}`;
      case 'checklist':
        return 'Required Check';
      default:
        return param.expectedValue ? `${param.expectedValue}${unit}` : 'Visual Inspection';
    }
  }

  /**
   * Reference PDF Presets matching:
   * 1. Press MC 120 (BBW/QTY/R/283 & BBW/PRO/R/19)
   * 2. PDC MC 07 (BBW/QTY/R/05 REV 02 & BBW/PRO/R/14 REV 02)
   */
  private getDefaultConfigs(): MasterConfig[] {
    const now = new Date().toISOString();

    return [
      {
        id: 1001,
        name: 'PRESS MC 120 - Plate Hinge Inspection & Setup Master',
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
        sections: [
          { id: 'sec_p1', name: 'Raw Material Specification', scope: 'Inspection', order: 1 },
          { id: 'sec_p2', name: 'Product Parameters (Blanking, Piercing & Embossing)', scope: 'Inspection', order: 2 },
          { id: 'sec_p3', name: 'Process Parameters & Lubrications', scope: 'Setup', order: 3 },
          { id: 'sec_p4', name: 'Setting Tools & Parameters', scope: 'Setup', order: 4 },
          { id: 'sec_p5', name: 'M/C Cleaning and Lubrication', scope: 'Setup', order: 5 }
        ],
        parameters: [
          // Raw Material Specification
          { id: 'pm_101', sectionId: 'sec_p1', name: 'Raw Material Width', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 124.40, maxValue: 124.60, unit: 'mm', checkingMethod: 'D. VERNIER', required: true, order: 1 },
          { id: 'pm_102', sectionId: 'sec_p1', name: 'Raw Material Thickness', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 2.90, maxValue: 3.10, unit: 'mm', checkingMethod: 'MICRO METER', required: true, order: 2 },
          { id: 'pm_103', sectionId: 'sec_p1', name: 'Raw Material Length', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 117.20, maxValue: 117.76, unit: 'mm', checkingMethod: 'D. VERNIER', required: true, order: 3 },
          { id: 'pm_103b', sectionId: 'sec_p1', name: 'Flange Width 2', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 34.65, maxValue: 35.21, unit: 'mm', checkingMethod: 'D. VERNIER', required: true, order: 4 },
          { id: 'pm_103c', sectionId: 'sec_p1', name: 'Flange Thickness 2', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 2.94, maxValue: 3.14, unit: 'mm', checkingMethod: 'MICRO METER', required: true, order: 5 },

          // Product Parameters
          { id: 'pm_104', sectionId: 'sec_p2', name: 'Embossing Height', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 4.87, maxValue: 5.43, unit: 'mm', checkingMethod: 'HEIGHT GAUGE', required: true, order: 6 },
          { id: 'pm_105', sectionId: 'sec_p2', name: 'Hole Dia - 1', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 3.29, maxValue: 3.35, unit: 'mm', checkingMethod: 'PLUG GAUGE', required: true, order: 7 },
          { id: 'pm_106', sectionId: 'sec_p2', name: 'Hole Dia - 2', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 3.29, maxValue: 3.35, unit: 'mm', checkingMethod: 'PLUG GAUGE', required: true, order: 8 },
          { id: 'pm_107', sectionId: 'sec_p2', name: 'Hole Dia - 3', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 3.29, maxValue: 3.36, unit: 'mm', checkingMethod: 'PLUG GAUGE', required: true, order: 9 },
          { id: 'pm_108', sectionId: 'sec_p2', name: 'Position Gauge Answering', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 10 },
          { id: 'pm_109', sectionId: 'sec_p2', name: 'Tapping Hole 1 Thread Gauge GO/NOGO', scope: 'Inspection', inputType: 'dropdown', specificationType: 'selection', expectedValue: 'OK', dropdownOptions: ['OK', 'NOT OK'], checkingMethod: 'THREAD GAUGE', required: true, order: 11 },

          // Process Parameters & Lubrication
          { id: 'pm_110', sectionId: 'sec_p3', name: 'Air Pressure Gauge', scope: 'Setup', inputType: 'number', specificationType: 'range', minValue: 4.0, maxValue: 6.0, unit: 'Kg/cm2', checkingMethod: 'VISUAL', required: true, order: 12 },
          { id: 'pm_111', sectionId: 'sec_p3', name: 'Oil Pumping to M/C', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'MANUAL', required: true, order: 13 },
          { id: 'pm_112', sectionId: 'sec_p3', name: 'Tool Oiling Interval', scope: 'Setup', inputType: 'text', specificationType: 'exact', expectedValue: 'Every 2 hours', checkingMethod: 'MANUAL', required: false, order: 14 },

          // Setting Tools & Parameters
          { id: 'pm_112a', sectionId: 'sec_p4', name: 'Coil & Tool Alignment', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'MODEL VISE', required: true, order: 15 },
          { id: 'pm_112b', sectionId: 'sec_p4', name: 'Ejection Cylinder Function', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'MODEL VISE', required: true, order: 16 },
          { id: 'pm_112c', sectionId: 'sec_p4', name: 'Feeder Stroke Length', scope: 'Setup', inputType: 'number', specificationType: 'range', minValue: 118, maxValue: 122, unit: 'mm', checkingMethod: 'VERNIER', required: true, order: 17 },
          { id: 'pm_112d', sectionId: 'sec_p4', name: 'Stroke Length Scale', scope: 'Setup', inputType: 'number', specificationType: 'range', minValue: 318, maxValue: 322, unit: 'mm', checkingMethod: 'SCALE', required: true, order: 18 },

          // M/C Cleaning
          { id: 'pm_113', sectionId: 'sec_p5', name: 'Ram & Ram Bed Free From Dust', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 19 },
          { id: 'pm_114', sectionId: 'sec_p5', name: 'Oil Collector Cleanliness', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 20 },
          { id: 'pm_115', sectionId: 'sec_p5', name: 'Gear Wheel & Coil Feeder', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 21 }
        ]
      },
      {
        id: 1002,
        name: 'PDC MC 07 - PDC Inprocess Inspection & Setup Master',
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
        sections: [
          { id: 'sec_pdc1', name: 'Process Parameters', scope: 'Both', order: 1 },
          { id: 'sec_pdc2', name: 'Product Parameters & Weight', scope: 'Inspection', order: 2 },
          { id: 'sec_pdc3', name: 'POKE YOKE & Visual Inspection', scope: 'Inspection', order: 3 },
          { id: 'sec_pdc4', name: 'Setting Methods & Tooling Controls', scope: 'Setup', order: 4 },
          { id: 'sec_pdc5', name: 'M/C Cleanness & Lubrication', scope: 'Setup', order: 5 }
        ],
        parameters: [
          // Process Parameters
          { id: 'pm_201', sectionId: 'sec_pdc1', name: 'Furnace Temperature', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 350, maxValue: 450, unit: '°C', checkingMethod: 'TEMP INDICATOR', required: true, order: 1 },
          { id: 'pm_202', sectionId: 'sec_pdc1', name: 'Sprue Temperature', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 350, maxValue: 460, unit: '°C', checkingMethod: 'TEMP INDICATOR', required: true, order: 2 },
          { id: 'pm_203', sectionId: 'sec_pdc1', name: 'Pump Pressure', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 3, maxValue: 6, unit: 'bar', checkingMethod: 'PRESSURE GAUGE', required: true, order: 3 },
          { id: 'pm_204', sectionId: 'sec_pdc1', name: 'Closing Pressure', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 4, maxValue: 6, unit: 'bar', checkingMethod: 'PRESSURE GAUGE', required: true, order: 4 },
          { id: 'pm_205', sectionId: 'sec_pdc1', name: 'Cooling Water Temp', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 12, maxValue: 18, unit: '°C', checkingMethod: 'TEMP INDICATOR', required: true, order: 5 },
          { id: 'pm_206', sectionId: 'sec_pdc1', name: 'Opening Delay', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 1.2, maxValue: 2.2, unit: 'sec', checkingMethod: 'TIMER', required: true, order: 6 },
          { id: 'pm_207', sectionId: 'sec_pdc1', name: 'Closing Delay', scope: 'Both', inputType: 'number', specificationType: 'range', minValue: 1.0, maxValue: 3.8, unit: 'sec', checkingMethod: 'TIMER', required: true, order: 7 },

          // Product Parameters & Weight
          { id: 'pm_208', sectionId: 'sec_pdc2', name: 'Mass / Gram Weight', scope: 'Inspection', inputType: 'number', specificationType: 'range', minValue: 19.00, maxValue: 20.50, unit: 'grams', checkingMethod: 'WEIGHING SCALE', required: true, order: 8 },
          { id: 'pm_209', sectionId: 'sec_pdc2', name: 'Hole GO Gauge', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'OK', checkingMethod: 'PLUG GAUGE', required: true, order: 9 },
          { id: 'pm_210', sectionId: 'sec_pdc2', name: 'Hole NO GO Gauge', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'OK', checkingMethod: 'PLUG GAUGE', required: true, order: 10 },

          // Visual & Poke Yoke
          { id: 'pm_211', sectionId: 'sec_pdc3', name: 'Blow Holes / Porosity', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'Nill Allowed', checkingMethod: 'VISUAL', required: true, order: 11 },
          { id: 'pm_212', sectionId: 'sec_pdc3', name: 'Short Mould / Coverage', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 12 },
          { id: 'pm_212b', sectionId: 'sec_pdc3', name: 'Centre Line Shift', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'Not Allowed', checkingMethod: 'VISUAL', required: true, order: 13 },
          { id: 'pm_212c', sectionId: 'sec_pdc3', name: 'Crack & Bend Check', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'Nill Allowed', checkingMethod: 'VISUAL', required: true, order: 14 },
          { id: 'pm_213', sectionId: 'sec_pdc3', name: 'Clip Shake & Flash', scope: 'Inspection', inputType: 'yes_no', specificationType: 'selection', expectedValue: 'No Flash Allowed', checkingMethod: 'VISUAL', required: true, order: 15 },

          // Setting Methods
          { id: 'pm_214', sectionId: 'sec_pdc4', name: 'Sprue Line Blockage Check', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: '5mm Drill Bit', required: true, order: 16 },
          { id: 'pm_215', sectionId: 'sec_pdc4', name: 'Clip Guide Tightened with M6 Spring Washer', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'ALLEN KEY', required: true, order: 17 },
          { id: 'pm_216', sectionId: 'sec_pdc4', name: 'Backjaw & Mould Close Properly', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'OK', checkingMethod: 'VISUAL', required: true, order: 18 },

          // M/C Cleanness
          { id: 'pm_217', sectionId: 'sec_pdc5', name: 'Vibrator & M/C Panel Free From Dust', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'Clean', checkingMethod: 'VISUAL', required: true, order: 19 },
          { id: 'pm_218', sectionId: 'sec_pdc5', name: 'Moving Casting & M/C Area Cleanliness', scope: 'Setup', inputType: 'yes_no', specificationType: 'checklist', expectedValue: 'Clean', checkingMethod: 'VISUAL', required: true, order: 20 }
        ]
      }
    ];
  }
}
