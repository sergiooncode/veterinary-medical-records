import { Router } from './router';
import { AppShell } from './layouts/AppShell';

/**
 * Main App component
 * Sets up layout and routing
 * Note: Providers and BrowserRouter are set up in main.tsx
 */
export function App(): JSX.Element {
  return (
    <AppShell>
      <Router />
    </AppShell>
  );
}

// Default export for backward compatibility
export default App;

