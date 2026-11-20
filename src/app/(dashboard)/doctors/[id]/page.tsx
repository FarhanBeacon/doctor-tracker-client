'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Plus,
  Search,
  Eye,
  Trash2,
  Users,
  Calendar,
} from 'lucide-react';
import { doctorService } from '@/services/doctor.service';
import { useDebounce } from '@/hooks/useDebounce';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { Pagination } from '@/components/ui/Pagination';
import { AddPatientToDoctorModal } from '@/components/features/doctors/AddPatientToDoctorModal';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function DoctorDetailPage() {
  const params = useParams();
  const doctorId = params.id as string;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [patientToRemove, setPatientToRemove] = useState<{ id: string; name: string } | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['doctor-detail', doctorId, { page, search: debouncedSearch, condition }],
    queryFn: () =>
      doctorService.getDoctorById(doctorId, {
        page,
        limit: 8,
        search: debouncedSearch || undefined,
        condition: condition !== 'all' ? condition : undefined,
      }),
    placeholderData: keepPreviousData,
    enabled: Boolean(doctorId),
  });

  const removePatientMutation = useMutation({
    mutationFn: (patientId: string) => doctorService.deletePatientFromDoctor(doctorId, patientId),
    onSuccess: () => {
      toast.success('Patient removed from doctor list');
      setPatientToRemove(null);
      queryClient.invalidateQueries({ queryKey: ['doctor-detail', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove patient');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-36 bg-white rounded-2xl border border-slate-200" />
        <div className="h-72 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (isError || !data?.data?.doctor) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <p className="font-semibold text-slate-800">Doctor record not found.</p>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Doctors
        </Link>
      </div>
    );
  }

  const { doctor, patients } = data.data;
  const meta = data.meta;

  return (
    <div className="space-y-6">
      <Link
        href="/doctors"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Doctors
      </Link>

      {/* Doctor Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            {doctor.name.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                {doctor.specialization}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {doctor.hospital}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {doctor.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {doctor.phone}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </button>
      </div>

      {/* Assigned Patients Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Assigned Patients ({meta?.total ?? patients.length})
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search patient..."
                className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Conditions</option>
              <option value="Stable">Stable</option>
              <option value="Critical">Critical</option>
              <option value="Recovering">Recovering</option>
              <option value="Under Observation">Under Observation</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Patient</th>
                <th className="py-3 px-3">Age / Gender</th>
                <th className="py-3 px-3">Condition</th>
                <th className="py-3 px-3">Diagnosis</th>
                <th className="py-3 px-3">Visit Date</th>
                <th className="py-3 px-3 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No patients assigned to this doctor matching your filters.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        href={`/patients/${patient._id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
                      >
                        {patient.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{patient.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {patient.age} yrs &bull; {patient.gender}
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
                            label: 'Remove Patient',
                            onClick: () =>
                              setPatientToRemove({ id: patient._id, name: patient.name }),
                            icon: <Trash2 className="w-3.5 h-3.5" />,
                            variant: 'danger',
                            dividerBefore: true,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination meta={meta} onPageChange={setPage} isFetching={isFetching} />
      </div>

      <AddPatientToDoctorModal
        doctorId={doctor._id}
        doctorName={doctor.name}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(patientToRemove)}
        onClose={() => setPatientToRemove(null)}
        onConfirm={() => {
          if (patientToRemove) {
            removePatientMutation.mutate(patientToRemove.id);
          }
        }}
        isLoading={removePatientMutation.isPending}
        title="Remove Patient"
        description={`Are you sure you want to remove ${patientToRemove?.name} from ${doctor.name}'s assigned patients?`}
        confirmText="Yes, Remove"
        variant="danger"
      />
    </div>
  );
}
