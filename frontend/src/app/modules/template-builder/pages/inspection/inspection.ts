import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Template } from '../../models/template.model';
import { TableCell } from '../../models/table.model';
import { TemplateService } from '../../services/template.service';

@Component({
  selector: 'app-inspection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspection.html',
  styleUrl: './inspection.css'
})
export class InspectionComponent implements OnInit {
  template?: Template;
  saved = false;
  submitted = false;

  constructor(
    private templateService: TemplateService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));

    if (Number.isFinite(id) && id > 0) {
      const savedInspection = this.templateService.getInspectionTemplate(id);

      // Retain an inspector's locally saved work when it exists. Otherwise,
      // fetch the exact template from the API so a fresh browser tab does not
      // depend on a previously populated in-memory template list.
      try {
        this.template = savedInspection
          ?? await this.templateService.loadTemplateById(id);
      } catch (error) {
        console.error('Unable to load the inspection checklist.', error);
        return;
      }

      if (this.template?.status !== 'published') {
        this.template = undefined;
        return;
      }

      this.ensureGeneralDetailOwnership();
      this.submitted = Boolean(this.template?.inspectionSubmittedAt);
    }
  }

  private ensureGeneralDetailOwnership(): void {
    for (const row of this.template?.generalDetailsRows ?? []) {
      for (const field of row.fields) {
        field.inputMode ??= field.value.trim() ? 'admin' : 'inspector';
      }
    }
  }

  save(): void {
    if (!this.template) {
      return;
    }

    this.templateService.saveInspection(this.template);
    this.saved = true;
  }

  submit(): void {
    if (!this.template) {
      return;
    }

    this.templateService.submitInspection(this.template);
    this.submitted = true;
    this.saved = true;
  }

  print(): void {
    window.print();
  }

  setCheckbox(cell: TableCell, checked: boolean): void {
    cell.value = checked ? 'true' : 'false';
  }

  selectImage(event: Event, cell: TableCell): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => cell.value = String(reader.result);
    reader.readAsDataURL(file);
  }

}
