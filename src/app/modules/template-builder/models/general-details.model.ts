export interface GeneralDetail {
  id: number;
  label: string;
  value: string;
  inputType: 'text' | 'date' | 'number';
  inputMode?: 'admin' | 'inspector';
}

export interface GeneralDetailsRow {
  id: number;
  fields: GeneralDetail[];
}
