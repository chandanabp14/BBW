export type CellOwner = 'admin' | 'inspector';

export type CellInputType =
  | 'none'
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'date'
  | 'image';

export interface TableCell {
  value: string;

  rowspan: number;
  colspan: number;

  hidden: boolean;
  selected: boolean;

  inputMode: CellOwner;

  inputType: CellInputType;

  required: boolean;

  width: number;
  height: number;

  // Height used when the cell has no overflowing text
  baseHeight?: number;

  // Whether the height is being controlled automatically
  autoHeight?: boolean;
}

export interface TableRow {
  cells: TableCell[];
}

export interface DynamicTable {
  id: number;
  title: string;
  rows: TableRow[];
}