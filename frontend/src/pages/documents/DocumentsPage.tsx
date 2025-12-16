import React, { useEffect, useRef, useState } from 'react';
import type { StructuredData, Diagnosis, Procedure, Medication, ClinicInfo } from '../../types';
import { DocumentList } from '../../features/workspace/components/DocumentList';
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
  const [documentsRefreshKey, setDocumentsRefreshKey] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('Sample Medical Record.pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [structuredData, setStructuredData] = useState<StructuredData>({
    petName: '',
    species: '',
    breed: '',
    weight: '',
    diagnoses: [],
    past_medical_issues: [],
    chronic_conditions: [],
    procedures: [],
    medications: [],
    symptom_onset_date: null,
    notes: '',
    clinic_info: {
      name: null,
      address: null,
      phone: null,
      veterinarian: null,
    },
  });
  const [extractedText, setExtractedText] = useState<string>(
    [
      'No file has been loaded yet.',
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

  const handleDocumentSelect = async (documentId: string): Promise<void> => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${apiUrl}/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`);
      }
      const data = await response.json();

      setFileName(data.filename || '');
      if (data.extracted_text) {
        setExtractedText(data.extracted_text);
      }
      if (data.structured_data) {
        const sd = data.structured_data;
        setStructuredData({
          petName: sd.pet_name || '',
          species: sd.species || '',
          breed: sd.breed || '',
          weight: sd.weight || '',
          diagnoses: sd.diagnoses || [],
          past_medical_issues: sd.past_medical_issues || [],
          chronic_conditions: sd.chronic_conditions || [],
          procedures: sd.procedures || [],
          medications: sd.medications || [],
          symptom_onset_date: sd.symptom_onset_date || null,
          notes: sd.notes || '',
          clinic_info: sd.clinic_info || { name: null, address: null, phone: null, veterinarian: null },
        });
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setFileName(file.name);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const formData = new FormData();
    formData.append('file', file);

    try {
      if (onStatusChange) onStatusChange('In Progress');
      const uploadResponse = await fetch(`${apiUrl}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();

      const processResponse = await fetch(`${apiUrl}/api/documents/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: uploadData.id }),
      });
      const processData = await processResponse.json();

      if (processData.extracted_text) {
        setExtractedText(processData.extracted_text);
      }
      if (processData.structured_data) {
        const sd = processData.structured_data;
        setStructuredData({
          petName: sd.pet_name || '',
          species: sd.species || '',
          breed: sd.breed || '',
          weight: sd.weight || '',
          diagnoses: sd.diagnoses || [],
          past_medical_issues: sd.past_medical_issues || [],
          chronic_conditions: sd.chronic_conditions || [],
          procedures: sd.procedures || [],
          medications: sd.medications || [],
          symptom_onset_date: sd.symptom_onset_date || null,
          notes: sd.notes || '',
          clinic_info: sd.clinic_info || { name: null, address: null, phone: null, veterinarian: null },
        });
      }
      setDocumentsRefreshKey((prev) => prev + 1);
      if (onStatusChange) onStatusChange('Completed');
    } catch (error) {
      console.error('Upload/process error:', error);
      if (onStatusChange) onStatusChange('Ready');
    }
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
        <div className="four-column-layout">
          <div className="column leftmost-column">
            <DocumentList onDocumentSelect={handleDocumentSelect} refreshKey={documentsRefreshKey} />
          </div>
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