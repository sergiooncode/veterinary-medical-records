import React from 'react';
import type { Medication } from '../../../types';

interface MedicationsSectionProps {
  medications: Medication[];
  onMedicationChange: (index: number, field: keyof Medication, value: string | null) => void;
}

export function MedicationsSection({ medications, onMedicationChange }: MedicationsSectionProps): JSX.Element {
  const getMedicationSummary = (medication: Medication): string => {
    const parts: string[] = [];
    if (medication.start_date) parts.push(`Start: ${medication.start_date}`);
    if (medication.end_date) parts.push(`End: ${medication.end_date}`);
    else if (!medication.end_date && medication.start_date) parts.push('Ongoing');
    if (medication.dosage) parts.push(medication.dosage);
    if (medication.frequency) parts.push(medication.frequency);
    return parts.join(' • ') || 'No details';
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        Medications
        {medications.length > 0 ? ` (${medications.length})` : ''}
      </h3>
      {medications.length === 0 ? (
        <p className="empty-state">No medications recorded</p>
      ) : (
        <div className="list-items">
          {medications.map((medication, index) => (
            <div className="list-item-card" key={index}>
              <div className="form-group">
                <label>Medication Name</label>
                <input
                  type="text"
                  value={medication.name}
                  onChange={(e) => onMedicationChange(index, 'name', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Metformin, Ibuprofen"
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={medication.start_date || ''}
                  onChange={(e) =>
                    onMedicationChange(index, 'start_date', e.target.value || null)
                  }
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={medication.end_date || ''}
                  onChange={(e) =>
                    onMedicationChange(index, 'end_date', e.target.value || null)
                  }
                  className="form-input"
                  placeholder="Leave empty if ongoing"
                />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  value={medication.dosage || ''}
                  onChange={(e) =>
                    onMedicationChange(index, 'dosage', e.target.value || null)
                  }
                  className="form-input"
                  placeholder="e.g., 50mg"
                />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <input
                  type="text"
                  value={medication.frequency || ''}
                  onChange={(e) =>
                    onMedicationChange(index, 'frequency', e.target.value || null)
                  }
                  className="form-input"
                  placeholder="e.g., Twice daily"
                />
              </div>
              <p className="item-summary">{getMedicationSummary(medication) || 'No details'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
