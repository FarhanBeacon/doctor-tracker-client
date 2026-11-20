'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { doctorService } from '@/services/doctor.service';
import { Doctor } from '@/types';

const doctorFormSchema = z.object({
  name: z.string().trim().min(2, 'Doctor name must be at least 2 characters'),
  specialization: z.string().trim().min(2, 'Specialization is required'),
  hospital: z.string().trim().min(2, 'Hospital name is required'),
  phone: z.string().trim().min(6, 'Valid phone number is required'),
  email: z.string().trim().email('Valid email address is required'),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface CreateDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorToEdit?: Doctor | null;
}

export function CreateDoctorModal({ isOpen, onClose, doctorToEdit }: CreateDoctorModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(doctorToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
  });

  useEffect(() => {
    if (doctorToEdit) {
      reset({
        name: doctorToEdit.name,
        specialization: doctorToEdit.specialization,
        hospital: doctorToEdit.hospital,
        phone: doctorToEdit.phone,
        email: doctorToEdit.email,
      });
    } else {
      reset({
        name: '',
        specialization: '',
        hospital: '',
        phone: '',
        email: '',
      });
    }
  }, [doctorToEdit, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (values: DoctorFormValues) => {
      if (isEditing && doctorToEdit) {
        return doctorService.updateDoctor(doctorToEdit._id, values);
      }
      return doctorService.createDoctor(values);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Doctor updated successfully' : 'Doctor added successfully');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-filters'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-detail'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save doctor');
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Doctor Information' : 'Add New Doctor'}
      description={
        isEditing
          ? 'Update the doctor’s profile, hospital, or contact details.'
          : 'Register a new doctor to the healthcare portal.'
      }
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            placeholder="e.g., Dr. Sarah Mitchell"
            {...register('name')}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Specialization *</label>
            <input
              type="text"
              placeholder="e.g., Cardiology"
              {...register('specialization')}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {errors.specialization && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.specialization.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Hospital *</label>
            <input
              type="text"
              placeholder="e.g., Metro Heart Institute"
              {...register('hospital')}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {errors.hospital && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.hospital.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone *</label>
            <input
              type="text"
              placeholder="+1-555-0199"
              {...register('phone')}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              placeholder="doctor@hospital.org"
              {...register('email')}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
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
            {isEditing ? 'Save Changes' : 'Create Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
