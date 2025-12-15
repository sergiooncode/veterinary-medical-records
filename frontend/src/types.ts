// Diagnosis with date for pre-existing condition evaluation
export interface Diagnosis {
  name: string;
  date: string | null; // ISO date string
  icd_code: string | null; // ICD-10 code if available
  is_chronic: boolean; // Indicates if this is a chronic condition
}

// Procedure with date for waiting period evaluation
export interface Procedure {
  name: string;
  date: string | null; // ISO date string
  cpt_code: string | null; // CPT code if available
  reason: string | null; // Reason for procedure
  cost: number | null; // Cost if included in document
}

// Medication with history for pre-existing condition evaluation
export interface Medication {
  name: string;
  start_date: string | null; // ISO date string
  end_date: string | null; // ISO date string, null if ongoing
  dosage: string | null;
  frequency: string | null;
}

// Clinic information
export interface ClinicInfo {
  name: string | null;
  address: string | null;
  phone: string | null;
  veterinarian: string | null;
}

export interface StructuredData {
  // Pet Information
  petName: string;
  species: string;
  breed: string;
  weight: string;
  
  // Diagnoses (array to support multiple diagnoses with dates)
  diagnoses: Diagnosis[];
  
  // Past medical issues / chronic conditions (from notes)
  past_medical_issues: string[];
  chronic_conditions: string[];
  
  // Procedures (with dates for waiting period evaluation)
  procedures: Procedure[];
  
  // Medications (with history for pre-existing condition evaluation)
  medications: Medication[];
  
  // Symptom onset date (for waiting period evaluation)
  symptom_onset_date: string | null;
  
  // Clinical notes
  notes: string;
  
  // Clinic information
  clinic_info: ClinicInfo;
  
  // Legacy fields for backward compatibility (will be deprecated)
  diagnosis?: string; // Use diagnoses array instead
}

export interface Document {
  id: string;
  filename: string;
  document_type: string;
  created_at: string | null;
  updated_at: string | null;
  status: 'processed' | 'uploaded';
}

export interface DocumentListResponse {
  documents: Document[];
  count: number;
}

export interface DocumentDetail {
  file_id: string;
  filename: string;
  extracted_text: string | null;
  structured_data: StructuredData | null;
  status: 'processed' | 'uploaded';
}

export interface UploadResponse {
  id: string;
  filename: string;
  saved_filename: string;
  size: number;
  content_type: string;
  message: string;
}


