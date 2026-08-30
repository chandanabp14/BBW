import {
  AfterViewInit,
  Component,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableService } from '../../services/table.service';
import { GeneralDetailsComponent } from '../general-details/general-details';
import { TableCell } from '../../models/table.model';

import {
  GeneralDetailsRow
} from '../../models/general-details.model';

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
export class CanvasComponent implements AfterViewInit {

  // =====================================================
  // OUTPUT
  // =====================================================

  @Output()
  cellSelected =
    new EventEmitter<{
      top: number;
      cell: TableCell | null;
    }>();


  // =====================================================
  // GENERAL DETAILS COMPONENT
  // =====================================================

  @ViewChild(GeneralDetailsComponent)
  generalDetailsComponent?: GeneralDetailsComponent;


  // =====================================================
  // GENERAL DETAILS DATA
  // =====================================================

  generalDetails: GeneralDetailsRow[] = [];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    public tableService: TableService,
    private router: Router
  ) {}


  // =====================================================
  // CURRENT CELL
  // =====================================================

  selectedCell: TableCell | null = null;


  // =====================================================
  // IMAGE MODAL
  // =====================================================

  selectedImage: string | null = null;


  // =====================================================
  // TEMPLATE DETAILS
  // =====================================================

  templateName = '';

  checklistType = 'Inspection';


  // =====================================================
  // CURRENT TEMPLATE ID
  // =====================================================

  currentTemplateId: string | null = null;


  // =====================================================
  // RANGE SELECTION
  // =====================================================

  selectionStartRow = -1;
  selectionStartCol = -1;

  selectionEndRow = -1;
  selectionEndCol = -1;


  // =====================================================
  // GENERAL DETAILS CHANGED
  // =====================================================

  onGeneralDetailsChanged(
    rows: GeneralDetailsRow[]
  ): void {

    this.generalDetails =
      structuredClone(rows);

  }


  // =====================================================
  // RESTORE TEMPLATE AFTER PREVIEW -> EDIT
  // =====================================================

  ngAfterViewInit(): void {

    // Remove old browser-persisted draft data.
    // Normal refresh must open a fresh template.
    localStorage.removeItem(
      'checklistDraft'
    );


    const savedEditData =
      localStorage.getItem(
        'editChecklist'
      );


    // Normal page open / F5 refresh:
    // stay as a fresh new template.
    if (!savedEditData) {

      return;

    }


    try {

      const editData =
        JSON.parse(savedEditData);


      this.currentTemplateId =
        editData.templateId ?? null;


      this.templateName =
        editData.templateName ?? '';


      this.checklistType =
        editData.checklistType ??
        'Inspection';


      this.tableService.builderItems =
        structuredClone(
          editData.builderItems ?? []
        );


      this.tableService.tables =
        this.tableService.builderItems
          .filter(
            item =>
              item.type === 'table' &&
              item.table
          )
          .map(
            item => item.table!
          );


      this.generalDetails =
        structuredClone(
          editData.generalDetails ?? []
        );


      if (
        this.generalDetailsComponent
      ) {

        this.generalDetailsComponent.rows =
          structuredClone(
            editData.generalDetails ?? []
          );

      }


      localStorage.removeItem(
        'editChecklist'
      );

    }

    catch (error) {

      console.error(
        'Unable to restore checklist:',
        error
      );


      localStorage.removeItem(
        'editChecklist'
      );

    }

  }

// =====================================================
// SAVE DRAFT
// =====================================================

async saveDraft(): Promise<void> {

  try {

    // =====================================================
    // STEP 1: CREATE TEMPLATE IF NEW
    // =====================================================

    if (this.currentTemplateId === null) {

      const templateResponse = await fetch(
        'http://localhost:3000/api/templates',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({

            template_name:
              this.templateName.trim() ||
              'Untitled Template',

            checklist_type:
              this.checklistType,

            created_by: 1,

            status: 'Draft'

          })
        }
      );


      const templateResult =
        await templateResponse.json();


      if (!templateResponse.ok) {

        throw new Error(
          templateResult.message ||
          'Unable to create template.'
        );

      }


      this.currentTemplateId =
        templateResult.data._id;

    }


    // =====================================================
    // STEP 2: UPDATE TEMPLATE NAME + CHECKLIST TYPE
    // =====================================================

    const updateResponse = await fetch(
      `http://localhost:3000/api/templates/${this.currentTemplateId}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          template_name:
            this.templateName.trim() ||
            'Untitled Template',

          checklist_type:
            this.checklistType

        })
      }
    );


    const updateResult =
      await updateResponse.json();


    if (!updateResponse.ok) {

      throw new Error(
        updateResult.message ||
        'Unable to update template details.'
      );

    }


    // =====================================================
    // STEP 3: SAVE COMPLETE TEMPLATE VERSION
    // =====================================================

    const versionResponse = await fetch(
      `http://localhost:3000/api/templates/${this.currentTemplateId}/version`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          templateName:
            this.templateName,

          checklistType:
            this.checklistType,

          generalDetails:
            structuredClone(
              this.generalDetailsComponent?.rows ??
              this.generalDetails
            ),

          builderItems:
            structuredClone(
              this.tableService.builderItems
            )

        })
      }
    );


    const versionResult =
      await versionResponse.json();


    if (!versionResponse.ok) {

      throw new Error(
        versionResult.message ||
        'Unable to save template version.'
      );

    }


    // =====================================================
    // KEEP CURRENT DRAFT AFTER REFRESH
    // =====================================================


    console.log(
      'Template updated:',
      updateResult.data
    );


    console.log(
      'Version saved:',
      versionResult.data
    );


    alert(
      'Draft saved successfully!'
    );

  }

  catch (error) {

    console.error(
      'Save Draft Error:',
      error
    );


    alert(
      'Failed to save draft.'
    );

  }

}

