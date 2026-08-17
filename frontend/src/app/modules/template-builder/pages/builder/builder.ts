import { Component } from '@angular/core';

import { SidebarComponent } from '../../components/sidebar/sidebar';
import { CanvasComponent } from '../../components/canvas/canvas';
import { PropertiesComponent } from '../../components/properties/properties';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

import { TableCell } from '../../models/table.model';

@Component({
  selector: 'app-builder',
  standalone: true,

  imports: [
    SidebarComponent,
    CanvasComponent,
    PropertiesComponent,
    NavbarComponent,
    FooterComponent
  ],

  templateUrl: './builder.html',

  styleUrl: './builder.css'
})
export class BuilderComponent {

  propertyPanelTop = 20;

  selectedCell: TableCell | null = null;

  movePropertyPanel(
  event: { top: number, cell: TableCell | null }
  ): void {

    this.propertyPanelTop = Math.max(20, event.top);

    this.selectedCell = event.cell;
}

}