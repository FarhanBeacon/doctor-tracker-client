'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Users,
  Stethoscope,
} from 'lucide-react';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { useDebounce } from '@/hooks/useDebounce';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { Pagination } from '@/components/ui/Pagination';
import { PatientFormModal } from '@/components/features/patients/PatientFormModal';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Patient } from '@/types';

function PatientsContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialCondition = searchParams.get('condition') || 'all';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState(initialCondition);
  const [doctorId, setDoctorId] = useState('all');
  const [gender, setGender] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const urlCondition = searchParams.get('condition');
    if (urlCondition) {
      setCondition(urlCondition);
      setPage(1);
    }
  }, [searchParams]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<{ id: string; name: string } | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  const { data: doctorsRes } = useQuery({
    queryKey: ['doctors-dropdown'],
    queryFn: () => doctorService.getDoctors({ page: 1, limit: 100 }),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'patients',
      { page, search: debouncedSearch, condition, doctorId, gender, startDate, endDate },
    ],
    queryFn: () =>
      patientService.getPatients({
        page,
        limit: 8,
        search: debouncedSearch || undefined,
        condition: condition !== 'all' ? condition : undefined,
        doctorId: doctorId !== 'all' ? doctorId : undefined,
        gender: gender !== 'all' ? gender : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: patientService.deletePatient,
    onSuccess: () => {
      toast.success('Patient deleted successfully');
      setPatientToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete patient');
    },
  });

  const handleReset = () => {
    setSearch('');
    setCondition('all');
    setDoctorId('all');
    setGender('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const openCreateModal = () => {
    setPatientToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsModalOpen(true);
  };

  const patients = data?.data || [];
  const meta = data?.meta;
  const doctorsList = doctorsRes?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            View, search, filter by clinical condition or date, edit, and manage all patients.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search patient name, phone, diagnosis..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Condition Filter */}
          <select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Conditions</option>
            <option value="Stable">Stable</option>
            <option value="Critical">Critical</option>
            <option value="Recovering">Recovering</option>
            <option value="Under Observation">Under Observation</option>
          </select>

          {/* Doctor Filter */}
          <select
            value={doctorId}
            onChange={(e) => {
              setDoctorId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Doctors</option>
            {doctorsList.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name}
              </option>
            ))}
          </select>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>

        {/* Date-Wise & Gender Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-medium text-slate-700">Visit Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-indigo-500"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Gender:</span>
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Patient</th>
                <th className="py-3 px-3">Assigned Doctor</th>
                <th className="py-3 px-3">Condition</th>
                <th className="py-3 px-3">Diagnosis</th>
                <th className="py-3 px-3">Visit Date</th>
                <th className="py-3 px-3 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {isLoading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={6} className="py-3.5 px-4">
                      <div className="h-5 bg-slate-100 rounded-md w-full" />
                    </td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No patients found</p>
                    <p className="text-xs mt-1">Try adjusting your search or condition/date filters.</p>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => {
                  const docObj =
                    typeof patient.doctor === 'object' && patient.doctor !== null
                      ? patient.doctor
                      : null;

                  return (
                    <tr key={patient._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/patients/${patient._id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                        >
                          {patient.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {patient.age} yrs &bull; {patient.gender}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {docObj ? (
                          <Link
                            href={`/doctors/${docObj._id}`}
                            className="group inline-flex flex-col"
                          >
                            <span className="font-medium text-slate-800 group-hover:text-indigo-600 inline-flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              {docObj.name}
                            </span>
                            <span className="text-[11px] text-slate-400">{docObj.specialization}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ConditionBadge condition={patient.condition} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                        {patient.diagnosis || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(patient.visitDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <ActionMenu
                          ariaLabel={`Actions for ${patient.name}`}
                          items={[
                            {
                              label: 'View Details',
                              href: `/patients/${patient._id}`,
                              icon: <Eye className="w-3.5 h-3.5" />,
                            },
                            {
                              label: 'Edit Patient',
                              onClick: () => openEditModal(patient),
                              icon: <Pencil className="w-3.5 h-3.5" />,
                            },
                            {
                              label: 'Delete Patient',
                              onClick: () =>
                                setPatientToDelete({ id: patient._id, name: patient.name }),
                              icon: <Trash2 className="w-3.5 h-3.5" />,
                              variant: 'danger',
                              dividerBefore: true,
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination meta={meta} onPageChange={setPage} isFetching={isFetching} />
      </div>

      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientToEdit={patientToEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(patientToDelete)}
        onClose={() => setPatientToDelete(null)}
        onConfirm={() => {
          if (patientToDelete) {
            deleteMutation.mutate(patientToDelete.id);
          }
        }}
        isLoading={deleteMutation.isPending}
        title="Delete Patient Record"
        description={`Are you sure you want to permanently delete the patient record for ${patientToDelete?.name}? This action cannot be undone.`}
        confirmText="Yes, Delete Record"
        variant="danger"
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading patients...</div>}>
      <PatientsContent />
    </Suspense>
  );
}
