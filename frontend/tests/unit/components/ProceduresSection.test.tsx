import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProceduresSection } from '@/features/records/components/ProceduresSection';
import type { Procedure } from '@/types';

const procedures: Procedure[] = [
  { name: 'X-Ray', date: '2024-10-01', cpt_code: '80048', reason: 'Lameness', cost: 200 },
];

test('renders procedures count and fields', () => {
  const onProcedureChange = jest.fn();
  render(<ProceduresSection procedures={procedures} onProcedureChange={onProcedureChange} />);

  expect(screen.getByText('Procedures (1)')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('Procedures (1)'));
  expect(screen.getByDisplayValue('X-Ray')).toBeInTheDocument();
});

test('calls onProcedureChange when cost changes', () => {
  const onProcedureChange = jest.fn();
  render(<ProceduresSection procedures={procedures} onProcedureChange={onProcedureChange} />);

  fireEvent.click(screen.getByText('Procedures (1)'));
  fireEvent.change(screen.getByDisplayValue('200'), { target: { value: '250' } });
  expect(onProcedureChange).toHaveBeenCalledWith(0, 'cost', 250);
});


