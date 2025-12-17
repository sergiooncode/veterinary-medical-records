import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiagnosesSection } from '@/features/records/components/DiagnosesSection';
import type { Diagnosis } from '@/types';

const diagnoses: Diagnosis[] = [
  { name: 'Otitis', date: '2024-10-01', icd_code: 'H60.9', is_chronic: false },
];

test('renders diagnoses count and fields', () => {
  const onDiagnosisChange = jest.fn();
  render(<DiagnosesSection diagnoses={diagnoses} onDiagnosisChange={onDiagnosisChange} />);

  expect(screen.getByText('Diagnoses (1)')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('Diagnoses (1)'));
  expect(screen.getByDisplayValue('Otitis')).toBeInTheDocument();
});

test('calls onDiagnosisChange when toggling chronic condition', () => {
  const onDiagnosisChange = jest.fn();
  render(<DiagnosesSection diagnoses={diagnoses} onDiagnosisChange={onDiagnosisChange} />);

  fireEvent.click(screen.getByText('Diagnoses (1)'));
  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);
  expect(onDiagnosisChange).toHaveBeenCalledWith(0, 'is_chronic', true);
});


