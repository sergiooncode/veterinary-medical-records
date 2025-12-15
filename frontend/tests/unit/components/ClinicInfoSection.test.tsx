import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClinicInfoSection } from '@/features/records/components/ClinicInfoSection';
import type { ClinicInfo } from '@/types';

const clinicInfo: ClinicInfo = {
  name: 'Happy Paws',
  address: '123 Pet Lane',
  phone: '555-123-4567',
  veterinarian: 'Dr. Jane Smith',
};

test('renders clinic info fields and updates via onClinicInfoChange', () => {
  const onClinicInfoChange = jest.fn();
  render(<ClinicInfoSection clinicInfo={clinicInfo} onClinicInfoChange={onClinicInfoChange} />);

  expect(screen.getByDisplayValue('Happy Paws')).toBeInTheDocument();

  const phoneInput = screen.getByDisplayValue('555-123-4567');
  fireEvent.change(phoneInput, { target: { value: '555-000-0000' } });
  expect(onClinicInfoChange).toHaveBeenCalledWith('phone', '555-000-0000');
});


