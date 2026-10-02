import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { MasterConfigService } from '../../services/master-config.service';
import { TemplateService } from '../../services/template.service';
import { NavbarComponent } from '../../components/navbar/navbar';
import {
  MasterConfig,
  MasterConfigParameter,
  MasterConfigSection,
  MasterInputType,
  MasterMcType,
  MasterSpecType,
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
  config: MasterConfig = this.createEmptyConfig();
  selectedPresetId: number | null = null;
  savedNotice = false;

  commonUnits = ['mm', 'bar', '°C', 'grams', 'Kg/cm2', 'sec', 'V', 'ml', 'mm/sec', 'rpm', 'psi'];
  inputTypes: { value: MasterInputType; label: string }[] = [
    { value: 'number', label: 'Number' },
    { value: 'text', label: 'Text / Observation' },
    { value: 'dropdown', label: 'Dropdown Selection' },
    { value: 'yes_no', label: 'Yes / No' },
    { value: 'checkbox', label: 'Checklist OK/NOT OK' },
    { value: 'image', label: 'Image Upload' }
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
        this.selectedPresetId = id;
        return;
      }
    }

    // Default load first preset if available
    const configs = this.masterConfigService.getMasterConfigs();
    if (configs.length > 0) {
      this.loadConfigPreset(configs[0].id);
    }
  }

  createEmptyConfig(): MasterConfig {
    const defaultSecId = 'sec_' + Date.now();
    return {
      id: Date.now(),
      name: 'New Master Configuration',
      configType: 'Both',
      mcType: 'PDC',
      partName: '',
      partType: '',
      partNumber: '',
      machineType: '',
      machine: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [
        { id: defaultSecId, name: 'General Process Parameters', scope: 'Both', order: 1 }
      ],
      parameters: [
        {
          id: 'pm_' + Date.now(),
          sectionId: defaultSecId,
          name: 'Pressure Parameter',
          scope: 'Both',
          inputType: 'number',
          specificationType: 'range',
          minValue: 10,
          maxValue: 20,
          unit: 'bar',
          required: true,
          order: 1
        }
      ]
    };
  }

  get existingConfigs(): MasterConfig[] {
    return this.masterConfigService.getMasterConfigs();
  }

  loadConfigPreset(id: number): void {
    const found = this.masterConfigService.getMasterConfigById(id);
    if (found) {
      this.config = structuredClone(found);
      this.selectedPresetId = id;
    }
  }

  newConfig(): void {
    this.config = this.createEmptyConfig();
    this.selectedPresetId = null;
  }

  addSection(): void {
    const secId = 'sec_' + Date.now();
    this.config.sections.push({
      id: secId,
      name: `New Section ${this.config.sections.length + 1}`,
      scope: 'Both',
      order: this.config.sections.length + 1
    });
  }

  removeSection(index: number): void {
    const sec = this.config.sections[index];
    if (!sec) return;
    this.config.sections.splice(index, 1);
    // Remove associated parameters
    this.config.parameters = this.config.parameters.filter(p => p.sectionId !== sec.id);
  }

  addParameter(sectionId?: string): void {
    const targetSectionId = sectionId || (this.config.sections[0]?.id ?? 'sec_default');
    this.config.parameters.push({
      id: 'pm_' + Date.now() + Math.floor(Math.random() * 100),
      sectionId: targetSectionId,
      name: 'New Parameter',
      scope: 'Both',
      inputType: 'number',
      specificationType: 'range',
      minValue: 0,
      maxValue: 100,
      unit: 'mm',
      required: true,
      order: this.config.parameters.length + 1
    });
  }

  removeParameter(index: number): void {
    this.config.parameters.splice(index, 1);
  }

  getParametersForSection(sectionId: string): MasterConfigParameter[] {
    return this.config.parameters.filter(p => p.sectionId === sectionId);
  }

  updateDropdownOptions(param: MasterConfigParameter, rawOptions: string): void {
    if (!rawOptions) {
      param.dropdownOptions = [];
      return;
    }
    param.dropdownOptions = rawOptions.split(',').map(s => s.trim()).filter(Boolean);
  }

  handleImageUpload(event: Event, param: MasterConfigParameter): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      param.referenceImage = String(reader.result);
    };
    reader.readAsDataURL(file);
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

  /**
   * CREATE TEMPLATE FROM MASTER CONFIGURATION
   * Generates the digital inspection sheet FROM Master Config!
   */
  createTemplate(): void {
    // 1. Ensure master config is saved first
    const savedConfig = this.masterConfigService.saveMasterConfig(this.config);

    // 2. Generate digital Template matching reference PDF structure
    const generatedTemplate = this.masterConfigService.generateTemplateFromMaster(savedConfig);

    // 3. Save template into TemplateService so publish flow & inspection flow work immediately!
    this.templateService.publish(
      generatedTemplate.name,
      generatedTemplate.items,
      generatedTemplate.id,
      generatedTemplate.checklistType,
      generatedTemplate.generalDetailsRows,
      generatedTemplate.tables
    );

    alert(`Template "${generatedTemplate.name}" successfully generated from Master Configuration!`);

    // 4. Navigate to open published template for operator data entry & validation!
    this.router.navigate(['/published-template', generatedTemplate.id]);
  }
}
