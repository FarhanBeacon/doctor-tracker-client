'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { doctorService } from '@/services/doctor.service';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const;

const addPatientSchema = z.object({
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
  visitDate: z.string().optional(),
});

type AddPatientForm = z.infer<typeof addPatientSchema>;

interface AddPatientToDoctorModalProps {
  doctorId: string;
  doctorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddPatientToDoctorModal({
  doctorId,
  doctorName,
  isOpen,
  onClose,
}: AddPatientToDoctorModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddPatientForm>({
    resolver: zodResolver(addPatientSchema),
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

  const mutation = useMutation({
    mutationFn: (payload: AddPatientForm) => doctorService.addPatientToDoctor(doctorId, payload),
    onSuccess: () => {
      toast.success(`Patient added under ${doctorName}`);
      queryClient.invalidateQueries({ queryKey: ['doctor-detail', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add patient');
    },
  });

  const inputClass =
    'w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500';
  const labelClass = 'block text-xs font-medium text-slate-700 mb-1';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Patient to Doctor"
      description={`Assigning new patient directly under ${doctorName}.`}
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={labelClass}>Patient Name *</label>
            <input type="text" placeholder="e.g., John Doe" {...register('name')} className={inputClass} />
            {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Age *</label>
              <input type="number" placeholder="35" {...register('age', { valueAsNumber: true })} className={inputClass} />
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100">
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
            <input type="number" placeholder="72" {...register('heartRate', { valueAsNumber: true })} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={labelClass}>Allergies</label>
            <input type="text" placeholder="None Known" {...register('allergies')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Emergency Contact</label>
            <input type="text" placeholder="Family • +1-555-0999" {...register('emergencyContact')} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100">
          <div>
            <label className={labelClass}>Condition *</label>
            <select {...register('condition')} className={inputClass}>
              <option value="Stable">Stable</option>
              <option value="Critical">Critical</option>
              <option value="Recovering">Recovering</option>
              <option value="Under Observation">Under Observation</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Visit Date</label>
            <input type="date" {...register('visitDate')} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Diagnosis</label>
          <input type="text" placeholder="e.g., Hypertension follow-up" {...register('diagnosis')} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Prescribed Medications / Plan</label>
          <textarea rows={2} placeholder="Medication dosage & instructions..." {...register('medications')} className={inputClass} />
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
            Add Patient
          </button>
        </div>
      </form>
    </Modal>
  );
}
