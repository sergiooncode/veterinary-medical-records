import React from 'react';
import '../../styles/AppShell.css';
import { ProcessingStatus } from '../../features/workspace/components/ProcessingStatus';

type Status = 'Ready' | 'In Progress' | 'Completed';

interface AppShellProps {
  status?: Status;
  onUploadClick?: () => void;
  children: React.ReactNode;
}

export function AppShell({ children, onUploadClick, status }: AppShellProps): JSX.Element {
  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-left">
          <h1 className="navbar-title">Vet Medical Record Workspace</h1>
        </div>
        <div className="navbar-right">
          {status && <ProcessingStatus status={status} />}
          <button className="upload-button" type="button" onClick={onUploadClick}>
            Upload Document
          </button>
        </div>
      </nav>
      <div className="app-body">
        {children}
      </div>
    </div>
  );
}



