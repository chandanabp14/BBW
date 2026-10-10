import {
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableService } from '../../services/table.service';
import { TemplateService } from '../../services/template.service';
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
export class CanvasComponent implements OnInit {

  @Output() cellSelected =
    new EventEmitter<{
      top: number;
      cell: TableCell | null;
    }>();


  // =====================================================
  // MODAL / SAVE STATE
  // =====================================================

  showPublishModal = false;
  showDraftModal = false;
  modalTemplateName = '';
  isSaving = false;


  // =====================================================
  // DUPLICATE NAME LOCK
  // =====================================================

  isDuplicateMode = false;
  duplicateOriginalName = '';


  constructor(
    public tableService: TableService,
    public templateService: TemplateService,
    public router: Router
  ) {}


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {

    this.isDuplicateMode =
      sessionStorage.getItem(
        'duplicateChecklistMode'
      ) === 'true';

    this.duplicateOriginalName =
      sessionStorage.getItem(
        'duplicateOriginalName'
      ) || '';

  }


  // =====================================================
  // DUPLICATE EDIT LOCK
  // =====================================================

  get isDuplicateLocked(): boolean {

    // Normal checklist/draft should never be locked.
    if (!this.isDuplicateMode) {
      return false;
    }

    const currentName =
      this.tableService.templateName
        .trim()
        .toLowerCase();

    const originalName =
      this.duplicateOriginalName
        .trim()
        .toLowerCase();

    // Empty name is not allowed for a duplicate.
    if (!currentName) {
      return true;
    }

    // Keep locked while the automatically generated
    // duplicate name has not been changed.
    return currentName === originalName;
  }


  selectedCell: TableCell | null = null;


  // =====================================================
  // CREATE TABLE
  // =====================================================

