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
  // ADD HEADING
  // =====================================================

  addHeading(): void {

    this.builderItems.push({

      id: this.generateId(),

      type: 'heading',

      text: 'Section Heading'

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


    if (!cell) {
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
      Math.min(
        startRow,
        endRow
      );

    const maxRow =
      Math.max(
        startRow,
        endRow
      );

    const minColumn =
      Math.min(
        startColumn,
        endColumn
      );

    const maxColumn =
      Math.max(
        startColumn,
        endColumn
      );


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


        if (cell) {

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


    // ---------------------------------------------
    // FIND SELECTED CELLS
    // ---------------------------------------------

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

            cell: cell

          });

        }

      }

    }


    // Need at least 2 cells

    if (selected.length < 2) {

      alert(
        'Select two or more adjacent cells to merge.'
      );

      return;

    }


    // ---------------------------------------------
    // FIND RECTANGLE
    // ---------------------------------------------

    const minRow =
      Math.min(
        ...selected.map(
          x => x.row
        )
      );

    const maxRow =
      Math.max(
        ...selected.map(
          x => x.row
        )
      );

    const minColumn =
      Math.min(
        ...selected.map(
          x => x.column
        )
      );

    const maxColumn =
      Math.max(
        ...selected.map(
          x => x.column
        )
      );


    const requiredCellCount =
      (maxRow - minRow + 1) *
      (maxColumn - minColumn + 1);


    // ---------------------------------------------
    // MUST BE A COMPLETE RECTANGLE
    // ---------------------------------------------

    if (
      selected.length !==
      requiredCellCount
    ) {

      alert(
        'Please select a complete rectangular area.'
      );

      return;

    }


    // ---------------------------------------------
    // DO NOT MERGE ALREADY MERGED CELLS
    // ---------------------------------------------

    for (const item of selected) {

      if (
        item.cell.rowspan !== 1 ||
        item.cell.colspan !== 1
      ) {

        alert(
          'Select only normal cells when creating a new merge.'
        );

        return;

      }

    }


    // ---------------------------------------------
    // TOP-LEFT CELL
    // ---------------------------------------------

    const mainCell =
      table.rows[minRow]
        .cells[minColumn];


    // ---------------------------------------------
    // COMBINE TEXT
    // ---------------------------------------------

    const values =
      selected
        .map(x => x.cell.value)
        .filter(
          value =>
            value &&
            value.trim() !== ''
        );


    mainCell.value =
      values.join(' ');


    // ---------------------------------------------
    // ROWSPAN
    // ---------------------------------------------

    mainCell.rowspan =
      maxRow - minRow + 1;


    // ---------------------------------------------
    // COLSPAN
    // ---------------------------------------------

    mainCell.colspan =
      maxColumn - minColumn + 1;


    // ---------------------------------------------
    // HIDE OTHER CELLS
    // ---------------------------------------------

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

        if (
          r === minRow &&
          c === minColumn
        ) {

          continue;

        }


        const cell =
          table.rows[r]
            .cells[c];


        cell.hidden = true;

        cell.selected = false;

      }

    }


    mainCell.selected = false;

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

    const table = this.getTable(tableId);

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
      mainCell.rowspan;


    const colspan =
      mainCell.colspan;


    // Nothing to split

    if (
      rowspan === 1 &&
      colspan === 1
    ) {

      return;

    }


    // ---------------------------------------------
    // RESTORE CELLS
    // ---------------------------------------------

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


        if (
          r === row &&
          c === column
        ) {

          continue;

        }


        cell.hidden = false;

        cell.rowspan = 1;

        cell.colspan = 1;

        cell.selected = false;

        cell.value = '';

        cell.inputMode =
          mainCell.inputMode;

        cell.inputType =
          mainCell.inputType;

        cell.required =
          mainCell.required;

      }

    }


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