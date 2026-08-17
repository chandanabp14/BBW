import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  GeneralDetail,
  GeneralDetailsRow
} from '../../models/general-details.model';

@Component({
  selector: 'app-general-details',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './general-details.html',

  styleUrls: ['./general-details.css']
})
export class GeneralDetailsComponent {

  rows: GeneralDetailsRow[] = [

    {
      id: 1,

      fields: [

        {
          id: 1,
          label: 'NEW FIELD',
          value: '',
          inputType: 'text'
        },

        {
          id: 2,
          label: 'NEW FIELD',
          value: '',
          inputType: 'text'
        }

      ]
    },

    {
      id: 2,

      fields: [

        {
          id: 3,
          label: 'NEW FIELD',
          value: '',
          inputType: 'text'
        },

        {
          id: 4,
          label: 'NEW FIELD',
          value: '',
          inputType: 'text'
        }

      ]
    }

  ];


  // ==========================================
  // ADD FIELD
  // ==========================================

  addField(row: GeneralDetailsRow): void {

    const newField: GeneralDetail = {

      id: Date.now(),

      label: 'NEW FIELD',

      value: '',

      inputType: 'text'

    };

    row.fields.push(newField);

  }


  // ==========================================
  // DELETE FIELD
  // ==========================================

  deleteField(
    row: GeneralDetailsRow,
    fieldIndex: number
  ): void {

    row.fields.splice(fieldIndex, 1);

  }


  // ==========================================
  // ADD ROW
  // ==========================================

  addRow(): void {

    this.rows.push({

      id: Date.now(),

      fields: [

        {
          id: Date.now() + 1,
          label: 'NEW FIELD',
          value: '',
          inputType: 'text'
        }

      ]

    });

  }


  // ==========================================
  // DELETE ROW
  // ==========================================

  deleteRow(rowIndex: number): void {

    if (this.rows.length <= 1) {
      return;
    }

    this.rows.splice(rowIndex, 1);

  }

}