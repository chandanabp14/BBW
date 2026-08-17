import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableService } from '../../services/table.service';
import { BuilderItem } from '../../models/builder-item.model';
import { GeneralDetailsComponent } from '../general-details/general-details';
import { TableCell } from '../../models/table.model';

@Component({

  selector: 'app-canvas',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    GeneralDetailsComponent
  ],

  templateUrl: './canvas.html',
   
  styleUrls: ['./canvas.css']

})
export class CanvasComponent {

  @Output() cellSelected =
  new EventEmitter<{
    top: number;
    cell: TableCell | null;
  }>();

  constructor(

    public tableService: TableService

  ) {}

  selectedCell: TableCell | null = null;
  // =====================================================
  // CREATE TABLE
  // =====================================================

  addTable(): void {

    this.tableService.createTable();

  }


  // =====================================================
  // CREATE TEXTBOX
  // =====================================================

  addTextbox(): void {

    this.tableService.addTextbox();

  }


  // =====================================================
  // TABLE OPERATIONS
  // =====================================================

  addRow(tableId: number): void {

    this.tableService.addRow(tableId);

  }


  addColumn(tableId: number): void {

    this.tableService.addColumn(tableId);

  }


  deleteRow(tableId: number): void {

    this.tableService.deleteRow(tableId);

  }


  deleteColumn(tableId: number): void {

    this.tableService.deleteColumn(tableId);

  }


  // =====================================================
  // CELL SELECTION
  // =====================================================
selectionStartRow = -1;
selectionStartCol = -1;

selectionEndRow = -1;
selectionEndCol = -1;

selectCell(
  tableId: number,
  row: number,
  col: number,
  event?: MouseEvent
) {

  const item = this.tableService.builderItems.find(
    item => item.type === 'table' && item.table?.id === tableId
  );

  if (!item || !item.table) {
    return;
  }

  const cell = item.table.rows[row]?.cells[col];

  if (!cell) {
    return;
  }

  // CLICK SAME CELL AGAIN → DESELECT
  if (this.selectedCell === cell) {

    // Remove highlight from all cells
    for (const item of this.tableService.builderItems) {

      if (item.type === 'table' && item.table) {

        for (const row of item.table.rows) {
          for (const cell of row.cells as TableCell[]) {
            cell.selected = false;
          }
        }

      }
    }

    // Clear selected cell
    this.selectedCell = null;

    // Hide/clear property panel
    this.cellSelected.emit({
      top: 20,
      cell: null
    });

    // Clear range selection
    this.clearSelection();

    return;
  }

  // SELECT CELL
  this.clearCellHighlights();
  this.selectedCell = cell;

  if (event?.currentTarget) {
    const cellElement = event.currentTarget as HTMLElement;
    const rect = cellElement.getBoundingClientRect();

    this.cellSelected.emit({
      top: rect.top,
      cell: cell
    });
  }


  // First click
  if (this.selectionStartRow === -1) {

    this.selectionStartRow = row;
    this.selectionStartCol = col;

    this.tableService.selectCell(
      tableId,
      row,
      col
    );

    return;

  } else {

    this.selectionEndRow = row;
    this.selectionEndCol = col;

    this.tableService.selectRange(
      tableId,

      this.selectionStartRow,
      this.selectionStartCol,

      this.selectionEndRow,
      this.selectionEndCol
    );

  }
}

autoResizeCell(
  event: Event,
  cell: TableCell
): void {

  const textarea = event.target as HTMLTextAreaElement;

  /*
   * Minimum allowed cell height.
   */
  const minimumHeight = 30;

  /*
   * If no base height exists yet,
   * use the current cell height.
   */
  if (cell.baseHeight === undefined) {
    cell.baseHeight = Math.max(
      minimumHeight,
      cell.height
    );
  }

  /*
   * If the cell was manually resized through
   * the property panel, its baseHeight has already
   * been updated there.
   */

  /*
   * Reset textarea height so scrollHeight gives us
   * the actual height required by the current text.
   */
  textarea.style.height = 'auto';

  /*
   * Height required by the text.
   */
  const contentHeight = textarea.scrollHeight + 12;

  /*
   * Cell should never become smaller than:
   *
   * 1. 30px
   * 2. The manually selected base height
   * 3. The height required by the text
   */
  const newHeight = Math.max(
    minimumHeight,
    cell.baseHeight,
    contentHeight
  );

  /*
   * Update cell height.
   */
  cell.height = newHeight;

  /*
   * Make textarea fit inside the cell.
   */
  textarea.style.height = `${newHeight - 12}px`;
}

onImageUpload(
  event: Event,
  cell: TableCell
): void {

  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];

  // Only allow images
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {

    cell.value = reader.result as string;

  };

  reader.readAsDataURL(file);
}

  // =====================================================
  // MERGE
  // =====================================================



mergeSelected(tableId: number) {

  this.tableService.mergeSelected(tableId);

  this.clearSelection();

}
clearCellHighlights(): void {
  this.tableService.builderItems.forEach(item => {
    if (item.type === 'table' && item.table) {
      for (const row of item.table.rows) {
        for (const cell of row.cells as TableCell[]) {
          cell.selected = false;
        }
      }
    }
  });
}
clearSelection() {

  this.selectionStartRow = -1;
  this.selectionStartCol = -1;

  this.selectionEndRow = -1;
  this.selectionEndCol = -1;

}

mergeRight(
  tableId: number,
  row: number,
  col: number
): void {

  this.tableService.mergeRight(
    tableId,
    row,
    col
  );

}

  // =====================================================
  // UNMERGE
  // =====================================================

  unmerge(

    tableId: number,

    row: number,

    column: number

  ): void {

    this.tableService.unmerge(

      tableId,

      row,

      column

    );

  }


  // =====================================================
  // DELETE ITEM
  // =====================================================

  deleteItem(itemId: number): void {

    this.tableService.deleteItem(itemId);

  }


  // =====================================================
  // MOVE ITEM UP
  // =====================================================

  moveUp(itemId: number): void {

    this.tableService.moveItemUp(itemId);

  }


  // =====================================================
  // MOVE ITEM DOWN
  // =====================================================

  moveDown(itemId: number): void {

    this.tableService.moveItemDown(itemId);

  }

}