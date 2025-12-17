import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PastMedicalIssuesSection } from '@/features/records/components/PastMedicalIssuesSection';

test('renders empty states when no issues or conditions', () => {
  render(
    <PastMedicalIssuesSection
      pastMedicalIssues={[]}
      chronicConditions={[]}
      onPastMedicalIssueChange={jest.fn()}
      onChronicConditionChange={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByText('Past Medical Issues & Chronic Conditions'));

  expect(screen.getByText('No past medical issues recorded')).toBeInTheDocument();
  expect(screen.getByText('No chronic conditions recorded')).toBeInTheDocument();
});

test('calls change handlers when editing inputs', () => {
  const onPastMedicalIssueChange = jest.fn();
  const onChronicConditionChange = jest.fn();

  render(
    <PastMedicalIssuesSection
      pastMedicalIssues={['Dermatitis']}
      chronicConditions={['Arthritis']}
      onPastMedicalIssueChange={onPastMedicalIssueChange}
      onChronicConditionChange={onChronicConditionChange}
    />,
  );

  fireEvent.click(screen.getByText('Past Medical Issues & Chronic Conditions (2)'));

  fireEvent.change(screen.getByDisplayValue('Dermatitis'), {
    target: { value: 'Updated issue' },
  });
  fireEvent.change(screen.getByDisplayValue('Arthritis'), {
    target: { value: 'Updated condition' },
  });

  expect(onPastMedicalIssueChange).toHaveBeenCalledWith(0, 'Updated issue');
  expect(onChronicConditionChange).toHaveBeenCalledWith(0, 'Updated condition');
});


