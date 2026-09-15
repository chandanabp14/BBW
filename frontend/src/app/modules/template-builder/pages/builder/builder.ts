import { Component } from '@angular/core';

import { SidebarComponent } from '../../components/sidebar/sidebar';
import { CanvasComponent } from '../../components/canvas/canvas';
import { PropertiesComponent } from '../../components/properties/properties';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FormsModule } from '@angular/forms';
import { TableCell } from '../../models/table.model';
import { TemplateService } from '../../services/template.service';
import { TableService } from '../../services/table.service';

@Component({
  selector: 'app-builder',

  standalone: true,

  imports: [
    SidebarComponent,
    CanvasComponent,
    PropertiesComponent,
    NavbarComponent,
    FormsModule
  ],

  templateUrl: './builder.html',

  styleUrl: './builder.css'
})
export class BuilderComponent {

  propertyPanelTop = 20;

  selectedCell: TableCell | null = null;

  // =====================================================
  // CURRENT CHECKLIST
  // =====================================================

  checklistName = 'Untitled Checklist';

  currentTemplateId?: number;


  constructor(
    private templateService: TemplateService,
    public tableService: TableService
  ) {}


  // =====================================================
  // PROPERTY PANEL
  // =====================================================

  movePropertyPanel(
    event: {
      top: number,
      cell: TableCell | null
    }
  ): void {

    this.propertyPanelTop =
      Math.max(20, event.top);

    this.selectedCell =
      event.cell;

  }


  // =====================================================
  // SAVE DRAFT
  // =====================================================

  async saveDraft(): Promise<void> {

    const template =
      await this.templateService.saveDraft(
        this.checklistName,
        this.tableService.builderItems,
        this.currentTemplateId
      );

    this.currentTemplateId =
      template.id;

    alert('Checklist saved as draft.');

  }


  // =====================================================
  // PUBLISH
  // =====================================================

  async publish(): Promise<void> {

    const template =
      await this.templateService.publish(
        this.checklistName,
        this.tableService.builderItems,
        this.currentTemplateId
      );

    this.currentTemplateId =
      template.id;

    alert('Checklist published successfully.');

  }

}
