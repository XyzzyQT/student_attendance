// Pure helper functions for attendance calculations and validation.

export const STATUS = {
  P: { label: 'Present', short: 'P' },
  L: { label: 'Late', short: 'L' },
  A: { label: 'Absent', short: 'A' },
};

/** Today's date as YYYY-MM-DD in the browser's local time zone. */
export const todayISO = () => {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/**
 * Attendance summary for one student.
 * "Late" is counted as attended. Only sessions where the student was
 * marked (i.e. sessions held for their class) count towards the total.
 */
export function getStudentStats(studentId, records, { from, to } = {}) {
  let present = 0;
  let late = 0;
  let absent = 0;

  Object.entries(records).forEach(([date, day]) => {
    if (from && date < from) return;
    if (to && date > to) return;
    const status = day[studentId];
    if (status === 'P') present += 1;
    else if (status === 'L') late += 1;
    else if (status === 'A') absent += 1;
  });

  const total = present + late + absent;
  const attended = present + late;
  const percentage = total === 0 ? 0 : Math.round((attended / total) * 1000) / 10;
  return { present, late, absent, total, attended, percentage };
}

/** Classes needed in a row to reach the threshold (0 if already above). */
export function classesNeeded({ attended, total }, threshold) {
  const t = threshold / 100;
  if (total === 0 || attended / total >= t) return 0;
  if (t >= 1) return Infinity;
  return Math.ceil((t * total - attended) / (1 - t));
}

export function getStatusBand(percentage, threshold) {
  if (percentage >= threshold + 10) return 'good';
  if (percentage >= threshold) return 'warning';
  return 'danger';
}

/** Client-side validation for the student form. Returns an errors object. */
export function validateStudent(values, students, editingId) {
  const errors = {};
  const rollNo = values.rollNo.trim().toUpperCase();
  const name = values.name.trim();
  const email = values.email.trim();

  if (!rollNo) errors.rollNo = 'Roll number is required.';
  else if (!/^[A-Z0-9]{4,10}$/.test(rollNo))
    errors.rollNo = 'Use 4–10 letters or digits only (e.g. 23CS001).';
  else if (students.some((s) => s.rollNo === rollNo && s.id !== editingId))
    errors.rollNo = 'This roll number already exists.';

  if (!name) errors.name = 'Name is required.';
  else if (!/^[A-Za-z][A-Za-z .'-]{1,49}$/.test(name))
    errors.name = 'Name should be 2–50 letters (spaces, dot, apostrophe allowed).';

  if (!values.className) errors.className = 'Please select a class.';

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    errors.email = 'Enter a valid email address.';

  return errors;
}

/** Download data as a CSV file in the browser. */
export function downloadCSV(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
