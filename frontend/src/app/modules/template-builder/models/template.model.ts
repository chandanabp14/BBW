export type ComponentType =
  | 'textbox'
  | 'heading'
  | 'checkbox'
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