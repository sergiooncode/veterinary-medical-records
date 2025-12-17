import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PetInfoSection } from '@/features/records/components/PetInfoSection';
import type { StructuredData } from '@/types';

const data: StructuredData = {
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

test('renders pet fields and updates via onFieldChange', () => {
  const onFieldChange = jest.fn();
  render(<PetInfoSection structuredData={data} onFieldChange={onFieldChange} />);

  fireEvent.click(screen.getByText('Pet Information'));

  expect(screen.getByDisplayValue('Bella')).toBeInTheDocument();

  fireEvent.change(screen.getByDisplayValue('25 kg'), { target: { value: '26 kg' } });
  expect(onFieldChange).toHaveBeenCalledWith('weight', '26 kg');
});


