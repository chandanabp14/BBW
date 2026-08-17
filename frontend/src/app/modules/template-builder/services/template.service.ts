import { Injectable, signal } from '@angular/core';
import { ChecklistComponent } from '../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private nextId = 1;

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
}