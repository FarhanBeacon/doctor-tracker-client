import apiClient from '@/lib/api';
import { ApiResponse, BloodGroup, Patient, PatientCondition, PatientGender } from '@/types';

export interface PatientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  doctorId?: string;
  gender?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PatientPayload {
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
  doctor: string;
  visitDate?: string;
}

export const patientService = {
  getPatients: async (params: PatientQueryParams) => {
    const { data } = await apiClient.get<ApiResponse<Patient[]>>('/patients', { params });
    return data;
  },

  getPatientById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return data.data;
  },

  createPatient: async (payload: PatientPayload) => {
    const { data } = await apiClient.post<ApiResponse<Patient>>('/patients', payload);
    return data.data;
  },

  updatePatient: async (id: string, payload: Partial<PatientPayload>) => {
    const { data } = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, payload);
    return data.data;
  },

  deletePatient: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/patients/${id}`);
    return data;
  },
};
