import { useRef, useState } from 'react';
import { Router } from './router';
import { AppShell } from './layouts/AppShell';

type Status = 'Ready' | 'In Progress' | 'Completed';

export function App(): JSX.Element {
  const uploadHandlerRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<Status>('Ready');

  return (
    <AppShell status={status} onUploadClick={() => uploadHandlerRef.current?.()}>
      <Router uploadHandlerRef={uploadHandlerRef} onStatusChange={setStatus} />
    </AppShell>
  );
}

// Default export for backward compatibility
export default App;