// =====================================================
// OPEN SAVED TEMPLATES
// =====================================================

openSavedTemplates(): void {

  this.router.navigate([
    '/saved-templates'
  ]);

}
  // =====================================================
  // PREVIEW
  // =====================================================

  previewChecklist(): void {

    const previewData = {

      // IMPORTANT for Edit/Delete
      templateId:
        this.currentTemplateId,

      templateName:
        this.templateName,

      checklistType:
        this.checklistType,

      generalDetails:
        structuredClone(
          this.generalDetailsComponent?.rows ??
          this.generalDetails
        ),

      builderItems:
        this.tableService.builderItems

    };


    localStorage.setItem(
      'previewChecklist',
      JSON.stringify(previewData)
    );


    // Inspection
    if (
      this.checklistType === 'Inspection'
    ) {

      this.router.navigate([
        '/inspection-report'
      ]);

      return;

    }


    // Setup
    if (
      this.checklistType === 'Setup'
    ) {

      this.router.navigate([
        '/setup-report'
      ]);

      return;

    }

  }


  // =====================================================
  // PUBLISH
  // =====================================================

  publishChecklist(): void {

    const publishedData = {

      templateId:
        this.currentTemplateId,

      templateName:
        this.templateName,

      checklistType:
        this.checklistType,

      generalDetails:
        structuredClone(
          this.generalDetailsComponent?.rows ??
          this.generalDetails
        ),

      builderItems:
        this.tableService.builderItems

    };


    localStorage.setItem(
      'publishedChecklist',
      JSON.stringify(publishedData)
    );


    if (
      this.checklistType === 'Setup'
    ) {

      this.router.navigate([
        '/setup-report'
      ]);

    } else {

      this.router.navigate([
        '/inspection-report'
      ]);

    }

  }


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
  // ADD ROW
  // =====================================================

  addRow(
    tableId: number
  ): void {

    this.tableService.addRow(
      tableId
    );

  }


  // =====================================================
  // ADD COLUMN
  // =====================================================

  addColumn(
    tableId: number
  ): void {

    this.tableService.addColumn(
      tableId
    );

  }


  // =====================================================
  // DELETE ROW
  // =====================================================

  deleteRow(
    tableId: number
  ): void {

    this.tableService.deleteRow(
      tableId
    );

  }


  // =====================================================
  // DELETE COLUMN
  // =====================================================

  deleteColumn(
    tableId: number
  ): void {

    this.tableService.deleteColumn(
      tableId
    );

  }


  // =====================================================
  // SELECT CELL
  // =====================================================

  selectCell(
    tableId: number,
    row: number,
    col: number,
    event?: MouseEvent
  ): void {

    const item =
      this.tableService.builderItems.find(
        item =>
          item.type === 'table' &&
          item.table?.id === tableId
      );


    if (
      !item ||
      !item.table
    ) {

      return;

    }


    const cell =
      item.table.rows[row]
        ?.cells[col];


    if (!cell) {

      return;

    }


    // -------------------------------------------------
    // SAME CELL CLICKED AGAIN
    // DESELECT
    // -------------------------------------------------

    if (
      this.selectedCell === cell
    ) {

      for (
        const builderItem
        of this.tableService.builderItems
      ) {

        if (
          builderItem.type === 'table' &&
          builderItem.table
        ) {

          for (
            const tableRow
            of builderItem.table.rows
          ) {

            for (
              const tableCell
              of tableRow.cells as TableCell[]
            ) {

              tableCell.selected =
                false;

            }

          }

        }

      }


      this.selectedCell =
        null;


      this.cellSelected.emit({
        top: 20,
        cell: null
      });


      this.clearSelection();

      return;

    }


    // -------------------------------------------------
    // CLEAR PREVIOUS HIGHLIGHTS
    // -------------------------------------------------

    this.clearCellHighlights();


    this.selectedCell =
      cell;


    // -------------------------------------------------
    // PROPERTY PANEL POSITION
    // -------------------------------------------------

    if (
      event &&
      event.currentTarget instanceof HTMLElement
    ) {

      const rect =
        event.currentTarget
          .getBoundingClientRect();


      this.cellSelected.emit({
        top: rect.top,
        cell: cell
      });

    }


    // -------------------------------------------------
    // FIRST CELL
    // -------------------------------------------------

    if (
      this.selectionStartRow === -1
    ) {

      this.selectionStartRow =
        row;


      this.selectionStartCol =
        col;


      this.tableService.selectCell(
        tableId,
        row,
        col
      );


      return;

    }


    // -------------------------------------------------
    // SECOND CELL / RANGE
    // -------------------------------------------------

    this.selectionEndRow =
      row;


    this.selectionEndCol =
      col;


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

    const textarea =
      event.target as HTMLTextAreaElement | null;


    if (!textarea) {
      return;
    }


    const minimumHeight =
      30;


    if (
      cell.baseHeight === undefined
    ) {

      cell.baseHeight =
        Math.max(
          minimumHeight,
          cell.height
        );

    }


    textarea.style.height =
      'auto';


    const contentHeight =
      textarea.scrollHeight + 12;


    const baseHeight =
      cell.baseHeight ??
      minimumHeight;


    const newHeight =
      Math.max(
        minimumHeight,
        baseHeight,
        contentHeight
      );


    cell.height =
      newHeight;


    textarea.style.height =
      `${newHeight - 12}px`;

  }


  // =====================================================
