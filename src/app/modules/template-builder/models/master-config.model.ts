export type ScopeType = 'Setup' | 'Inspection' | 'Both';

export type MasterMcType = 'PDC' | 'Press' | 'Assembly' | 'Machining' | 'General';

export type MasterInputType = 'number' | 'text' | 'dropdown' | 'yes_no' | 'checkbox' | 'image';

export type MasterSpecType = 'range' | 'exact' | 'min' | 'max' | 'selection' | 'checklist' | 'none';

export interface MasterConfigSection {
  id: string;
  name: string;
  scope: ScopeType;
  order: number;
}

export interface MasterConfigParameter {
  id: string;
  sectionId: string;
  name: string;
  scope: ScopeType;
  inputType: MasterInputType;
  specificationType: MasterSpecType;
  minValue?: number;
  maxValue?: number;
  expectedValue?: string;
  unit?: string;
  checkingMethod?: string;
  dropdownOptions?: string[];
  referenceImage?: string;
  referenceInfo?: string;
  required: boolean;
  order: number;
}

export interface MasterConfig {
  id: number;
  name: string;
  configType: ScopeType;
  mcType: MasterMcType;
  documentCode?: string;
  partName: string;
  partType: string;
  partNumber: string;
  machineType: string;
  machine: string;
  sections: MasterConfigSection[];
  parameters: MasterConfigParameter[];
  createdAt: string;
  updatedAt: string;
  publishedTemplateId?: number;
}

export type ValidationStatus = 'PASS' | 'FAIL' | 'PENDING';

export interface ValidationResult {
  status: ValidationStatus;
  message: string;
  formattedSpec: string;
}

export interface InspectionSample {
  sampleCode: 'A' | 'B' | 'C' | 'Single';
  value: string;
  result: ValidationStatus;
}

export interface InspectionParamEntry {
  parameterId: string;
  parameterName: string;
  specificationText: string;
  unit?: string;
  checkingMethod?: string;
  actualValue: string;
  samples: InspectionSample[];
  result: ValidationStatus;
  validationMessage?: string;
  remark?: string;
}

export interface StartupIssue {
  sNo: number;
  description: string;
  rootCause: string;
  action: string;
  responsibility: string;
  targetDate: string;
  remarks: string;
}

export interface CutSectionEntry {
  time: string;
  model: string;
  gramWeight: string;
  result: ValidationStatus;
  checkedBy: string;
  approvedBy: string;
}

export interface InspectionApproval {
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  rejectionReason?: string;
  comments?: string;
}

export interface InspectionInstance {
  id: number;
  masterConfigId: number;
  templateId: number;
  templateName: string;
  documentCode: string;
  mcType: string;
  partName: string;
  partNumber: string;
  machine: string;
  operator: string;
  supervisor?: string;
  qcName?: string;
  date: string;
  shift: string;
  settingTime?: string;
  settingBy?: string;
  batchNo?: string;
  controlPlanNo?: string;
  inspectionType: ScopeType;
  parameterEntries: Record<string, InspectionParamEntry>;
  generalDetails: Record<string, string>;
  startupIssues: StartupIssue[];
  cutSectionEntries: CutSectionEntry[];
  approval: InspectionApproval;
  overallResult: ValidationStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}
