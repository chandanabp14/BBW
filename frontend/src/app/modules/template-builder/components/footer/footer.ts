import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector: 'app-footer',

  standalone: true,

  templateUrl: './footer.html',

  styleUrl: './footer.css'
})
export class FooterComponent {

  @Output()
  saveDraft =
    new EventEmitter<void>();


  @Output()
  publish =
    new EventEmitter<void>();


  onSaveDraft(): void {

    this.saveDraft.emit();

  }


  onPublish(): void {

    this.publish.emit();

  }

}