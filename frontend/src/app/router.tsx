import type { MutableRefObject } from 'react';
import { DocumentsPage } from '../pages/documents/DocumentsPage';

interface RouterProps {
  uploadHandlerRef?: MutableRefObject<(() => void) | null>;
  onStatusChange?: (status: 'Ready' | 'In Progress' | 'Completed') => void;
}

/**
 * Router configuration
 * Placeholder for future routing setup (React Router, etc.)
 */
export function Router({ uploadHandlerRef, onStatusChange }: RouterProps): JSX.Element {
  // For now, just render the DocumentsPage
  // This will be replaced with actual routing logic
  return (
    <DocumentsPage uploadHandlerRef={uploadHandlerRef} onStatusChange={onStatusChange} />
  );
}

