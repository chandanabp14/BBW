import { Injectable, signal } from '@angular/core';
import { InspectionInstance, ValidationStatus } from '../models/master-config.model';

@Injectable({
  providedIn: 'root'
})
export class InspectionService {
  private readonly storageKey = 'bbw-inspection-instances';
  private inspections: InspectionInstance[] = [];
  inspectionsSignal = signal<InspectionInstance[]>([]);

  constructor() {
    this.initInspections();
  }

  private initInspections(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.inspections = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved inspections', e);
        this.inspections = [];
      }
    }
    this.inspectionsSignal.set([...this.inspections]);
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.inspections));
    this.inspectionsSignal.set([...this.inspections]);
  }

  getInspections(): InspectionInstance[] {
    return [...this.inspections];
  }

  getInspectionById(id: number): InspectionInstance | undefined {
    return this.inspections.find(i => i.id === id);
  }

  saveInspection(instance: InspectionInstance): InspectionInstance {
    const now = new Date().toISOString();
    instance.updatedAt = now;

    // Determine overall result
    instance.overallResult = this.computeOverallResult(instance);

    const existingIndex = this.inspections.findIndex(i => i.id === instance.id);
    if (existingIndex >= 0) {
      this.inspections[existingIndex] = structuredClone(instance);
    } else {
      if (!instance.id) {
        instance.id = Date.now();
      }
      instance.createdAt = now;
      this.inspections.push(structuredClone(instance));
    }

    this.saveToStorage();
    return instance;
  }

  submitInspection(instance: InspectionInstance): InspectionInstance {
    instance.submittedAt = new Date().toISOString();
    return this.saveInspection(instance);
  }

  approveInspection(
    id: number,
    approvalData: { preparedBy: string; checkedBy: string; approvedBy: string; status: 'APPROVED' | 'REJECTED'; comments?: string }
  ): InspectionInstance | undefined {
    const instance = this.getInspectionById(id);
    if (!instance) return undefined;

    instance.approval = {
      preparedBy: approvalData.preparedBy || instance.approval.preparedBy,
      checkedBy: approvalData.checkedBy || instance.approval.checkedBy,
      approvedBy: approvalData.approvedBy || instance.approval.approvedBy,
      status: approvalData.status,
      approvedAt: new Date().toISOString(),
      comments: approvalData.comments
    };

    return this.saveInspection(instance);
  }

  private computeOverallResult(instance: InspectionInstance): ValidationStatus {
    const entries = Object.values(instance.parameterEntries || {});
    if (entries.length === 0) return 'PENDING';

    let hasFail = false;
    let hasPending = false;

    for (const entry of entries) {
      if (entry.result === 'FAIL') {
        hasFail = true;
      } else if (entry.result === 'PENDING') {
        hasPending = true;
      }
    }

    if (hasFail) return 'FAIL';
    if (hasPending) return 'PENDING';
    return 'PASS';
  }
}
