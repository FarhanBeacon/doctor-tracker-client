import apiClient from '@/lib/api';
import { ApiResponse, BloodGroup, Doctor, Patient, PatientCondition, PatientGender } from '@/types';

export interface DoctorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDoctorPayload {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export interface AddDoctorPatientPayload {
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
  visitDate?: string;
}

export const doctorService = {
  getDoctors: async (params: DoctorQueryParams) => {
    const { data } = await apiClient.get<ApiResponse<Doctor[]>>('/doctors', { params });
    return data;
  },

  getFilterOptions: async () => {
    const { data } = await apiClient.get<ApiResponse<{ specializations: string[]; hospitals: string[] }>>(
      '/doctors/filters'
    );
    return data.data;
  },

  createDoctor: async (payload: CreateDoctorPayload) => {
    const { data } = await apiClient.post<ApiResponse<Doctor>>('/doctors', payload);
    return data.data;
  },

  updateDoctor: async (id: string, payload: Partial<CreateDoctorPayload>) => {
    const { data } = await apiClient.put<ApiResponse<Doctor>>(`/doctors/${id}`, payload);
    return data.data;
  },

  getDoctorById: async (
    id: string,
    params?: { page?: number; limit?: number; search?: string; condition?: string }
  ) => {
    const { data } = await apiClient.get<ApiResponse<{ doctor: Doctor; patients: Patient[] }>>(
      `/doctors/${id}`,
      { params }
    );
    return data;
  },

  deleteDoctor: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/doctors/${id}`);
    return data;
  },

  addPatientToDoctor: async (doctorId: string, payload: AddDoctorPatientPayload) => {
    const { data } = await apiClient.post<ApiResponse<Patient>>(
      `/doctors/${doctorId}/patients`,
      payload
    );
    return data.data;
  },

  deletePatientFromDoctor: async (doctorId: string, patientId: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/doctors/${doctorId}/patients/${patientId}`
    );
    return data;
  },
};
