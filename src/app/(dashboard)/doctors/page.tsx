'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  Users,
  Trash2,
  Eye,
  Pencil,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';
import { doctorService } from '@/services/doctor.service';
import { useDebounce } from '@/hooks/useDebounce';
import { Pagination } from '@/components/ui/Pagination';
import { CreateDoctorModal } from '@/components/features/doctors/CreateDoctorModal';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Doctor } from '@/types';

export default function DoctorsPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [hospital, setHospital] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<{ id: string; name: string } | null>(null);

  const debouncedSearch = useDebounce(search, 350);

  const { data: filterOptions } = useQuery({
    queryKey: ['doctor-filters'],
    queryFn: doctorService.getFilterOptions,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['doctors', { page, search: debouncedSearch, specialization, hospital, startDate, endDate }],
    queryFn: () =>
      doctorService.getDoctors({
        page,
        limit: 8,
        search: debouncedSearch || undefined,
        specialization: specialization !== 'all' ? specialization : undefined,
        hospital: hospital !== 'all' ? hospital : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: doctorService.deleteDoctor,
    onSuccess: () => {
      toast.success('Doctor deleted successfully');
      setDoctorToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    },
  });

  const handleResetFilters = () => {
    setSearch('');
    setSpecialization('all');
    setHospital('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleDelete = (id: string, name: string) => {
    setDoctorToDelete({ id, name });
  };

  const doctors = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, search, filter, and manage doctors and their assigned patients.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDoctorToEdit(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
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
              placeholder="Search by name, hospital, email..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Specialization Filter */}
          <select
            value={specialization}
            onChange={(e) => {
              setSpecialization(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Specializations</option>
            {filterOptions?.specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          {/* Hospital Filter */}
          <select
            value={hospital}
            onChange={(e) => {
              setHospital(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Hospitals</option>
            {filterOptions?.hospitals.map((hosp) => (
              <option key={hosp} value={hosp}>
                {hosp}
              </option>
            ))}
          </select>

          {/* Reset */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>

        {/* Date-Wise Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Date Added:</span>
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
      </div>

      {/* Doctors Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Doctor</th>
                <th className="py-3 px-3">Specialization</th>
                <th className="py-3 px-3">Hospital</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 text-center">Patients</th>
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
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No doctors found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-xs flex items-center justify-center shrink-0">
                          {doc.name.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/doctors/${doc._id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block truncate max-w-[155px]"
                          >
                            {doc.name}
                          </Link>
                          <p className="text-[11px] text-slate-400">
                            Joined {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 max-w-[150px] truncate" title={doc.hospital}>
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.hospital}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 max-w-[175px] truncate" title={doc.email}>
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{doc.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{doc.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <Link
                        href={`/doctors/${doc._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors"
                        title="View assigned patients"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {doc.patientCount ?? 0}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <ActionMenu
                        ariaLabel={`Actions for ${doc.name}`}
                        items={[
                          {
                            label: 'View Patients',
                            href: `/doctors/${doc._id}`,
                            icon: <Eye className="w-3.5 h-3.5" />,
                          },
                          {
                            label: 'Edit Doctor',
                            onClick: () => {
                              setDoctorToEdit(doc);
                              setIsCreateOpen(true);
                            },
                            icon: <Pencil className="w-3.5 h-3.5" />,
                          },
                          {
                            label: 'Delete Doctor',
                            onClick: () => handleDelete(doc._id, doc.name),
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

      <CreateDoctorModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setDoctorToEdit(null);
        }}
        doctorToEdit={doctorToEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(doctorToDelete)}
        onClose={() => setDoctorToDelete(null)}
        onConfirm={() => {
          if (doctorToDelete) {
            deleteMutation.mutate(doctorToDelete.id);
          }
        }}
        isLoading={deleteMutation.isPending}
        title="Delete Doctor"
        description={`Are you sure you want to delete ${doctorToDelete?.name}? All associated patients under this doctor will also be removed.`}
        confirmText="Yes, Delete Doctor"
        variant="danger"
      />
    </div>
  );
}
