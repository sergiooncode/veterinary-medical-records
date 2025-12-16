import React from 'react';

type Status = 'Ready' | 'In Progress' | 'Completed';

interface ProcessingStatusProps {
  status: Status;
}

export function ProcessingStatus({ status }: ProcessingStatusProps): JSX.Element {
  const getStatusClass = (currentStatus: Status): string => {
    switch (currentStatus) {
      case 'Ready':
        return 'status-ready';
      case 'In Progress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      default:
        return 'status-ready';
    }
  };

  return (
    <span className={`status-label ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}



