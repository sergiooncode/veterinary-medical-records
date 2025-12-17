import React from 'react';
import { FoldableSection } from '../../../shared/ui/FoldableSection';

interface PastMedicalIssuesSectionProps {
  pastMedicalIssues: string[];
  chronicConditions: string[];
  onPastMedicalIssueChange: (index: number, value: string) => void;
  onChronicConditionChange: (index: number, value: string) => void;
}

export function PastMedicalIssuesSection({
  pastMedicalIssues,
  chronicConditions,
  onPastMedicalIssueChange,
  onChronicConditionChange,
}: PastMedicalIssuesSectionProps): JSX.Element {
  const totalCount = pastMedicalIssues.length + chronicConditions.length;

  return (
    <FoldableSection
      title={`Past Medical Issues & Chronic Conditions${totalCount > 0 ? ` (${totalCount})` : ''}`}
    >

      <div className="form-subsection">
        <h4 className="subsection-title">Past Medical Issues ({pastMedicalIssues.length})</h4>
        {pastMedicalIssues.length === 0 ? (
          <p className="empty-state">No past medical issues recorded</p>
        ) : (
          <div className="list-items">
            {pastMedicalIssues.map((issue, index) => (
              <div className="list-item-card" key={index}>
                <div className="form-group">
                  <label>Past Medical Issue</label>
                  <input
                    type="text"
                    value={issue}
                    onChange={(e) => onPastMedicalIssueChange(index, e.target.value)}
                    className="form-input"
                    placeholder="Enter past medical issue"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-subsection">
        <h4 className="subsection-title">Chronic Conditions (from notes) ({chronicConditions.length})</h4>
        {chronicConditions.length === 0 ? (
          <p className="empty-state">No chronic conditions recorded</p>
        ) : (
          <div className="list-items">
            {chronicConditions.map((condition, index) => (
              <div className="list-item-card" key={index}>
                <div className="form-group">
                  <label>Chronic Condition</label>
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => onChronicConditionChange(index, e.target.value)}
                    className="form-input"
                    placeholder="Enter chronic condition"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FoldableSection>
  );
}

