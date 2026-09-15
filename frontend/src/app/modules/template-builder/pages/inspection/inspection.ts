import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  loadError = '';

  constructor(
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));

    if (Number.isFinite(id) && id > 0) {
      // Always use the current server version. An old locally saved inspector
      // copy may still be a draft even after the administrator publishes it.
      try {
        this.template = await this.templateService.loadTemplateById(id);
      } catch (error) {
        console.error('Unable to load the inspection checklist.', error);
        this.loadError = 'Unable to load this checklist from the server. Confirm the backend is running on port 3001.';
        this.changeDetector.detectChanges();
        return;
      }

      if (this.template?.status !== 'published') {
        this.template = undefined;
        this.loadError = 'This checklist is still a draft and must be published before inspection.';
        this.changeDetector.detectChanges();
        return;
      }

      this.ensureGeneralDetailOwnership();
      this.submitted = Boolean(this.template?.inspectionSubmittedAt);
      // This app uses zoneless change detection. Awaiting the API call and
      // assigning ordinary class properties does not schedule a redraw, so
      // explicitly render the loaded inspection template.
      this.changeDetector.detectChanges();
    } else {
      this.loadError = 'The inspection link does not contain a valid checklist ID.';
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
