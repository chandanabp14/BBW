import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableService } from '../../modules/template-builder/services/table.service';
import { TemplateService } from '../../modules/template-builder/services/template.service';
import { BuilderItem } from '../../modules/template-builder/models/builder-item.model';
import { GeneralDetailsRow } from '../../modules/template-builder/models/general-details.model';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.html',
  styleUrl: './preview.css'
})
export class PreviewComponent implements OnInit {

  constructor(
    public tableService: TableService,
    private templateService: TemplateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if a template ID is passed in query params (e.g. /preview?id=123)
    const idParam = this.route.snapshot.queryParamMap.get('id');
    if (idParam) {
      const template = this.templateService.getTemplate(+idParam);
      if (template) {
        this.tableService.loadTemplate(template);
        return;
      }
    }

    // Otherwise, if opened in a new tab or items are empty, load saved preview state
    if (this.tableService.builderItems.length === 0) {
      this.tableService.loadPreviewData();
    }
  }

  get items(): BuilderItem[] {
    return this.tableService.builderItems;
  }

  get generalDetailsRows(): GeneralDetailsRow[] {
    return this.tableService.generalDetailsRows;
  }

  get templateName(): string {
    return this.tableService.templateName.trim()
        || 'PDC SETUP CUM START UP CHECK SHEET';
  }

  print(): void {
    window.print();
  }

  close(): void {
    if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  }
}