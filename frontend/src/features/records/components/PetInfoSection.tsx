import React from 'react';
import type { StructuredData } from '../../../types';
import { FoldableSection } from '../../../shared/ui/FoldableSection';

interface PetInfoSectionProps {
  structuredData: StructuredData;
  onFieldChange: (field: keyof StructuredData, value: string | null) => void;
}

/**
 * Pet information section component
 * Displays and allows editing of pet information fields
 */
export function PetInfoSection({ structuredData, onFieldChange }: PetInfoSectionProps): JSX.Element {
  return (
    <FoldableSection title="Pet Information">
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={structuredData.petName}
          onChange={(e) => onFieldChange('petName', e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Species</label>
        <input
          type="text"
          value={structuredData.species}
          onChange={(e) => onFieldChange('species', e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Breed</label>
        <input
          type="text"
          value={structuredData.breed}
          onChange={(e) => onFieldChange('breed', e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Weight</label>
        <input
          type="text"
          value={structuredData.weight}
          onChange={(e) => onFieldChange('weight', e.target.value)}
          className="form-input"
        />
      </div>
    </FoldableSection>
  );
}


