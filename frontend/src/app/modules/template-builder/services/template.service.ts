import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChecklistComponent } from '../models/template.model';
import { BuilderItem } from '../models/builder-item.model';
import { Template, TemplateStatus } from '../models/template.model';
import {
  GeneralDetailsRow
} from '../models/general-details.model';
import { DynamicTable } from '../models/table.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private nextId = 1;
  private inspectionStorageKey = 'bbw-inspection-responses';
  private templates: Template[] = [];
  private readonly templatesUrl = 'http://localhost:3000/api/templates';

  constructor(private http: HttpClient) {}

  components = signal<ChecklistComponent[]>([]);

  addTextbox() {
    this.components.update(list => [
      ...list,
      {
        id: this.nextId++,
        type: 'textbox',
        label: 'Textbox',
        placeholder: 'Enter value'
      }
    ]);
  }

  addHeading() {
    this.components.update(list => [
      ...list,
      {
        id: this.nextId++,
        type: 'heading',
        label: 'Heading'
      }
    ]);
  }


  addDate() {
    this.components.update(list => [
      ...list,
      {
        id: this.nextId++,
        type: 'date',
        label: 'Inspection Date'
      }
    ]);
  }

  deleteComponent(id: number) {
    this.components.update(list => list.filter(c => c.id !== id));
  }

  // =====================================================
  // LOAD ALL CHECKLISTS
  // =====================================================

  getTemplates(): Template[] {
    return this.templates;
  }

  async loadTemplates(): Promise<Template[]> {
    const response = await firstValueFrom(
      this.http.get<{ success: boolean; data: Template[] }>(this.templatesUrl)
    );
    this.templates = response.data;
    return this.templates;
  }


  // =====================================================
  // SAVE DRAFT
  // =====================================================

  saveDraft(
    name: string,
    items: BuilderItem[],
    existingId?: number,
    checklistType = 'Inspection',
    generalDetailsRows: GeneralDetailsRow[] = [],
    tables: DynamicTable[] = []
  ): Promise<Template> {

    return this.saveTemplate(
      name,
      items,
      'draft',
      existingId,
      checklistType,
      generalDetailsRows,
      tables
    );
  }


  // =====================================================
  // PUBLISH
  // =====================================================

  publish(
    name: string,
    items: BuilderItem[],
    existingId?: number,
    checklistType = 'Inspection',
    generalDetailsRows: GeneralDetailsRow[] = [],
    tables: DynamicTable[] = []
  ): Promise<Template> {

    return this.saveTemplate(
      name,
      items,
      'published',
      existingId,
      checklistType,
      generalDetailsRows,
      tables
    );
  }


  // =====================================================
  // SAVE TEMPLATE
  // =====================================================

  private saveTemplate(
    name: string,
    items: BuilderItem[],
    status: TemplateStatus,
    existingId: number | undefined,
    checklistType: string,
    generalDetailsRows: GeneralDetailsRow[],
    tables: DynamicTable[]
  ): Promise<Template> {

    const now = new Date().toISOString();

    let template: Template | undefined;


    // -------------------------------------------------
    // UPDATE EXISTING
    // -------------------------------------------------

    if (existingId) {

      template = this.templates.find(
        t => t.id === existingId
      );

      if (template) {

        template.name = name || 'Untitled Checklist';

        template.status = status;

        template.items =
          structuredClone(items);

        if (status === 'published') {
          this.assignCellOwnership(template.items);
          this.assignGeneralDetailOwnership(template.generalDetailsRows);
        }

        template.checklistType = checklistType;
        template.generalDetailsRows = structuredClone(generalDetailsRows);
        template.tables = structuredClone(tables);

        template.updatedAt = now;

      }

    }


    // -------------------------------------------------
    // CREATE NEW
    // -------------------------------------------------

    if (!template) {

      template = {

        id: Date.now(),

        name:
          name || 'Untitled Checklist',

        checklistType,

        generalDetailsRows: structuredClone(generalDetailsRows),

        tables: structuredClone(tables),

        status,

        items:
          structuredClone(items),

        createdAt: now,

        updatedAt: now

      };

      if (status === 'published') {
        this.assignCellOwnership(template.items);
        this.assignGeneralDetailOwnership(template.generalDetailsRows);
      }

    }


    return this.persistTemplate(template);
  }


  // =====================================================
  // GET ONE TEMPLATE
  // =====================================================

  getTemplate(
    id: number
  ): Template | undefined {

    return this.templates.find(
      template => template.id === id
    );

  }

  async loadTemplateById(id: number): Promise<Template | undefined> {
    const response = await firstValueFrom(
      this.http.get<{ success: boolean; data: Template }>(`${this.templatesUrl}/${id}`)
    );

    return response.data;
  }

  // =====================================================
  // DUPLICATE TEMPLATE
  // =====================================================

  /**
   * Creates an editable draft copy of a saved checklist. A duplicate never
   * changes the original checklist, even when the original is published.
   */
  async duplicateTemplate(id: number): Promise<Template | undefined> {
    const source = this.templates.find(template => template.id === id);

    if (!source) {
      return undefined;
    }

    const now = new Date().toISOString();
    const duplicate: Template = {
      id: Date.now(),
      name: this.getDuplicateName(source.name || 'Untitled Checklist'),
      checklistType: source.checklistType,
      generalDetailsRows: structuredClone(source.generalDetailsRows || []),
      tables: structuredClone(source.tables || []),
      // Duplicates are drafts so an administrator can safely rename and edit
      // them before publishing.
      status: 'draft',
      items: structuredClone(source.items || []),
      createdAt: now,
      updatedAt: now
    };

    return this.persistTemplate(duplicate);
  }

  getInspectionTemplate(id: number): Template | undefined {
    const savedInspection = this.loadInspectionTemplates().find(template => template.id === id);

    if (savedInspection) {
      return structuredClone(savedInspection);
    }

    const publishedTemplate = this.templates.find(
      template => template.id === id && template.status === 'published'
    );

    return publishedTemplate ? structuredClone(publishedTemplate) : undefined;
  }

  saveInspection(template: Template): void {
    const inspections = this.loadInspectionTemplates();
    const existingIndex = inspections.findIndex(item => item.id === template.id);
    const savedTemplate = structuredClone(template);

    if (existingIndex >= 0) {
      inspections[existingIndex] = savedTemplate;
    } else {
      inspections.push(savedTemplate);
    }

    localStorage.setItem(this.inspectionStorageKey, JSON.stringify(inspections));
  }

  submitInspection(template: Template): void {
    template.inspectionSubmittedAt = new Date().toISOString();
    this.saveInspection(template);
  }


  // =====================================================
  // DELETE TEMPLATE
  // =====================================================

  async deleteTemplate(
    id: number
  ): Promise<void> {

    await firstValueFrom(this.http.delete(`${this.templatesUrl}/${id}`));
    this.templates = this.templates.filter(template => template.id !== id);

  }

  async publishTemplateById(id: number): Promise<void> {
    const template = this.templates.find(item => item.id === id);

    if (!template) {
      return;
    }

    template.status = 'published';
    this.assignCellOwnership(template.items);
    this.assignGeneralDetailOwnership(template.generalDetailsRows);
    template.updatedAt = new Date().toISOString();
    await this.persistTemplate(template);
  }

  private getDuplicateName(originalName: string): string {
    const escapedName = originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const duplicatePattern = new RegExp(`^${escapedName}\\((\\d+)\\)$`, 'i');
    const existingNumbers = this.templates
      .map(template => template.name.match(duplicatePattern))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map(match => Number(match[1]));

    let nextNumber = 1;
    while (existingNumbers.includes(nextNumber)) {
      nextNumber++;
    }

    return `${originalName}(${nextNumber})`;
  }

  private assignCellOwnership(items: BuilderItem[]): void {
    for (const item of items) {
      if (!item.table) {
        continue;
      }

      for (const row of item.table.rows) {
        for (const cell of row.cells) {
          cell.inputMode = cell.value.trim() ? 'admin' : 'inspector';
        }
      }
    }
  }

  private assignGeneralDetailOwnership(rows: GeneralDetailsRow[] | undefined): void {
    if (!rows) {
      return;
    }

    for (const row of rows) {
      for (const field of row.fields) {
        field.inputMode = field.value.trim() ? 'admin' : 'inspector';
      }
    }
  }


  // =====================================================
  // API PERSISTENCE
  // =====================================================

  private async persistTemplate(template: Template): Promise<Template> {
    const existingTemplate = this.templates.some(item => item.id === template.id);
    const request = existingTemplate
      ? this.http.put<{ success: boolean; data: Template }>(`${this.templatesUrl}/${template.id}`, template)
      : this.http.post<{ success: boolean; data: Template }>(this.templatesUrl, template);
    const response = await firstValueFrom(request);
    const savedTemplate = response.data;
    const existingIndex = this.templates.findIndex(item => item.id === savedTemplate.id);

    if (existingIndex >= 0) {
      this.templates[existingIndex] = savedTemplate;
    } else {
      this.templates.push(savedTemplate);
    }

    return savedTemplate;
  }

  private loadInspectionTemplates(): Template[] {
    const saved = localStorage.getItem(this.inspectionStorageKey);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

}
