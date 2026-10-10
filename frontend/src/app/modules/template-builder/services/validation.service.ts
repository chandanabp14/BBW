import { Injectable } from '@angular/core';
import { MasterConfigParameter, ValidationResult, ValidationStatus } from '../models/master-config.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  formatSpecification(param: MasterConfigParameter): string {
    if (!param) return '—';

    if (param.reqSpec && param.reqSpec.trim()) {
      return param.reqSpec.trim();
    }

    const unitStr = param.unit ? ` ${param.unit}` : '';

    if (param.nominalValue !== undefined && param.nominalValue !== null && param.tolerance) {
      const tolStr = param.tolerance.toString().startsWith('±') ? param.tolerance : `±${param.tolerance}`;
      if (param.minValue !== undefined && param.maxValue !== undefined) {
        return `${param.minValue}–${param.maxValue}${unitStr}`;
      }
      return `${param.nominalValue} ${tolStr}${unitStr}`;
    }

    switch (param.specificationType) {
      case 'range':
        if (param.minValue !== undefined && param.maxValue !== undefined) {
          return `${param.minValue}–${param.maxValue}${unitStr}`;
        }
        if (param.minValue !== undefined) return `>= ${param.minValue}${unitStr}`;
        if (param.maxValue !== undefined) return `<= ${param.maxValue}${unitStr}`;
        return `Range Spec${unitStr}`;

      case 'exact':
        return `${param.expectedValue ?? param.nominalValue ?? 'Exact'}${unitStr}`;

      case 'min':
        return `>= ${param.minValue ?? 0}${unitStr}`;

      case 'max':
        return `<= ${param.maxValue ?? 0}${unitStr}`;

      case 'selection':
        return `Expected: ${param.expectedValue || 'OK'}`;

      case 'checklist':
        return param.expectedValue ? `Expected: ${param.expectedValue}` : 'Required Check';

      case 'none':
      default:
        return param.expectedValue ? `${param.expectedValue}${unitStr}` : 'Observation';
    }
  }

  validateValue(param: MasterConfigParameter, actualValue: string | undefined | null): ValidationResult {
    const formattedSpec = this.formatSpecification(param);
    const val = (actualValue ?? '').toString().trim();

    // 1. Empty field checks
    if (!val) {
      if (param.required) {
        return {
          status: 'PENDING',
          message: 'Required field pending entry',
          formattedSpec
        };
      }
      return {
        status: 'PENDING',
        message: 'Optional field',
        formattedSpec
      };
    }

    // 2. Perform validation based on specification type
    switch (param.specificationType) {
      case 'range': {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          return {
            status: 'FAIL',
            message: '✕ FAIL: Invalid numeric value',
            formattedSpec
          };
        }

        const min = param.minValue ?? -Infinity;
        const max = param.maxValue ?? Infinity;

        // Boundary values (min and max) MUST pass
        if (numVal >= min && numVal <= max) {
          return {
            status: 'PASS',
            message: '✓ PASS: Value within range',
            formattedSpec
          };
        } else {
          return {
            status: 'FAIL',
            message: `✕ OUT OF RANGE: Expected ${min} - ${max}${param.unit ? ' ' + param.unit : ''}`,
            formattedSpec
          };
        }
      }

      case 'min': {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          return {
            status: 'FAIL',
            message: '✕ FAIL: Invalid numeric value',
            formattedSpec
          };
        }

        const min = param.minValue ?? 0;
        if (numVal >= min) {
          return {
            status: 'PASS',
            message: '✓ PASS: Value meets minimum requirement',
            formattedSpec
          };
        } else {
          return {
            status: 'FAIL',
            message: `✕ FAIL: Value below minimum (${min})`,
            formattedSpec
          };
        }
      }

      case 'max': {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          return {
            status: 'FAIL',
            message: '✕ FAIL: Invalid numeric value',
            formattedSpec
          };
        }

        const max = param.maxValue ?? 0;
        if (numVal <= max) {
          return {
            status: 'PASS',
            message: '✓ PASS: Value within maximum limit',
            formattedSpec
          };
        } else {
          return {
            status: 'FAIL',
            message: `✕ FAIL: Value exceeds maximum (${max})`,
            formattedSpec
          };
        }
      }

      case 'exact': {
        const expected = (param.expectedValue ?? '').trim();
        // Check if both expected and actual are numeric
        const expectedNum = Number(expected);
        const actualNum = Number(val);

        if (!isNaN(expectedNum) && !isNaN(actualNum)) {
          if (actualNum === expectedNum) {
            return {
              status: 'PASS',
              message: '✓ PASS: Exact numeric match',
              formattedSpec
            };
          } else {
            return {
              status: 'FAIL',
              message: `✕ FAIL: Expected ${expected}, got ${val}`,
              formattedSpec
            };
          }
        }

        // String comparison
        if (val.toLowerCase() === expected.toLowerCase()) {
          return {
            status: 'PASS',
            message: '✓ PASS: Exact match',
            formattedSpec
          };
        } else {
          return {
            status: 'FAIL',
            message: `✕ FAIL: Expected "${expected}"`,
            formattedSpec
          };
        }
      }

      case 'selection':
      case 'checklist': {
        const upper = val.toUpperCase();
        const expectedUpper = (param.expectedValue || 'OK').toUpperCase();

        if (
          upper === 'YES' ||
          upper === 'OK' ||
          upper === 'TRUE' ||
          upper === 'PASS' ||
          upper === expectedUpper
        ) {
          return {
            status: 'PASS',
            message: '✓ PASS: Verified',
            formattedSpec
          };
        } else {
          return {
            status: 'FAIL',
            message: '✕ FAIL: Verification failed',
            formattedSpec
          };
        }
      }

      case 'none':
      default: {
        return {
          status: 'PASS',
          message: '✓ RECORDED',
          formattedSpec
        };
      }
    }
  }
}
