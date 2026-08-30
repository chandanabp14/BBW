import { Injectable } from '@angular/core';

import {
  DynamicTable,
  TableRow,
  TableCell
} from '../models/table.model';

import { BuilderItem } from '../models/builder-item.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  // =====================================================
  // DATA
  // =====================================================

  public tables: DynamicTable[] = [];

  public builderItems: BuilderItem[] = [];

  private idCounter = 1;


  // =====================================================
  // ID
  // =====================================================

  private generateId(): number {
    return Date.now() + this.idCounter++;
  }


  // =====================================================
  // ADD TEXTBOX
  // =====================================================

  addTextbox(): void {
    this.builderItems.push({
        id: Date.now(),
        type: 'textbox',
        label: 'Text / Instruction',
        text: ''
    });
  }


  // =====================================================
  // ADD DATE
  // =====================================================

  addDate(): void {

    this.builderItems.push({

      id: this.generateId(),

      type: 'date',

      text: '',

      label: 'Date'

    });

  }


  // =====================================================
  // CREATE TABLE
  // =====================================================

  createTable(): void {

    const tableId = this.generateId();

    const rows: TableRow[] = [];

    // ---------------------------------------------
    // DEFAULT 3 x 3 TABLE
    // ---------------------------------------------

    for (let r = 0; r < 3; r++) {

      const cells: TableCell[] = [];

      for (let c = 0; c < 3; c++) {

        cells.push({

          value:
            r === 0
              ? `Header ${c + 1}`
              : '',

          rowspan: 1,

          colspan: 1,

          hidden: false,

          selected: false,

          inputMode:
            r === 0
              ? 'admin'
              : 'inspector',

          inputType:
            r === 0
              ? 'text'
              : 'text',

          required: false,

          width: 120,
          
          height: 60

        });

      }

      rows.push({

        cells

      });

    }


    const table: DynamicTable = {

      id: tableId,

      title: 'Inspection Table',

      rows

    };


    this.tables.push(table);


    this.builderItems.push({

      id: tableId,

      type: 'table',

      table: table

    });

  }


  // =====================================================
  // FIND TABLE
  // =====================================================

  private getTable(
    tableId: number
  ): DynamicTable | undefined {

    return this.tables.find(
      table => table.id === tableId
    );

  }


  // =====================================================
  // ADD ROW
  // =====================================================

  addRow(tableId: number): void {

    const table = this.getTable(tableId);

    if (!table) {
      return;
    }

    const columnCount =
      table.rows.length > 0
        ? table.rows[0].cells.length
        : 1;


    const cells: TableCell[] = [];

    for (let c = 0; c < columnCount; c++) {

      cells.push({

        value: '',

        rowspan: 1,

        colspan: 1,

        hidden: false,

        selected: false,

        inputMode: 'inspector',

        inputType: 'text',

        required: false,

        width: 120,

        height: 60

      });

    }


    table.rows.push({

      cells

    });

  }


  // =====================================================
  // ADD COLUMN
  // =====================================================

  addColumn(tableId: number): void {

    const table = this.getTable(tableId);

    if (!table) {
      return;
    }


    for (
      let r = 0;
      r < table.rows.length;
      r++
    ) {

      table.rows[r].cells.push({

        value:
          r === 0
            ? `Header ${table.rows[r].cells.length + 1}`
            : '',

        rowspan: 1,

        colspan: 1,

        hidden: false,

        selected: false,

        inputMode:
          r === 0
            ? 'admin'
            : 'inspector',

        inputType: 'text',

        required: false,

        width: 120,
        
        height: 60

      });

    }

  }
  
  updateCellSize(
  tableId: number,
  row: number,
  column: number,
  width: number,
  height: number
): void {

  const item = this.builderItems.find(
    item => item.type === 'table' && item.table?.id === tableId
  );

  if (!item?.table) {
    return;
  }

  const cell = item.table.rows[row]?.cells[column];

  if (!cell) {
    return;
  }

  cell.width = Math.max(30, width);
  cell.height = Math.max(25, height);
}

  // =====================================================
  // DELETE ROW
  // =====================================================

  deleteRow(tableId: number): void {

    const table = this.getTable(tableId);

    if (!table) {
      return;
    }

    if (table.rows.length <= 1) {
      return;
    }

    table.rows.pop();

  }


  // =====================================================
  // DELETE COLUMN
  // =====================================================

  deleteColumn(tableId: number): void {

    const table = this.getTable(tableId);

    if (!table) {
      return;
    }


    if (
      table.rows.length === 0 ||
      table.rows[0].cells.length <= 1
    ) {
      return;
    }


    for (const row of table.rows) {

      row.cells.pop();

    }

  }


  // =====================================================
  // SELECT SINGLE CELL
  // =====================================================

  selectCell(
    tableId: number,
    row: number,
    column: number
  ): void {

    const table = this.getTable(tableId);

    if (!table) {
      return;
    }

    this.clearSelectionForTable(table);

    const cell =
      table.rows[row]?.cells[column];

    if (!cell || cell.hidden) {
      return;
    }

    cell.selected = true;

  }

  // =====================================================
  // SELECT RANGE
  // =====================================================

  selectRange(
    tableId: number,

    startRow: number,
    startColumn: number,

    endRow: number,
    endColumn: number
  ): void {

    const table = this.getTable(tableId);

    if (!table) {
      return;
    }

    this.clearSelectionForTable(table);

    const minRow =
      Math.min(startRow, endRow);

    const maxRow =
      Math.max(startRow, endRow);

    const minColumn =
      Math.min(startColumn, endColumn);

    const maxColumn =
      Math.max(startColumn, endColumn);

    for (
      let r = minRow;
      r <= maxRow;
      r++
    ) {

      for (
        let c = minColumn;
        c <= maxColumn;
        c++
      ) {

        const cell =
          table.rows[r]?.cells[c];

        if (
          cell &&
          !cell.hidden
        ) {

          cell.selected = true;

        }

      }

    }

  }

  // =====================================================
  // CLEAR SELECTION
  // =====================================================

  clearSelection(): void {

    for (const table of this.tables) {

      this.clearSelectionForTable(table);

    }

  }


  private clearSelectionForTable(
    table: DynamicTable
  ): void {

    for (const row of table.rows) {

      for (const cell of row.cells) {

        cell.selected = false;

      }

    }

  }


  // =====================================================
  // MERGE SELECTED CELLS
  // =====================================================

  mergeSelected(
    tableId: number
  ): void {

    const table = this.getTable(tableId);

    if (!table) {
      return;
    }

    const selected: {
      row: number;
      column: number;
      cell: TableCell;
    }[] = [];

    // =====================================================
    // FIND ALL SELECTED CELLS
    // =====================================================

    for (
      let r = 0;
      r < table.rows.length;
      r++
    ) {

      for (
        let c = 0;
        c < table.rows[r].cells.length;
        c++
      ) {

        const cell =
          table.rows[r].cells[c];

        if (
          cell.selected &&
          !cell.hidden
        ) {

          selected.push({
            row: r,
            column: c,
            cell
          });

        }

      }

    }

    // =====================================================
    // NEED AT LEAST TWO CELLS
    // =====================================================

    if (selected.length < 2) {

      alert(
        'Select two or more cells to merge.'
      );

      return;

    }

    // =====================================================
    // FIND RECTANGLE
    // =====================================================

    const minRow =
      Math.min(
        ...selected.map(
          item => item.row
        )
      );

    const maxRow =
      Math.max(
        ...selected.map(
          item => item.row
        )
      );

    const minColumn =
      Math.min(
        ...selected.map(
          item => item.column
        )
      );

    const maxColumn =
      Math.max(
        ...selected.map(
          item => item.column
        )
      );

    // =====================================================
    // VALIDATE COMPLETE RECTANGLE
    // =====================================================

    for (
      let r = minRow;
      r <= maxRow;
      r++
    ) {

      for (
        let c = minColumn;
        c <= maxColumn;
        c++
      ) {

        const cell =
          table.rows[r]?.cells[c];

        if (
          !cell ||
          cell.hidden ||
          !cell.selected
        ) {

          alert(
            'Please select one complete rectangular area.'
          );

          return;

        }

        if (
          cell.rowspan !== 1 ||
          cell.colspan !== 1
        ) {

          alert(
            'Split the existing merged cell first.'
          );

          return;

        }

      }

    }

    // =====================================================
    // TOP-LEFT CELL BECOMES MAIN CELL
    // =====================================================

    const mainCell =
      table.rows[minRow]
        .cells[minColumn];

    // =====================================================
    // COMBINE VALUES IN READING ORDER
    // =====================================================

    const values: string[] = [];

    for (
      let r = minRow;
      r <= maxRow;
      r++
    ) {

      for (
        let c = minColumn;
        c <= maxColumn;
        c++
      ) {

        const value =
          table.rows[r]
            .cells[c]
            .value;

        if (
          typeof value === 'string' &&
          value.trim() !== ''
        ) {

          values.push(
            value.trim()
          );

        }

      }

    }

    mainCell.value =
      values.join(' ');

    // =====================================================
    // SUPPORT VERTICAL + HORIZONTAL + RECTANGLE MERGE
    // =====================================================

    mainCell.rowspan =
      maxRow - minRow + 1;

    mainCell.colspan =
      maxColumn - minColumn + 1;

    // =====================================================
    // HIDE ALL COVERED CELLS EXCEPT MAIN CELL
    // =====================================================

    for (
      let r = minRow;
      r <= maxRow;
      r++
    ) {

      for (
        let c = minColumn;
        c <= maxColumn;
        c++
      ) {

        const cell =
          table.rows[r].cells[c];

        if (
          r === minRow &&
          c === minColumn
        ) {

          cell.hidden = false;
          cell.selected = false;

          continue;

        }

        cell.hidden = true;
        cell.selected = false;

      }

    }

  }

  // =====================================================
  // MERGE RIGHT
  // =====================================================

  mergeRight(
    tableId: number,
    row: number,
    column: number
  ): void {

    const table = this.getTable(tableId);

    if (!table) {
      return;
    }


    const currentRow =
      table.rows[row];


    if (!currentRow) {
      return;
    }


    const firstCell =
      currentRow.cells[column];


    const secondCell =
      currentRow.cells[column + 1];


    if (
      !firstCell ||
      !secondCell
    ) {

      return;

    }


    if (
      firstCell.hidden ||
      secondCell.hidden
    ) {

      return;

    }


    if (
      firstCell.rowspan !== 1 ||
      secondCell.rowspan !== 1
    ) {

      return;

    }


    // Combine values

    if (secondCell.value) {

      firstCell.value =
        firstCell.value
          ? `${firstCell.value} ${secondCell.value}`
          : secondCell.value;

    }


    firstCell.colspan +=
      secondCell.colspan;


    secondCell.hidden = true;


    firstCell.selected = false;

  }


  // =====================================================
  // UNMERGE
  // =====================================================

  unmerge(
    tableId: number,
    row: number,
    column: number
  ): void {

    const table =
      this.getTable(tableId);

    if (!table) {
      return;
    }

    const mainCell =
      table.rows[row]
        ?.cells[column];

    if (!mainCell) {
      return;
    }

    const rowspan =
      mainCell.rowspan || 1;

    const colspan =
      mainCell.colspan || 1;

    // Nothing to split
    if (
      rowspan === 1 &&
      colspan === 1
    ) {

      return;

    }

    // =====================================================
    // RESTORE ALL CELLS COVERED BY MERGE
    // =====================================================

    for (
      let r = row;
      r < row + rowspan;
      r++
    ) {

      for (
        let c = column;
        c < column + colspan;
        c++
      ) {

        const cell =
          table.rows[r]
            ?.cells[c];

        if (!cell) {
          continue;
        }

        cell.hidden = false;
        cell.selected = false;

        if (
          r === row &&
          c === column
        ) {

          continue;

        }

        cell.rowspan = 1;
        cell.colspan = 1;

      }

    }

    // =====================================================
    // RESET MAIN CELL
    // =====================================================

    mainCell.rowspan = 1;
    mainCell.colspan = 1;
    mainCell.selected = false;

  }

  // =====================================================
  // DELETE BUILDER ITEM
  // =====================================================

  deleteItem(
    itemId: number
  ): void {

    const index =
      this.builderItems.findIndex(
        item => item.id === itemId
      );


    if (index === -1) {
      return;
    }


    const item =
      this.builderItems[index];


    // Remove table from tables[]

    if (
      item.type === 'table' &&
      item.table
    ) {

      const tableIndex =
        this.tables.findIndex(
          table =>
            table.id === item.table!.id
        );


      if (tableIndex !== -1) {

        this.tables.splice(
          tableIndex,
          1
        );

      }

    }


    this.builderItems.splice(
      index,
      1
    );

  }


  // =====================================================
  // MOVE ITEM UP
  // =====================================================

  moveItemUp(
    itemId: number
  ): void {

    const index =
      this.builderItems.findIndex(
        item => item.id === itemId
      );


    if (
      index <= 0
    ) {

      return;

    }


    const item =
      this.builderItems[index];


    this.builderItems.splice(
      index,
      1
    );


    this.builderItems.splice(
      index - 1,
      0,
      item
    );

  }


  // =====================================================
  // MOVE ITEM DOWN
  // =====================================================

  moveItemDown(
    itemId: number
  ): void {

    const index =
      this.builderItems.findIndex(
        item => item.id === itemId
      );


    if (
      index === -1 ||
      index >=
        this.builderItems.length - 1
    ) {

      return;

    }


    const item =
      this.builderItems[index];


    this.builderItems.splice(
      index,
      1
    );


    this.builderItems.splice(
      index + 1,
      0,
      item
    );

  }

}