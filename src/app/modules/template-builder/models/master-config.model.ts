export type ScopeType = 'Setup' | 'Inspection' | 'Both';

export type MasterMcType = 'PDC' | 'Press' | 'Assembly' | 'Machining' | 'General';

export type MasterInputType = 'number' | 'text' | 'dropdown' | 'yes_no' | 'checkbox' | 'visual' | 'measurement';

export type MasterSpecType = 'range' | 'exact' | 'min' | 'max' | 'selection' | 'checklist' | 'none';

export interface MasterConfigSection {
  id: string;
  name: string;
  scope: ScopeType;
  order: number;
}

export interface MasterConfigGroup {
  id: string;
  sectionId: string;
  name: string;
  order: number;
}

export interface MasterConfigParameter {
  id: string;
  sectionId: string;
  groupId?: string;
  name: string;
  parameterCode?: string;
  scope: ScopeType;
  inputType: MasterInputType;
  specificationType: MasterSpecType;
  reqSpec?: string;
  minValue?: number;
  maxValue?: number;
  expectedValue?: string;
  unit?: string;
  checkingMethod?: string;
  dropdownOptions?: string[];
  referenceImage?: string;
  referenceInfo?: string;
  required: boolean;
  remarksRequired?: boolean;
  order: number;
}

export interface ReportLayoutConfig {
  reportTitle?: string;
  companyName?: string;
  companySubtitle?: string;
  showGroupHeaders?: boolean;
  showPhotoRow?: boolean;
  showMethodRow?: boolean;
  showReqSpecRow?: boolean;
  requiredReadingsCount?: number;
  showStartupIssues?: boolean;
  showCutSection?: boolean;
  showApprovalBlock?: boolean;
}

export interface MasterConfig {
  id: number;
  name: string;
  reportTitle?: string;
  companyName?: string;
  companySubtitle?: string;
  configType: ScopeType;
  mcType: MasterMcType;
  documentCode?: string;
  partName: string;
  partType: string;
  partNumber: string;
  machineType: string;
  machine: string;
  sections: MasterConfigSection[];
  groups: MasterConfigGroup[];
  parameters: MasterConfigParameter[];
  layoutConfig?: ReportLayoutConfig;
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
  sampleCode: 'A' | 'B' | 'C' | 'Single' | string;
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
