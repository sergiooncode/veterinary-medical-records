import React, { useEffect, useRef, useState } from 'react';
import type { StructuredData, Diagnosis, Procedure, Medication, ClinicInfo } from '../../types';
import { DocumentPreview } from '../../features/workspace/components/DocumentPreview';
import { ExtractedTextPanel } from '../../features/workspace/components/ExtractedTextPanel';
import { StructuredRecordForm } from '../../features/records/components/StructuredRecordForm';
import '../../App.css';

type Status = 'Ready' | 'In Progress' | 'Completed';

interface DocumentsPageProps {
  onStatusChange?: (status: Status) => void;
  uploadHandlerRef?: React.MutableRefObject<(() => void) | null>;
}

export function DocumentsPage({ onStatusChange, uploadHandlerRef }: DocumentsPageProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('Sample Medical Record.pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [structuredData, setStructuredData] = useState<StructuredData>({
    petName: 'Bella',
    species: 'Canine',
    breed: 'Labrador Retriever',
    weight: '25 kg',
    diagnoses: [
      {
        name: 'Otitis externa',
        date: '2024-10-01',
        icd_code: null,
        is_chronic: false,
      },
    ],
    past_medical_issues: ['Allergic dermatitis'],
    chronic_conditions: ['Arthritis'],
    procedures: [
      {
        name: 'Ear cleaning',
        date: '2024-10-01',
        cpt_code: null,
        reason: 'Otitis',
        cost: 120,
      },
    ],
    medications: [
      {
        name: 'Prednisone',
        start_date: '2024-10-02',
        end_date: null,
        dosage: '5 mg',
        frequency: 'SID',
      },
    ],
    symptom_onset_date: '2024-09-28',
    notes: '12 y/o FS Labrador presenting for chronic ear infections. Pruritic, head shaking, and erythematous ear canals.',
    clinic_info: {
      name: 'Happy Paws Veterinary Clinic',
      address: '123 Pet Lane, Petville',
      phone: '555-123-4567',
      veterinarian: 'Dr. Jane Smith',
    },
  });
  const [extractedText] = useState<string>(
    [
      'Bella is a 12-year-old spayed female Labrador Retriever presenting for chronic ear infections.',
      'History of allergic dermatitis managed with diet and intermittent steroids.',
      'On exam: erythematous ear canals with moderate ceruminous discharge, no neurologic deficits.',
      'Assessment: chronic otitis externa, likely secondary to underlying allergic skin disease.',
      'Plan: ear cleaning, topical otic medication, recheck in 2 weeks.',
    ].join('\n\n'),
  );

  const handleInputChange = (field: keyof StructuredData, value: string | null): void => {
    setStructuredData((prev: StructuredData) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDiagnosisChange = (index: number, field: keyof Diagnosis, value: string | boolean | null): void => {
    setStructuredData((prev: StructuredData) => {
      const newDiagnoses = [...prev.diagnoses];
      newDiagnoses[index] = { ...newDiagnoses[index], [field]: value };
      return { ...prev, diagnoses: newDiagnoses };
    });
  };

  const handleProcedureChange = (index: number, field: keyof Procedure, value: string | number | null): void => {
    setStructuredData((prev: StructuredData) => {
      const newProcedures = [...prev.procedures];
      newProcedures[index] = { ...newProcedures[index], [field]: value };
      return { ...prev, procedures: newProcedures };
    });
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string | null): void => {
    setStructuredData((prev: StructuredData) => {
      const newMedications = [...prev.medications];
      newMedications[index] = { ...newMedications[index], [field]: value };
      return { ...prev, medications: newMedications };
    });
  };

  const handleClinicInfoChange = (field: keyof ClinicInfo, value: string | null): void => {
    setStructuredData((prev: StructuredData) => ({
      ...prev,
      clinic_info: { ...prev.clinic_info, [field]: value }
    }));
  };

  const handlePastMedicalIssueChange = (index: number, value: string): void => {
    setStructuredData((prev: StructuredData) => {
      const newIssues = [...prev.past_medical_issues];
      newIssues[index] = value;
      return { ...prev, past_medical_issues: newIssues };
    });
  };

  const handleChronicConditionChange = (index: number, value: string): void => {
    setStructuredData((prev: StructuredData) => {
      const newConditions = [...prev.chronic_conditions];
      newConditions[index] = value;
      return { ...prev, chronic_conditions: newConditions };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setFileName(file.name);
  };

  useEffect(() => {
    if (uploadHandlerRef) {
      uploadHandlerRef.current = () => {
        fileInputRef.current?.click();
      };
    }
    return () => {
      if (uploadHandlerRef) {
        uploadHandlerRef.current = null;
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [uploadHandlerRef, previewUrl]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <main className="main-content">
        <div className="three-column-layout">
          <div className="column left-column">
            <DocumentPreview
              previewUrl={previewUrl}
              fileName={fileName}
              selectedFile={selectedFile}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
          <div className="column center-column">
            <ExtractedTextPanel extractedText={extractedText} />
          </div>

          <div className="column right-column">
            <StructuredRecordForm
              structuredData={structuredData}
              onFieldChange={handleInputChange}
              onDiagnosisChange={handleDiagnosisChange}
              onProcedureChange={handleProcedureChange}
              onMedicationChange={handleMedicationChange}
              onClinicInfoChange={handleClinicInfoChange}
              onPastMedicalIssueChange={handlePastMedicalIssueChange}
              onChronicConditionChange={handleChronicConditionChange}
            />
          </div>
        </div>
      </main>
    </>
  );
}