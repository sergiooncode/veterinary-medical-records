import React from 'react';
import type { ClinicInfo } from '../../../types';
import { FoldableSection } from '../../../shared/ui/FoldableSection';

interface ClinicInfoSectionProps {
  clinicInfo: ClinicInfo;
  onClinicInfoChange: (field: keyof ClinicInfo, value: string | null) => void;
}

export function ClinicInfoSection({ clinicInfo, onClinicInfoChange }: ClinicInfoSectionProps): JSX.Element {
  return (
    <FoldableSection title="Clinic Information">
      <div className="form-group">
        <label>Clinic Name</label>
        <input
          type="text"
          value={clinicInfo.name || ''}
          onChange={(e) => onClinicInfoChange('name', e.target.value || null)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Address</label>
        <input
          type="text"
          value={clinicInfo.address || ''}
          onChange={(e) => onClinicInfoChange('address', e.target.value || null)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input
          type="text"
          value={clinicInfo.phone || ''}
          onChange={(e) => onClinicInfoChange('phone', e.target.value || null)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Veterinarian</label>
        <input
          type="text"
          value={clinicInfo.veterinarian || ''}
          onChange={(e) => onClinicInfoChange('veterinarian', e.target.value || null)}
          className="form-input"
        />
      </div>
    </FoldableSection>
  );
}

