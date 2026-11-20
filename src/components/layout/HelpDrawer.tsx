'use client';

import React, { useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Stethoscope,
  Users,
  Search,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDrawer({ isOpen, onClose }: HelpDrawerProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <aside className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-600/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">How to Use Doctor Tracker</h2>
              <p className="text-[11px] text-slate-500">Simple step-by-step guide</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            aria-label="Close help drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
          {/* Quick Start Tip */}
          <div className="p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-100 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-indigo-950">
              <strong>Quick Tip:</strong> Click any <strong>name</strong> in a table—or click the{' '}
              <strong>⋮</strong> button on the right—to view full details, edit, or delete a record.
            </p>
          </div>

          {/* Section 1: Dashboard */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              1. Dashboard (Overview &amp; Charts)
            </div>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>
                <strong>Top Summary Cards:</strong> See total Doctors, total Patients, average
                patients per doctor, and Critical Cases at a glance.
              </li>
              <li>
                <strong>Quick Jump:</strong> Click the <strong>Critical Cases</strong> card to open
                the Patients page showing only critical patients.
              </li>
              <li>
                <strong>Charts:</strong> Move your mouse over any bar, line, or slice to see exact
                numbers.
              </li>
            </ul>
          </div>

          {/* Section 2: Doctors */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              2. Managing Doctors
            </div>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>
                <strong>Add a Doctor:</strong> Click <strong>+ Add Doctor</strong> at the top right,
                fill in the details, and save.
              </li>
              <li>
                <strong>Edit or Delete:</strong> Click the <strong>⋮</strong> icon next to any
                doctor to edit their info or remove them.
              </li>
              <li>
                <strong>See a Doctor&apos;s Patients:</strong> Click a doctor&apos;s name (or their
                patient count badge) to see their patient list, add new patients under them, or
                remove patients.
              </li>
            </ul>
          </div>

          {/* Section 3: Patients */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Users className="w-4 h-4 text-indigo-600" />
              3. Managing Patients
            </div>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>
                <strong>View Full Profile:</strong> Click any patient&apos;s name to see their
                vitals (Blood Group, Blood Pressure, Heart Rate), allergies, medications, assigned
                doctor, and emergency contact.
              </li>
              <li>
                <strong>Update or Delete:</strong> Use the <strong>⋮</strong> menu in the table—or
                the buttons on the patient&apos;s profile page—to edit or delete their record.
              </li>
              <li>
                <strong>Condition Colors:</strong>{' '}
                <span className="font-semibold text-emerald-700">Stable</span>,{' '}
                <span className="font-semibold text-rose-700">Critical</span>,{' '}
                <span className="font-semibold text-sky-700">Recovering</span>,{' '}
                <span className="font-semibold text-amber-700">Under Observation</span>.
              </li>
            </ul>
          </div>

          {/* Section 4: Search & Filters */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Search className="w-4 h-4 text-indigo-600" />
              4. Searching &amp; Filtering
            </div>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>
                <strong>Search:</strong> Just start typing a name, phone, or diagnosis—results
                update automatically.
              </li>
              <li>
                <strong>Filters:</strong> Narrow results by Specialization, Hospital, Condition,
                Doctor, Gender, or Date Range.
              </li>
              <li>
                <strong>Clear All:</strong> Click <strong>Reset Filters</strong> anytime to show all
                records again.
              </li>
            </ul>
          </div>

          {/* Section 5: Security */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              5. Signing Out
            </div>
            <p>
              When you are done, click <strong>Sign Out</strong> at the bottom of the left menu to
              safely lock your session.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Press Esc to close</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </aside>
    </div>
  );
}
