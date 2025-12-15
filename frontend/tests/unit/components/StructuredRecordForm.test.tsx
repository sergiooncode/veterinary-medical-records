import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StructuredRecordForm } from '@/features/records/components/StructuredRecordForm';
import type { StructuredData } from '@/types';

const baseData: StructuredData = {
  petName: 'Bella',
  species: 'Canine',
  breed: 'Labrador',
  weight: '25 kg',
  diagnoses: [],
  past_medical_issues: [],
  chronic_conditions: [],
  procedures: [],
  medications: [],
  symptom_onset_date: null,
  notes: '',
  clinic_info: {
    name: null,
    address: null,
    phone: null,
    veterinarian: null,
  },
};

test('renders Structured Record header and pet info section', () => {
  const fn = jest.fn();
  render(
    <StructuredRecordForm
      structuredData={baseData}
      onFieldChange={fn}
      onDiagnosisChange={fn as any}
      onProcedureChange={fn as any}
      onMedicationChange={fn as any}
      onClinicInfoChange={fn as any}
      onPastMedicalIssueChange={fn as any}
      onChronicConditionChange={fn as any}
    />,
  );

  expect(screen.getByText('Structured Record')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Bella')).toBeInTheDocument();
});

test('calls onFieldChange when editing notes', () => {
  const onFieldChange = jest.fn();
  render(
    <StructuredRecordForm
      structuredData={baseData}
      onFieldChange={onFieldChange}
      onDiagnosisChange={jest.fn() as any}
      onProcedureChange={jest.fn() as any}
      onMedicationChange={jest.fn() as any}
      onClinicInfoChange={jest.fn() as any}
      onPastMedicalIssueChange={jest.fn() as any}
      onChronicConditionChange={jest.fn() as any}
    />,
  );

  fireEvent.change(
    screen.getByPlaceholderText('Additional clinical notes and observations'),
    { target: { value: 'New note' } },
  );
  expect(onFieldChange).toHaveBeenCalledWith('notes', 'New note');
});


