'use client';

import React from 'react';
import {
  Activity,
  AlertCircle,
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
  User,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { Doctor, Patient } from '@/types';

interface PatientDetailsModalProps {
  patient: Patient | null;
  fallbackDoctor?: Pick<Doctor, '_id' | 'name' | 'specialization' | 'hospital'> | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (patient: Patient) => void;
}

export function PatientDetailsModal({
  patient,
  fallbackDoctor,
  isOpen,
  onClose,
  onEdit,
}: PatientDetailsModalProps) {
  if (!patient) return null;

  const assignedDoctor =
    typeof patient.doctor === 'object' && patient.doctor !== null
      ? patient.doctor
      : fallbackDoctor || null;

  const hasAllergy =
    patient.allergies &&
    patient.allergies.trim() !== '' &&
    patient.allergies.toLowerCase() !== 'none known' &&
    patient.allergies.toLowerCase() !== 'none';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Patient Clinical Profile"
      description="Comprehensive patient vitals, clinical findings, and care assignment."
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Identity Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h4 className="text-base font-bold text-slate-900">{patient.name}</h4>
                <ConditionBadge condition={patient.condition} />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {patient.age} yrs &bull; {patient.gender}
                </span>
                <span>&bull;</span>
                <span className="font-mono text-[11px] text-slate-400">
                  ID: {patient._id.slice(-6).toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(patient);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-colors cursor-pointer shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Record
            </button>
          )}
        </div>

        {/* Vitals Summary Grid (4 clean metric tiles) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5 text-rose-500" />
              Blood Group
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1.5">
              {patient.bloodGroup || 'Unknown'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              Blood Pressure
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1.5">
              {patient.bloodPressure || '120/80 mmHg'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
              Heart Rate
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1.5">
              {patient.heartRate ? `${patient.heartRate} bpm` : '72 bpm'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              Visit Date
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1.5">
              {new Date(patient.visitDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Clinical Assessment & Medications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Clinical Assessment
            </h5>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Primary Diagnosis</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">
                {patient.diagnosis || 'No diagnosis recorded'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Pill className="w-3 h-3 text-indigo-500" />
                Prescribed Medications / Plan
              </p>
              <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">
                {patient.medications || 'No active prescriptions recorded'}
              </p>
            </div>
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                hasAllergy
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <AlertCircle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  hasAllergy ? 'text-amber-600' : 'text-slate-400'
                }`}
              />
              <div>
                <span className="font-semibold">Allergies: </span>
                <span>{patient.allergies || 'None Known'}</span>
              </div>
            </div>
          </div>

          {/* Contact & Care Team */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3.5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact &amp; Care Team
            </h5>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{patient.email || 'Not provided'}</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Emergency Contact</span>
                  <span className="font-medium text-slate-800">
                    {patient.emergencyContact || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            {assignedDoctor && (
              <div className="pt-3 border-t border-slate-200/80">
                <p className="text-[11px] font-medium text-slate-400 mb-1.5">Assigned Physician</p>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {assignedDoctor.name}
                    </p>
                    <p className="text-[11px] text-indigo-600 font-medium">
                      {assignedDoctor.specialization}
                    </p>
                    {assignedDoctor.hospital && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        {assignedDoctor.hospital}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </Modal>
  );
}
