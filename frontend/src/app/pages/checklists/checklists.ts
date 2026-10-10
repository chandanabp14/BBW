import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MasterConfigService } from '../../modules/template-builder/services/master-config.service';
import { MasterConfig } from '../../modules/template-builder/models/master-config.model';
import { NavbarComponent } from '../../modules/template-builder/components/navbar/navbar';

@Component({
  selector: 'app-checklists',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './checklists.html',
  styleUrl: './checklists.css'
})
export class ChecklistsComponent implements OnInit {
  masterConfigs: MasterConfig[] = [];

  constructor(
    public masterConfigService: MasterConfigService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.masterConfigs = this.masterConfigService.getMasterConfigs();
    this.changeDetector.detectChanges();
  }

  newMasterConfig(): void {
    this.router.navigate(['/master-config']);
  }

  manageMasterConfig(): void {
    this.router.navigate(['/master-config']);
  }

  openMasterConfig(id: number): void {
    this.router.navigate(['/master-config', id]);
  }

  newChecklist(): void {
    this.router.navigate(['/builder']);
  }
}