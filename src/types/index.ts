export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt?: string;
}

export interface AuthResponse {
  admin: AdminUser;
  token: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PatientCondition = 'Stable' | 'Critical' | 'Recovering' | 'Under Observation';
export type PatientGender = 'Male' | 'Female' | 'Other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  bloodGroup?: BloodGroup;
  bloodPressure?: string;
  heartRate?: number;
  allergies?: string;
  emergencyContact?: string;
  medications?: string;
  condition: PatientCondition;
  diagnosis?: string;
  doctor: string | Pick<Doctor, '_id' | 'name' | 'specialization' | 'hospital'> & {
    phone?: string;
    email?: string;
  };
  visitDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardAnalytics {
  summary: {
    totalDoctors: number;
    totalPatients: number;
    avgPatientsPerDoctor: number;
    criticalPatients: number;
  };
  patientsPerDoctor: Array<{
    _id: string;
    name: string;
    specialization: string;
    hospital: string;
    patientCount: number;
  }>;
  patientsByCondition: Array<{
    condition: PatientCondition;
    count: number;
  }>;
  doctorsBySpecialization: Array<{
    specialization: string;
    count: number;
  }>;
  dateStats: Array<{
    month: string;
    patients: number;
    doctors: number;
  }>;
  recentPatients: Patient[];
}
