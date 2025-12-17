import React from 'react';
import type { StructuredData, Diagnosis, Procedure, Medication, ClinicInfo } from '../../../types';
import { PetInfoSection } from './PetInfoSection';
import { DiagnosesSection } from './DiagnosesSection';
import { ProceduresSection } from './ProceduresSection';
import { MedicationsSection } from './MedicationsSection';
import { PastMedicalIssuesSection } from './PastMedicalIssuesSection';
import { ClinicInfoSection } from './ClinicInfoSection';
import { FoldableSection } from '../../../shared/ui/FoldableSection';

interface StructuredRecordFormProps {
  structuredData: StructuredData;
  onFieldChange: (field: keyof StructuredData, value: string | null) => void;
  onDiagnosisChange: (index: number, field: keyof Diagnosis, value: string | boolean | null) => void;
  onProcedureChange: (index: number, field: keyof Procedure, value: string | number | null) => void;
  onMedicationChange: (index: number, field: keyof Medication, value: string | null) => void;
  onClinicInfoChange: (field: keyof ClinicInfo, value: string | null) => void;
  onPastMedicalIssueChange: (index: number, value: string) => void;
  onChronicConditionChange: (index: number, value: string) => void;
}

/**
 * Structured record form component
 * Main form for editing structured medical record data
 * Designed to support insurance claim adjudication
 */
export function StructuredRecordForm({
  structuredData,
  onFieldChange,
  onDiagnosisChange,
  onProcedureChange,
  onMedicationChange,
  onClinicInfoChange,
  onPastMedicalIssueChange,
  onChronicConditionChange,
}: StructuredRecordFormProps): JSX.Element {
  return (
    <div className="column structured-record">
      <h2 className="column-title">Structured Record</h2>
      <div className="structured-content">
        <PetInfoSection
          structuredData={structuredData}
          onFieldChange={onFieldChange}
        />

        <DiagnosesSection
          diagnoses={structuredData.diagnoses}
          onDiagnosisChange={onDiagnosisChange}
        />

        <PastMedicalIssuesSection
          pastMedicalIssues={structuredData.past_medical_issues}
          chronicConditions={structuredData.chronic_conditions}
          onPastMedicalIssueChange={onPastMedicalIssueChange}
          onChronicConditionChange={onChronicConditionChange}
        />

        <ProceduresSection
          procedures={structuredData.procedures}
          onProcedureChange={onProcedureChange}
        />

        <MedicationsSection
          medications={structuredData.medications}
          onMedicationChange={onMedicationChange}
        />

        <FoldableSection title="Symptom Onset Date">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={structuredData.symptom_onset_date || ''}
              onChange={(e) => onFieldChange('symptom_onset_date', e.target.value || null)}
              className="form-input"
            />
          </div>
        </FoldableSection>

        <FoldableSection title="Clinical Notes">
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={structuredData.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              className="form-input"
              rows={4}
              placeholder="Additional clinical notes and observations"
            />
          </div>
        </FoldableSection>

        <ClinicInfoSection
          clinicInfo={structuredData.clinic_info}
          onClinicInfoChange={onClinicInfoChange}
        />
      </div>
    </div>
  );
}


