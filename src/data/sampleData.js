// Sample data used the first time the app is opened (or after "Reset demo data").
// Attendance is generated with a seeded random generator so the demo is
// identical on every machine.

export const CLASSES = ['CSE-A', 'CSE-B', 'ECE-A'];

export const sampleStudents = [
  { id: 's1', rollNo: '23CS001', name: 'Aarav Sharma', className: 'CSE-A', email: 'aarav.sharma@college.edu' },
  { id: 's2', rollNo: '23CS002', name: 'Diya Patel', className: 'CSE-A', email: 'diya.patel@college.edu' },
  { id: 's3', rollNo: '23CS003', name: 'Rohan Das', className: 'CSE-A', email: 'rohan.das@college.edu' },
  { id: 's4', rollNo: '23CS004', name: 'Sneha Mohanty', className: 'CSE-A', email: 'sneha.mohanty@college.edu' },
  { id: 's5', rollNo: '23CS031', name: 'Karthik Iyer', className: 'CSE-B', email: 'karthik.iyer@college.edu' },
  { id: 's6', rollNo: '23CS032', name: 'Ananya Rao', className: 'CSE-B', email: 'ananya.rao@college.edu' },
  { id: 's7', rollNo: '23CS033', name: 'Vikram Singh', className: 'CSE-B', email: 'vikram.singh@college.edu' },
  { id: 's8', rollNo: '23CS034', name: 'Priya Nair', className: 'CSE-B', email: 'priya.nair@college.edu' },
  { id: 's9', rollNo: '23EC001', name: 'Arjun Reddy', className: 'ECE-A', email: 'arjun.reddy@college.edu' },
  { id: 's10', rollNo: '23EC002', name: 'Meera Pillai', className: 'ECE-A', email: 'meera.pillai@college.edu' },
  { id: 's11', rollNo: '23EC003', name: 'Sahil Khan', className: 'ECE-A', email: 'sahil.khan@college.edu' },
  { id: 's12', rollNo: '23EC004', name: 'Ishita Behera', className: 'ECE-A', email: 'ishita.behera@college.edu' },
];

// Probability that each student is present on a given day.
const presenceRate = {
  s1: 0.95, s2: 0.88, s3: 0.62, s4: 0.9, s5: 0.7, s6: 0.97,
  s7: 0.55, s8: 0.85, s9: 0.8, s10: 0.93, s11: 0.66, s12: 0.89,
};

// Small deterministic pseudo-random generator (mulberry32).
function seededRandom(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Returns the last `count` weekdays ending on or before `endDate` (YYYY-MM-DD).
function lastWeekdays(endDate, count) {
  const days = [];
  const d = new Date(`${endDate}T00:00:00`);
  while (days.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      // Format with local date parts (toISOString would shift the day in IST).
      const iso = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
      ].join('-');
      days.unshift(iso);
    }
    d.setDate(d.getDate() - 1);
  }
  return days;
}

export function buildSampleRecords(endDate = '2026-10-07', count = 20) {
  const rand = seededRandom(2026);
  const records = {};
  lastWeekdays(endDate, count).forEach((date) => {
    records[date] = {};
    sampleStudents.forEach((s) => {
      const r = rand();
      const rate = presenceRate[s.id];
      if (r < rate - 0.06) records[date][s.id] = 'P';
      else if (r < rate) records[date][s.id] = 'L';
      else records[date][s.id] = 'A';
    });
  });
  return records;
}