  addTable(): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService.createTable();
  }


  // =====================================================
  // CREATE TEXTBOX
  // =====================================================

  addTextbox(): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService.addTextbox();
  }


  // =====================================================
  // TABLE OPERATIONS
  // =====================================================

  addRow(tableId: number): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService.addRow(tableId);
  }


  addColumn(tableId: number): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService.addColumn(tableId);
  }


  deleteRow(tableId: number): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService.deleteRow(tableId);
  }


  deleteColumn(tableId: number): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

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
  ): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    const item =
      this.tableService.builderItems.find(
        item =>
          item.type === 'table' &&
          item.table?.id === tableId
      );

    if (!item || !item.table) {
      return;
    }

    const cell =
      item.table.rows[row]?.cells[col];

    if (!cell) {
      return;
    }


    // CLICK SAME CELL AGAIN → DESELECT

    if (this.selectedCell === cell) {

      for (
        const item of
        this.tableService.builderItems
      ) {

        if (
          item.type === 'table' &&
          item.table
        ) {

          for (const row of item.table.rows) {

            for (
              const cell of
              row.cells as TableCell[]
            ) {

              cell.selected = false;

            }

          }

        }

      }


      this.selectedCell = null;


      this.cellSelected.emit({
        top: 20,
        cell: null
      });


      this.clearSelection();

      return;
    }


    // SELECT CELL

    this.clearCellHighlights();

    this.selectedCell = cell;


    if (event?.currentTarget) {

      const cellElement =
        event.currentTarget as HTMLElement;

      const rect =
        cellElement.getBoundingClientRect();

      this.cellSelected.emit({
        top: rect.top,
        cell: cell
      });

    }


    // FIRST CLICK

    if (this.selectionStartRow === -1) {

      this.selectionStartRow = row;
      this.selectionStartCol = col;

      this.tableService.selectCell(
        tableId,
        row,
        col
      );

      return;

    }


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


  // =====================================================
  // AUTO RESIZE CELL
  // =====================================================

  autoResizeCell(
    event: Event,
    cell: TableCell
  ): void {

    if (this.isDuplicateLocked) {
      return;
    }

    const textarea =
      event.target as HTMLTextAreaElement;

    const minimumHeight = 30;


    if (cell.baseHeight === undefined) {

      cell.baseHeight = Math.max(
        minimumHeight,
        cell.height
      );

    }


    textarea.style.height = 'auto';


    const contentHeight =
      textarea.scrollHeight + 12;


    const newHeight = Math.max(
      minimumHeight,
      cell.baseHeight,
      contentHeight
    );


    cell.height = newHeight;


    textarea.style.height =
      `${newHeight - 12}px`;

  }


  // =====================================================
  // IMAGE UPLOAD
  // =====================================================

  onImageUpload(
    event: Event,
    cell: TableCell
  ): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;
    }


    const file = input.files[0];


    if (!file.type.startsWith('image/')) {

      alert(
        'Please select an image file.'
      );

      return;
    }


    const reader = new FileReader();


    reader.onload = () => {

      cell.value =
        reader.result as string;

    };


    reader.readAsDataURL(file);

  }


  // =====================================================
  // MERGE
  // =====================================================

  mergeSelected(
    tableId: number
  ): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService
      .mergeSelected(tableId);

    this.clearSelection();

  }


  clearCellHighlights(): void {

    this.tableService
      .builderItems
      .forEach(item => {

        if (
          item.type === 'table' &&
          item.table
        ) {

          for (
            const row of item.table.rows
          ) {

            for (
              const cell of
              row.cells as TableCell[]
            ) {

              cell.selected = false;

            }

          }

        }

      });

  }


  clearSelection(): void {

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

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

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

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService.unmerge(
      tableId,
      row,
      column
    );

  }


  // =====================================================
  // DELETE ITEM
  // =====================================================

  deleteItem(
    itemId: number
  ): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService
      .deleteItem(itemId);

  }


  // =====================================================
  // MOVE ITEM UP
  // =====================================================

  moveUp(
    itemId: number
  ): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService
      .moveItemUp(itemId);

  }


  // =====================================================
  // MOVE ITEM DOWN
  // =====================================================

  moveDown(
    itemId: number
  ): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService
      .moveItemDown(itemId);

  }


  // =====================================================
  // PREVIEW
  // =====================================================

  preview(): void {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    this.tableService.saveForPreview();

    window.open(
      '/preview',
      '_blank'
    );

  }


  // =====================================================
  // SAVE DRAFT
  // =====================================================

  async saveDraft(): Promise<void> {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    if (this.isSaving) {
      return;
    }


    this.isSaving = true;


    try {

      const templateName =
        this.tableService.templateName.trim()
        ||
        'Untitled Checklist';


      const template =
        await this.templateService.saveDraft(

          templateName,

          this.tableService.builderItems,

          this.tableService.currentTemplateId,

          this.tableService.checklistType,

          this.tableService.generalDetailsRows,

          this.tableService.tables

        );


      this.tableService.currentTemplateId =
        template.id;


      this.tableService.saveForPreview();


      this.modalTemplateName =
        template.name;


      // Duplicate has now been successfully renamed/saved.
      if (this.isDuplicateMode) {

        this.isDuplicateMode = false;
        this.duplicateOriginalName = '';

        sessionStorage.removeItem(
          'duplicateChecklistMode'
        );

        sessionStorage.removeItem(
          'duplicateOriginalName'
        );

      }


      this.showDraftModal = true;


    } catch (error) {

      this.showSaveError(error);


    } finally {

      this.isSaving = false;

    }

  }


  // =====================================================
  // PUBLISH
  // =====================================================

  async publish(): Promise<void> {

    if (this.isDuplicateLocked) {
      this.showDuplicateNameWarning();
      return;
    }

    if (this.isSaving) {
      return;
    }


    this.isSaving = true;


    try {

      const templateName =
        this.tableService.templateName.trim()
        ||
        'Untitled Checklist';


      const template =
        await this.templateService.publish(

          templateName,

          this.tableService.builderItems,

          this.tableService.currentTemplateId,

          this.tableService.checklistType,

          this.tableService.generalDetailsRows,

          this.tableService.tables

        );


      this.tableService.currentTemplateId =
        template.id;


      this.tableService.saveForPreview();


      this.modalTemplateName =
        template.name;


      // Duplicate has now been renamed/published.
      if (this.isDuplicateMode) {

        this.isDuplicateMode = false;
        this.duplicateOriginalName = '';

        sessionStorage.removeItem(
          'duplicateChecklistMode'
        );

        sessionStorage.removeItem(
          'duplicateOriginalName'
        );

      }


      this.showPublishModal = true;


    } catch (error) {

      this.showSaveError(error);


    } finally {

      this.isSaving = false;

    }

  }


  // =====================================================
  // DUPLICATE NAME WARNING
  // =====================================================

  private showDuplicateNameWarning(): void {

    alert(
      'This is a duplicated checklist. Please change the Template Name before editing the checklist.'
    );

  }


  // =====================================================
  // SAVE ERROR
  // =====================================================

  private showSaveError(
    error: unknown
  ): void {

    console.error(
      'Unable to save checklist.',
      error
    );


    const message =
      (
        error as {
          error?: {
            message?: string
          }
        }
      )?.error?.message
      ||
      'Unable to save the checklist. Confirm that the backend is running and try again.';


    alert(message);

  }


  // =====================================================
  // CLOSE MODAL
  // =====================================================

  closeModal(): void {

    this.showPublishModal = false;
    this.showDraftModal = false;

  }


  // =====================================================
  // NAVIGATE TO CHECKLISTS
  // =====================================================

  navigateToChecklists(): void {

    this.closeModal();

    this.router.navigate(['/']);

  }

}