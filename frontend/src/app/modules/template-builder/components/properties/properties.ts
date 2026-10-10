import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TableCell } from '../../models/table.model';

@Component({
  selector: 'app-properties',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './properties.html',
  styleUrl: './properties.css'
})
export class PropertiesComponent {

  @Input() cell: TableCell | null = null;

  @Output() cellChange = new EventEmitter<TableCell>();

  valueChanged(): void {
    if (!this.cell) {
      return;
    }

    this.cell.inputMode = this.cell.value.trim()
      ? 'admin'
      : 'inspector';

    this.update();
  }

  update(): void {

    const currentCell = this.cell;

    if (!currentCell) {
      return;
    }

    // Minimum cell size
    currentCell.width = Math.max(
      30,
      currentCell.width || 30
    );

    currentCell.height = Math.max(
      30,
      currentCell.height || 30
    );

    /*
    * The height entered through the property panel
    * becomes the new minimum/base height.
    *
    * This allows the cell to later grow automatically
    * when long text is entered, and shrink back to
    * this manually selected height when text is removed.
    */
    currentCell.baseHeight = currentCell.height;

    currentCell.autoHeight = true;

    this.cellChange.emit(currentCell);

  }

  manualHeightChange(): void {

    if (!this.cell) {
      return;
    }

    // Admin has manually chosen the height.
    // Automatic text resizing must respect this height.
    this.cell.autoHeight = false;

    this.update();
  }

}