// IMAGE UPLOAD
// =====================================================

async onImageUpload(
  event: Event,
  cell: TableCell
): Promise<void> {

  const input =
    event.target as HTMLInputElement | null;


  if (!input) {
    return;
  }


  if (
    !input.files ||
    input.files.length === 0
  ) {

    return;

  }


  const file =
    input.files[0];


  // Only image files
  if (
    !file.type.startsWith(
      'image/'
    )
  ) {

    alert(
      'Please select an image file.'
    );

    input.value = '';

    return;

  }


  // Max 10 MB
  if (
    file.size >
    10 * 1024 * 1024
  ) {

    alert(
      'Image size must be less than 10 MB.'
    );

    input.value = '';

    return;

  }


  try {

    // =====================================================
    // CREATE FORM DATA
    // =====================================================

    const formData =
      new FormData();


    formData.append(
      'image',
      file
    );


    // =====================================================
    // SEND IMAGE TO BACKEND
    // =====================================================

    const response =
      await fetch(
        'http://localhost:3000/api/templates/upload-image',
        {
          method: 'POST',
          body: formData
        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        'Unable to upload image.'
      );

    }


    // =====================================================
    // SAVE ONLY IMAGE URL IN CELL
    // =====================================================

    cell.value =
      result.data.imageUrl;


    console.log(
      'Image uploaded:',
      cell.value
    );


    // Reset file input
    input.value = '';

  }

  catch (error) {

    console.error(
      'Image Upload Error:',
      error
    );


    alert(
      error instanceof Error
        ? error.message
        : 'Failed to upload image.'
    );


    input.value = '';

  }

}


  // =====================================================
  // VIEW IMAGE - OPEN MODAL
  // =====================================================

  viewImage(
    imageUrl: string | null | undefined
  ): void {

    if (!imageUrl) {
      return;
    }

    this.selectedImage =
      imageUrl;

  }


  // =====================================================
  // CLOSE IMAGE MODAL
  // =====================================================

  closeImageModal(): void {

    this.selectedImage =
      null;

  }


  // =====================================================
  // MERGE SELECTED
  // =====================================================

  mergeSelected(
    tableId: number
  ): void {

    this.tableService
      .mergeSelected(
        tableId
      );


    this.clearSelection();

  }


  // =====================================================
  // CLEAR CELL HIGHLIGHTS
  // =====================================================

  clearCellHighlights(): void {

    this.tableService
      .builderItems
      .forEach(item => {

        if (
          item.type === 'table' &&
          item.table
        ) {

          for (
            const row
            of item.table.rows
          ) {

            for (
              const cell
              of row.cells as TableCell[]
            ) {

              cell.selected =
                false;

            }

          }

        }

      });

  }


  // =====================================================
  // CLEAR RANGE
  // =====================================================

  clearSelection(): void {

    this.selectionStartRow =
      -1;

    this.selectionStartCol =
      -1;

    this.selectionEndRow =
      -1;

    this.selectionEndCol =
      -1;

  }


  // =====================================================
  // MERGE RIGHT
  // =====================================================

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
  // UNMERGE / SPLIT
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

  deleteItem(
    itemId: number
  ): void {

    this.tableService.deleteItem(
      itemId
    );

  }


  // =====================================================
  // MOVE ITEM UP
  // =====================================================

  moveUp(
    itemId: number
  ): void {

    this.tableService.moveItemUp(
      itemId
    );

  }


  // =====================================================
  // MOVE ITEM DOWN
  // =====================================================

  moveDown(
    itemId: number
  ): void {

    this.tableService.moveItemDown(
      itemId
    );

  }
}