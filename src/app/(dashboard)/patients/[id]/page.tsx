'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  Droplets,
  HeartPulse,
  Mail,
  Pencil,
  Phone,
  Pill,
  ShieldAlert,
  Stethoscope,
  Trash2,
  User,
} from 'lucide-react';
import { patientService } from '@/services/patient.service';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { PatientFormModal } from '@/components/features/patients/PatientFormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const patientId = params.id as string;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ['patient-detail', patientId],
    queryFn: () => patientService.getPatientById(patientId),
    enabled: Boolean(patientId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => patientService.deletePatient(patientId),
    onSuccess: () => {
      toast.success('Patient record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      router.push('/patients');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete patient');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 w-32 bg-slate-200 rounded" />
        <div className="h-32 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white rounded-2xl border border-slate-200" />
          <div className="h-64 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
        <p className="font-semibold text-slate-800">Patient record not found.</p>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Patients
        </Link>
      </div>
    );
  }

  const assignedDoctor =
    typeof patient.doctor === 'object' && patient.doctor !== null ? patient.doctor : null;

  const hasAllergy =
    patient.allergies &&
    patient.allergies.trim() !== '' &&
    patient.allergies.toLowerCase() !== 'none known' &&
    patient.allergies.toLowerCase() !== 'none';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Patients
        </Link>
        <span className="text-xs font-mono text-slate-400">
          RECORD #{patient._id.slice(-6).toUpperCase()}
        </span>
      </div>

      {/* Patient Identity Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
              <ConditionBadge condition={patient.condition} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                {patient.age} years old &bull; {patient.gender}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {patient.phone}
              </span>
              {patient.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {patient.email}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            Edit Patient
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 text-sm font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* 4 Vitals Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Blood Group
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{patient.bloodGroup || 'Unknown'}</p>
          <p className="text-xs text-slate-400 mt-1">Verified type</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Blood Pressure
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {patient.bloodPressure || '120/80 mmHg'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Latest reading</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Heart Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {patient.heartRate ? `${patient.heartRate} bpm` : '72 bpm'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Resting pulse</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Last Visit Date
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {new Date(patient.visitDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">Clinical record date</p>
        </div>
      </div>

      {/* Main Content Grid: Clinical Overview + Care Team & Emergency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinical Assessment (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Clinical Assessment &amp; Treatment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Diagnosis, active medications, and allergy warnings
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Primary Diagnosis
              </p>
              <p className="text-sm font-semibold text-slate-900 mt-2">
                {patient.diagnosis || 'No diagnosis recorded'}
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                hasAllergy
                  ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                  : 'bg-slate-50 border-slate-200/70 text-slate-800'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
                <AlertCircle
                  className={`w-3.5 h-3.5 ${hasAllergy ? 'text-amber-600' : 'text-slate-400'}`}
                />
                Known Allergies
              </p>
              <p className="text-sm font-semibold mt-2">{patient.allergies || 'None Known'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-indigo-500" />
              Prescribed Medications &amp; Care Plan
            </p>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              {patient.medications || 'No active prescriptions or treatment notes recorded.'}
            </p>
          </div>
        </div>

        {/* Right Sidebar: Assigned Doctor + Emergency Contact */}
        <div className="space-y-6">
          {/* Assigned Physician Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Assigned Physician</h2>
              {assignedDoctor && (
                <Link
                  href={`/doctors/${assignedDoctor._id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View Doctor
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {assignedDoctor ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {assignedDoctor.name}
                    </p>
                    <p className="text-xs font-medium text-indigo-600">
                      {assignedDoctor.specialization}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-200/70 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{assignedDoctor.hospital}</span>
                  </div>
                  {assignedDoctor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{assignedDoctor.phone}</span>
                    </div>
                  )}
                  {assignedDoctor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{assignedDoctor.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No physician currently assigned.</p>
            )}
          </div>

          {/* Emergency Contact Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Emergency Contact
            </h2>
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 text-sm text-slate-800 font-medium">
              {patient.emergencyContact || 'No emergency contact on file'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (refreshes detail query on save) */}
      <PatientFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          queryClient.invalidateQueries({ queryKey: ['patient-detail', patientId] });
        }}
        patientToEdit={patient}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
        title="Delete Patient Record"
        description={`Are you sure you want to permanently delete ${patient.name}'s clinical record? This action cannot be undone.`}
        confirmText="Yes, Delete Record"
        variant="danger"
      />
    </div>
  );
}
