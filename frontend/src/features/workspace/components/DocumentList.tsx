import React, { useEffect, useState } from 'react';
import type { Document } from '../../../types';

interface DocumentListProps {
  onDocumentSelect?: (documentId: string) => void;
  refreshKey?: number;
}

export function DocumentList({ onDocumentSelect, refreshKey }: DocumentListProps): JSX.Element {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async (): Promise<void> => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/documents`);
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.statusText}`);
        }
        const data = await response.json();
        setDocuments(data.documents || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="document-list-section">
        <h2 className="column-title">Documents</h2>
        <div className="document-list-content">
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-list-section">
        <h2 className="column-title">Documents</h2>
        <div className="document-list-content">
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-list-section">
      <h2 className="column-title">Documents ({documents.length})</h2>
      <div className="document-list-content">
        {documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents found. Upload a document to get started.</p>
          </div>
        ) : (
          <ul className="document-list">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="document-list-item"
                onClick={() => onDocumentSelect?.(doc.id)}
              >
                <div className="document-item-name">{doc.filename}</div>
                <div className="document-item-meta">
                  <span className={`status-badge status-${doc.status}`}>
                    {doc.status}
                  </span>
                  {doc.created_at && (
                    <span className="document-item-date">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

