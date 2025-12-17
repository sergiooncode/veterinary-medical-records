import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MedicationsSection } from '@/features/records/components/MedicationsSection';
import type { Medication } from '@/types';

const medications: Medication[] = [
  {
    name: 'Prednisone',
    start_date: '2024-10-02',
    end_date: null,
    dosage: '5 mg',
    frequency: 'SID',
  },
];

test('renders medications count and fields', () => {
  const onMedicationChange = jest.fn();
  render(<MedicationsSection medications={medications} onMedicationChange={onMedicationChange} />);

  expect(screen.getByText('Medications (1)')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('Medications (1)'));
  expect(screen.getByDisplayValue('Prednisone')).toBeInTheDocument();
});

test('calls onMedicationChange when frequency changes', () => {
  const onMedicationChange = jest.fn();
  render(<MedicationsSection medications={medications} onMedicationChange={onMedicationChange} />);

  fireEvent.click(screen.getByText('Medications (1)'));
  fireEvent.change(screen.getByPlaceholderText('e.g., Twice daily'), { target: { value: 'BID' } });
  expect(onMedicationChange).toHaveBeenCalledWith(0, 'frequency', 'BID');
});


