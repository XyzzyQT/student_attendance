import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CLASSES, sampleStudents, buildSampleRecords } from '../data/sampleData';

const STORAGE_KEY = 'sat-data-v1';
const AttendanceContext = createContext(null);

function loadInitialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.students)) return saved;
  } catch {
    /* corrupt or blocked storage – fall back to demo data */
  }
  return {
    students: sampleStudents,
    records: buildSampleRecords(),
    classes: CLASSES,
    threshold: 75,
  };
}

export function AttendanceProvider({ children }) {
  const initial = useMemo(loadInitialState, []);
  const [students, setStudents] = useState(initial.students);
  const [records, setRecords] = useState(initial.records);
  const [classes] = useState(initial.classes);
  const [threshold, setThreshold] = useState(initial.threshold);
  const [toast, setToast] = useState(null);

  // Persist every change to localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ students, records, classes, threshold })
      );
    } catch {
      /* storage may be unavailable (private mode) – app still works in memory */
    }
  }, [students, records, classes, threshold]);

  // Auto-hide toast messages after 2.5 seconds.
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const addStudent = (data) => {
    const student = { ...data, id: `s${Date.now()}` };
    setStudents((prev) => [...prev, student]);
    notify(`${student.name} added.`);
  };

  const updateStudent = (id, data) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    notify('Student details updated.');
  };

  const deleteStudent = (id) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Remove the student's marks from every session too.
    setRecords((prev) => {
      const next = {};
      Object.entries(prev).forEach(([date, day]) => {
        const { [id]: _removed, ...rest } = day;
        next[date] = rest;
      });
      return next;
    });
    notify(`${student?.name ?? 'Student'} deleted.`, 'info');
  };

  /** Merge marks for one date (only the given students are overwritten). */
  const saveAttendance = (date, marks) => {
    setRecords((prev) => ({ ...prev, [date]: { ...(prev[date] || {}), ...marks } }));
    notify(`Attendance saved for ${Object.keys(marks).length} students.`);
  };

  const resetDemoData = () => {
    setStudents(sampleStudents);
    setRecords(buildSampleRecords());
    setThreshold(75);
    notify('Demo data restored.', 'info');
  };

  const value = {
    students,
    records,
    classes,
    threshold,
    setThreshold,
    addStudent,
    updateStudent,
    deleteStudent,
    saveAttendance,
    resetDemoData,
    toast,
    notify,
  };

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used inside AttendanceProvider');
  return ctx;
}
