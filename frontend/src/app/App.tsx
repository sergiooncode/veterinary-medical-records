import { useRef } from 'react';
import { Router } from './router';
import { AppShell } from './layouts/AppShell';

/**
 * Main App component
 * Sets up layout and routing
 * Note: Providers and BrowserRouter are set up in main.tsx
 */
export function App(): JSX.Element {
  const uploadHandlerRef = useRef<(() => void) | null>(null);

  return (
    <AppShell onUploadClick={() => uploadHandlerRef.current?.()}>
      <Router uploadHandlerRef={uploadHandlerRef} />
    </AppShell>
  );
}

// Default export for backward compatibility
export default App;

