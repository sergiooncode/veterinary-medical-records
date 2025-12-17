import React, { useState } from 'react';

interface FoldableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function FoldableSection({
  title,
  children,
  defaultExpanded = false,
}: FoldableSectionProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="form-section">
      <h3
        className="section-title foldable-title"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <span className="foldable-icon">{isExpanded ? '▼' : '▶'}</span>
        {title}
      </h3>
      {isExpanded && <div className="foldable-content">{children}</div>}
    </div>
  );
}

