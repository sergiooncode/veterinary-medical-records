import React from 'react';
import '../../styles/AppShell.css';

type Status = 'Ready' | 'In Progress' | 'Completed';

interface AppShellProps {
  status?: Status;
  onUploadClick?: () => void;
  children: React.ReactNode;
}

/**
 * Main application shell layout
 * Contains the header/navbar and the main content area
 */
export function AppShell({ children }: AppShellProps): JSX.Element {
  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-left">
          <h1 className="navbar-title">Vet Medical Record Workspace</h1>
        </div>
      </nav>
      <div className="app-body">
        {children}
      </div>
    </div>
  );
}



