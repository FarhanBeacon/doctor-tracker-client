'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Stethoscope,
  Users,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { analyticsService } from '@/services/analytics.service';
import { ConditionBadge } from '@/components/ui/ConditionBadge';

const CONDITION_COLORS: Record<string, string> = {
  Stable: '#10b981',
  Critical: '#f43f5e',
  Recovering: '#0ea5e9',
  'Under Observation': '#f59e0b',
};

const SPEC_COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: analyticsService.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-56 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 p-6" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3">
        <p className="text-rose-600 font-semibold">Failed to load dashboard analytics.</p>
        <p className="text-sm text-slate-500">
          Make sure your backend server is running on port 5000.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, patientsPerDoctor, patientsByCondition, doctorsBySpecialization, dateStats, recentPatients } =
    data;

  const kpiCards = [
    {
      title: 'Total Doctors',
      value: summary.totalDoctors,
      subtitle: 'Active specialists',
      icon: Stethoscope,
      iconBg: 'bg-indigo-50 text-indigo-600',
      href: '/doctors',
    },
    {
      title: 'Total Patients',
      value: summary.totalPatients,
      subtitle: 'Registered records',
      icon: Users,
      iconBg: 'bg-sky-50 text-sky-600',
      href: '/patients',
    },
    {
      title: 'Avg Patients / Doctor',
      value: summary.avgPatientsPerDoctor,
      subtitle: 'Workload balance',
      icon: Activity,
      iconBg: 'bg-emerald-50 text-emerald-600',
      href: '/doctors',
    },
    {
      title: 'Critical Cases',
      value: summary.criticalPatients,
      subtitle: 'Requires priority care',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600',
      href: '/patients?condition=Critical',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time overview of doctors, patient volume, and clinical distribution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Manage Doctors
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/patients"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-colors"
          >
            Manage Patients
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{card.title}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-3 tracking-tight">{card.value}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">{card.subtitle}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date-Based Statistics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Date-Based Registration Trends</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly growth of registered patients and onboarded doctors
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              Timeline
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dateStats} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="patients"
                  name="Patients"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPatients)"
                />
                <Area
                  type="monotone"
                  dataKey="doctors"
                  name="Doctors"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDoctors)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patients Per Doctor */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">Patients per Doctor</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Top doctors by assigned patient count
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={patientsPerDoctor.map((d) => ({
                  ...d,
                  shortName: d.name.replace(/^Dr\.\s*/i, '').split(' ')[0],
                }))}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="shortName" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: any) => [`${value} Patients`, 'Assigned']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                />
                <Bar dataKey="patientCount" name="Patients" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients by Condition Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-base font-semibold text-slate-900">Patients by Condition</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">Clinical status distribution</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientsByCondition}
                  dataKey="count"
                  nameKey="condition"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {patientsByCondition.map((entry) => (
                    <Cell
                      key={entry.condition}
                      fill={CONDITION_COLORS[entry.condition] || '#6366f1'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctors by Specialization */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-base font-semibold text-slate-900">Doctors by Specialization</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">Departmental distribution</p>

          <div className="space-y-3.5 mt-2">
            {doctorsBySpecialization.map((spec, idx) => {
              const pct = summary.totalDoctors > 0 ? Math.round((spec.count / summary.totalDoctors) * 100) : 0;
              return (
                <div key={spec.specialization} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{spec.specialization}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {spec.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: SPEC_COLORS[idx % SPEC_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Patients</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest admissions</p>
            </div>
            <Link href="/patients" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {recentPatients.map((patient) => {
              const docName =
                typeof patient.doctor === 'object' && patient.doctor !== null
                  ? patient.doctor.name
                  : 'Assigned Doctor';
              return (
                <div
                  key={patient._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{patient.name}</p>
                    <p className="text-xs text-slate-500 truncate">{docName}</p>
                  </div>
                  <ConditionBadge condition={patient.condition} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
