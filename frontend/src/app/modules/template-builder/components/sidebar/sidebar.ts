import { Component } from '@angular/core';
import { TableService } from '../../services/table.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {

  constructor(
    public tableService: TableService
  ) {}

  addTable(): void {

    this.tableService.createTable();

  }

  addTextbox(): void {

    this.tableService.addTextbox();

  }

  addHeading(): void {

    this.tableService.addHeading();

  }

  addDate(): void {

    this.tableService.addDate();

  }

}