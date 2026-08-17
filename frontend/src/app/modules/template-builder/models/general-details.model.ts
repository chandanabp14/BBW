export interface GeneralDetail {
  id: number;
  label: string;
  value: string;
  inputType: 'text' | 'date' | 'number';
}

export interface GeneralDetailsRow {
  id: number;
  fields: GeneralDetail[];
}