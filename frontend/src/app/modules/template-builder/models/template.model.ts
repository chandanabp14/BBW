export type ComponentType =
  | 'textbox'
  | 'heading'
  | 'date'
  | 'table';

export interface TableCell {

  id:number;

  row:number;

  column:number;

  value:string;

  rowSpan:number;

  colSpan:number;

  hidden:boolean;

  component?:ComponentType;

}

export interface TableComponent{

  id:number;

  type:'table';

  rows:number;

  columns:number;

  cells:TableCell[][];

}

export interface ChecklistComponent{

  id:number;

  type:ComponentType;

  label?:string;

  placeholder?:string;

}

import { BuilderItem } from './builder-item.model';
import { GeneralDetailsRow } from './general-details.model';
import { DynamicTable } from './table.model';

export type TemplateStatus = 'draft' | 'published';

export interface Template {
  id: number;
  name: string;
  checklistType?: string;
  generalDetailsRows?: GeneralDetailsRow[];
  tables?: DynamicTable[];
  status: TemplateStatus;
  items: BuilderItem[];
  createdAt: string;
  updatedAt: string;
  inspectionSubmittedAt?: string;
}
