import { DynamicTable } from './table.model';

export interface BuilderItem {
  id: number;

  type: 'textbox' | 'heading' | 'date' | 'table' | 'checkbox';

  text?: string;
  
  label?: string;

  table?: any;
}