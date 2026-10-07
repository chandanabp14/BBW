export type ScopeType = 'Setup' | 'Inspection' | 'Both';

export type MasterMcType = 'PDC' | 'Press' | 'Assembly' | 'Machining' | 'General';

export type MasterInputType =
  | 'number'
  | 'text'
  | 'dropdown'
  | 'yes_no'
  | 'checkbox'
  | 'visual'
  | 'measurement';

export type MasterSpecType =
  | 'range'
  | 'exact'
  | 'min'
  | 'max'
  | 'selection'
  | 'checklist'
  | 'none';

export type ReferenceType =
  | 'Drawing'
  | 'Specification Sheet'
  | 'Work Instruction'
  | 'Customer Standard'
  | 'Control Plan'
  | 'Reference Parameter'
  | 'Other';

export type InspectionFrequencyType =
  | 'First Piece'
  | 'Start-up'
  | 'Hourly'
  | 'Every 2 Hours'
  | 'Every Batch'
  | 'Shift-wise'
  | 'Random'
  | 'Last Piece'
  | 'Final Inspection'
  | 'Other';

export type ConfigStatus =
  | 'Draft'
  | 'Saved'
  | 'Active'
  | 'Published'
  | 'Inactive'
  | 'Archived';

export interface MasterConfigSection {
  id: string;
  name: string;
  code?: string;
  description?: string;
  scope: ScopeType;
  order: number;
  active?: boolean;
}

export interface MasterConfigGroup {
  id: string;
  sectionId: string;
  name: string;
  code?: string;
  description?: string;
  order: number;
  active?: boolean;
}

export interface MasterConfigParameter {
  // 1. Basic Info
  id: string;
  sectionId: string;
  groupId?: string;
  name: string;
  parameterCode?: string;
  description?: string;
  scope: ScopeType;
  order: number;
  required: boolean;

  // 2. Input & Spec Type
  inputType: MasterInputType;
  specificationType: MasterSpecType;

  // 3. Specification & Tolerance
  nominalValue?: number;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  decimalPlaces?: number;
  expectedValue?: string;
  allowedValues?: string[];
  dropdownOptions?: string[];
  tolerance?: string;
  toleranceType?: 'symmetric' | 'asymmetric' | 'percentage' | 'none';

  // 4. Checking Instrument / Method
  checkingMethod?: string;
  instrumentId?: string;
  calibrationRequired?: boolean;
  calibrationFrequency?: string;
  calibrationCertNo?: string;

  // 5. Reference Info
  referenceType?: ReferenceType;
  referenceNumber?: string;
  referenceRevision?: string;
  referenceDescription?: string;
  workInstructionRef?: string;

  // 6. Reference Image
  referenceImage?: string;
  imageDescription?: string;
  imageRef?: string;

  // 7. Acceptance Criteria
  acceptanceCriteria?: string;
  passCondition?: string;
  failCondition?: string;
  deviationAllowed?: boolean;
  deviationLimit?: string;
  remarksRequiredOnFailure?: boolean;

  // 8. Parameter Instructions
  inspectionInstructions?: string;
  operatorInstructions?: string;
  specialPrecautions?: string;
  safetyInstructions?: string;
  remarks?: string;

  // 9. Inspection Frequency
  frequency?: InspectionFrequencyType;
  readingsCount?: number;
  frequencyDescription?: string;

  reqSpec?: string;
}

export interface ApprovalConfigRole {
  roleName: 'Prepared By' | 'Checked By' | 'Approved By';
  personName?: string;
  employeeId?: string;
  signatureRequired?: boolean;
  dateRequired?: boolean;
  mandatory?: boolean;
}

export interface ReportLayoutConfig {
  reportTitle?: string;
  companyName?: string;
  companySubtitle?: string;
  companyLogo?: string;
  documentRef?: string;
  revision?: string;
  effectiveDate?: string;
  
  showGroupHeaders?: boolean;
  showPhotoRow?: boolean;
  showMethodRow?: boolean;
  showReqSpecRow?: boolean;
  requiredReadingsCount?: number;
  readingFrequency?: string;
  readingColumns?: number;

  showStartupIssues?: boolean;
  showRemarks?: boolean;
  showCutSection?: boolean;
  showRefImage?: boolean;
  showDeviationDetails?: boolean;
  showCorrectiveAction?: boolean;
  showApprovalBlock?: boolean;
}

export interface MasterConfig {
  id: number;
  name: string;
  status?: ConfigStatus;

  // Section 1: Document & Company Details
  reportTitle?: string;
  companyName?: string;
  companySubtitle?: string;
  companyLogo?: string;
  configType: ScopeType;
  mcType: MasterMcType;
  documentCode?: string;
  revision?: string;
  effectiveDate?: string;

  partName: string;
  partType?: string;
  partNumber: string;
  machineType?: string;
  machine: string;

  // Hierarchical Data
  sections: MasterConfigSection[];
  groups: MasterConfigGroup[];
  parameters: MasterConfigParameter[];

  // Report & Approval Configurations
  layoutConfig?: ReportLayoutConfig;
  approvalConfig?: {
    preparedBy?: ApprovalConfigRole;
    checkedBy?: ApprovalConfigRole;
    approvedBy?: ApprovalConfigRole;
  };

  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
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
  sectionId?: string;
  groupId?: string;
  parameterName: string;
  parameterCode?: string;
  description?: string;
  scope?: ScopeType;
  specificationText: string;
  unit?: string;
  checkingMethod?: string;
  checkingInstrument?: string;
  instrumentId?: string;
  calibrationFrequency?: string;
  calibrationCertNo?: string;
  referenceType?: ReferenceType;
  referenceNumber?: string;
  referenceRevision?: string;
  workInstructionRef?: string;
  referenceImage?: string;
  imageDescription?: string;
  acceptanceCriteria?: string;
  passCondition?: string;
  failCondition?: string;
  operatorInstructions?: string;
  safetyInstructions?: string;
  specialPrecautions?: string;
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
