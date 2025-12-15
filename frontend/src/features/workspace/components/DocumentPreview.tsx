import React from 'react';

interface DocumentPreviewProps {
  previewUrl: string | null;
  fileName: string;
  selectedFile: File | null;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function DocumentPreview({ previewUrl, fileName, selectedFile, currentPage, onPageChange }: DocumentPreviewProps): JSX.Element {
  const isImageFile = (file: File | null): boolean => {
    return file !== null && file.type.startsWith('image/');
  };

  const isPdfFile = (file: File | null): boolean => {
    return file !== null && file.type === 'application/pdf';
  };

   const isDocxFile = (file: File | null, name: string): boolean => {
     if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
       return true;
     }
     return /\.docx?$/i.test(name);
   };

  const isImage = isImageFile(selectedFile);

  return (
    <div className="document-preview-section">
      <h2 className="column-title">Document Preview</h2>
      <div className="document-info">
        <div className="filename">{fileName || <span className="filename-placeholder">No file selected</span>}</div>
      </div>
      <div className={`document-view ${isImage ? 'image-mode' : ''}`}>
        {previewUrl ? (
          <>
            {isImageFile(selectedFile) ? (
              <img 
                src={previewUrl} 
                alt="Document preview" 
                className="document-image"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  console.error('Error loading image');
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : isPdfFile(selectedFile) || isDocxFile(selectedFile, fileName) ? (
              <iframe
                src={previewUrl}
                title="Document preview"
                className="document-iframe"
              />
            ) : (
              <div className="document-placeholder">
                <p>Preview not supported yet.</p>
                <p className="document-placeholder-hint">
                  Supported preview: Images (JPG, PNG) and PDFs
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="document-page">
            <div className="document-placeholder">
              <p>No document uploaded</p>
              <p className="document-placeholder-hint">
                Upload a document to see preview
              </p>
            </div>
          </div>
        )}
      </div>
      {previewUrl && (
        <div className="page-thumbnails">
          <div className={`thumbnail ${currentPage === 1 ? 'active' : ''}`} onClick={() => onPageChange(1)}>
            <div className="thumbnail-content"></div>
            <span className="thumbnail-number">1</span>
          </div>
          <div className={`thumbnail ${currentPage === 2 ? 'active' : ''}`} onClick={() => onPageChange(2)}>
            <div className="thumbnail-content"></div>
            <span className="thumbnail-number">2</span>
          </div>
          <div className={`thumbnail ${currentPage === 3 ? 'active' : ''}`} onClick={() => onPageChange(3)}>
            <div className="thumbnail-content"></div>
            <span className="thumbnail-number">3</span>
          </div>
        </div>
      )}
    </div>
  );
}



