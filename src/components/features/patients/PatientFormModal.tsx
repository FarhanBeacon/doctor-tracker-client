'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { Patient } from '@/types';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const;

const patientFormSchema = z.object({
  name: z.string().trim().min(2, 'Patient name must be at least 2 characters'),
  age: z.number().int().min(0, 'Invalid age').max(150, 'Invalid age'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().trim().min(6, 'Valid phone number is required'),
  email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  bloodPressure: z.string().trim().optional(),
  heartRate: z.number().int().min(20, 'Min 20').max(250, 'Max 250').optional(),
  allergies: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
  medications: z.string().trim().optional(),
  condition: z.enum(['Stable', 'Critical', 'Recovering', 'Under Observation']),
  diagnosis: z.string().trim().optional(),
  doctor: z.string().min(1, 'Please select an assigned doctor'),
  visitDate: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
}

export function PatientFormModal({ isOpen, onClose, patientToEdit }: PatientFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(patientToEdit);

  const { data: doctorsRes } = useQuery({
    queryKey: ['doctors-dropdown'],
    queryFn: () => doctorService.getDoctors({ page: 1, limit: 100 }),
    enabled: isOpen,
  });

  const doctorsList = doctorsRes?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      gender: 'Male',
      condition: 'Stable',
      bloodGroup: 'Unknown',
      bloodPressure: '120/80 mmHg',
      heartRate: 72,
      allergies: 'None Known',
      visitDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (patientToEdit) {
      const doctorId =
        typeof patientToEdit.doctor === 'object' && patientToEdit.doctor !== null
          ? patientToEdit.doctor._id
          : patientToEdit.doctor;

      reset({
        name: patientToEdit.name,
        age: patientToEdit.age,
        gender: patientToEdit.gender,
        phone: patientToEdit.phone,
        email: patientToEdit.email || '',
        bloodGroup: patientToEdit.bloodGroup || 'Unknown',
        bloodPressure: patientToEdit.bloodPressure || '120/80 mmHg',
        heartRate: patientToEdit.heartRate || 72,
        allergies: patientToEdit.allergies || 'None Known',
        emergencyContact: patientToEdit.emergencyContact || '',
        medications: patientToEdit.medications || '',
        condition: patientToEdit.condition,
        diagnosis: patientToEdit.diagnosis || '',
        doctor: doctorId || '',
        visitDate: patientToEdit.visitDate
          ? new Date(patientToEdit.visitDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      reset({
        name: '',
        age: 30,
        gender: 'Male',
        phone: '',
        email: '',
        bloodGroup: 'Unknown',
        bloodPressure: '120/80 mmHg',
        heartRate: 72,
        allergies: 'None Known',
        emergencyContact: '',
        medications: '',
        condition: 'Stable',
        diagnosis: '',
        doctor: doctorsList[0]?._id || '',
        visitDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [patientToEdit, isOpen, reset, doctorsList.length]);

  const mutation = useMutation({
    mutationFn: (values: PatientFormValues) => {
      if (isEditing && patientToEdit) {
        return patientService.updatePatient(patientToEdit._id, values);
      }
      return patientService.createPatient(values);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Patient updated successfully' : 'Patient created successfully');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-detail'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save patient');
    },
  });

  const inputClass =
    'w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500';
  const labelClass = 'block text-xs font-medium text-slate-700 mb-1';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Patient Information' : 'Add New Patient'}
      description={
        isEditing
          ? 'Update patient vitals, clinical details, or assigned doctor.'
          : 'Register a new patient and assign them to a doctor.'
      }
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
        {/* Section 1: Basic Information */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" placeholder="e.g., Liam Thompson" {...register('name')} className={inputClass} />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Age *</label>
                <input type="number" {...register('age', { valueAsNumber: true })} className={inputClass} />
                {errors.age && <p className="text-[11px] text-rose-600 mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Gender *</label>
                <select {...register('gender')} className={inputClass}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Phone *</label>
              <input type="text" placeholder="+1-555-0299" {...register('phone')} className={inputClass} />
              {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" placeholder="patient@example.com" {...register('email')} className={inputClass} />
              {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Vitals & Emergency */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Vitals &amp; Emergency Contact
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className={labelClass}>Blood Group</label>
              <select {...register('bloodGroup')} className={inputClass}>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Blood Pressure</label>
              <input type="text" placeholder="120/80 mmHg" {...register('bloodPressure')} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Heart Rate (bpm)</label>
              <input
                type="number"
                placeholder="72"
                {...register('heartRate', { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.heartRate && <p className="text-[11px] text-rose-600 mt-1">{errors.heartRate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelClass}>Known Allergies</label>
              <input type="text" placeholder="e.g., Penicillin, None Known" {...register('allergies')} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Emergency Contact</label>
              <input type="text" placeholder="e.g., Spouse • +1-555-0999" {...register('emergencyContact')} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section 3: Clinical Assignment */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Clinical Details &amp; Assignment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className={labelClass}>Assigned Doctor *</label>
              <select {...register('doctor')} className={inputClass}>
                <option value="">Select a doctor...</option>
                {doctorsList.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
              {errors.doctor && <p className="text-[11px] text-rose-600 mt-1">{errors.doctor.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Condition *</label>
              <select {...register('condition')} className={inputClass}>
                <option value="Stable">Stable</option>
                <option value="Critical">Critical</option>
                <option value="Recovering">Recovering</option>
                <option value="Under Observation">Under Observation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelClass}>Diagnosis</label>
              <input type="text" placeholder="e.g., Chronic Migraine" {...register('diagnosis')} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Visit Date</label>
              <input type="date" {...register('visitDate')} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Prescribed Medications / Treatment Plan</label>
            <textarea
              rows={2}
              placeholder="e.g., Lisinopril 10mg once daily, follow-up in 2 weeks"
              {...register('medications')}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
          >
            {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Add Patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
