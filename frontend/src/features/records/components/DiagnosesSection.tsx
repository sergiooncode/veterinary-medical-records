import React from 'react';
import type { Diagnosis } from '../../../types';
import { FoldableSection } from '../../../shared/ui/FoldableSection';

interface DiagnosesSectionProps {
  diagnoses: Diagnosis[];
  onDiagnosisChange: (index: number, field: keyof Diagnosis, value: string | boolean | null) => void;
}

export function DiagnosesSection({ diagnoses, onDiagnosisChange }: DiagnosesSectionProps): JSX.Element {
  const getDiagnosisSummary = (diagnosis: Diagnosis): string => {
    const parts: string[] = [];
    if (diagnosis.date) parts.push(`Date: ${diagnosis.date}`);
    if (diagnosis.icd_code) parts.push(`ICD: ${diagnosis.icd_code}`);
    if (diagnosis.is_chronic) parts.push('Chronic');
    return parts.join(' • ') || 'No details';
  };

  return (
    <FoldableSection title={`Diagnoses${diagnoses.length > 0 ? ` (${diagnoses.length})` : ''}`}>
      {diagnoses.length === 0 ? (
        <p className="empty-state">No diagnoses recorded</p>
      ) : (
        <div className="list-items">
          {diagnoses.map((diagnosis, index) => (
            <div className="list-item-card" key={index}>
              <div className="form-group">
                <label>Diagnosis Name</label>
                <input
                  type="text"
                  value={diagnosis.name}
                  onChange={(e) => onDiagnosisChange(index, 'name', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Diabetes, Arthritis"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={diagnosis.date || ''}
                  onChange={(e) => onDiagnosisChange(index, 'date', e.target.value || null)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>ICD Code</label>
                <input
                  type="text"
                  value={diagnosis.icd_code || ''}
                  onChange={(e) => onDiagnosisChange(index, 'icd_code', e.target.value || null)}
                  className="form-input"
                  placeholder="e.g., E11.9"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={diagnosis.is_chronic}
                    onChange={(e) => onDiagnosisChange(index, 'is_chronic', e.target.checked)}
                  />
                  Chronic Condition
                </label>
              </div>
              <p className="item-summary">{getDiagnosisSummary(diagnosis) || 'No details'}</p>
            </div>
          ))}
        </div>
      )}
    </FoldableSection>
  );
}

