import React from 'react';

interface ExtractedTextPanelProps {
  extractedText: string;
}

/**
 * Extracted text panel component
 * Displays the extracted text from processed documents
 */
export function ExtractedTextPanel({ extractedText }: ExtractedTextPanelProps): JSX.Element {
  return (
    <div className="extracted-text-section">
      <h2 className="column-title">Extracted Text</h2>
      <div className="extracted-content">
        {extractedText ? (
          <div className="extracted-text-content">
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {extractedText}
            </pre>
          </div>
        ) : (
          <div className="text-placeholder">
            <p>No text extracted yet. Upload and process a document to see extracted text.</p>
          </div>
        )}
      </div>
    </div>
  );
}



