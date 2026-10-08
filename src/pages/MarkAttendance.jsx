import { useEffect, useMemo, useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import EmptyState from '../components/EmptyState';
import { STATUS, formatDate, todayISO } from '../utils/attendance';

export default function MarkAttendance() {
  const { students, records, classes, saveAttendance } = useAttendance();
  const [date, setDate] = useState(todayISO());
  const [className, setClassName] = useState(classes[0] ?? '');
  const [marks, setMarks] = useState({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => s.className === className)
        .sort((a, b) => a.rollNo.localeCompare(b.rollNo)),
    [students, className]
  );

  // Load existing marks when the date or class changes.
  useEffect(() => {
    const existing = records[date] || {};
    const loaded = {};
    classStudents.forEach((s) => {
      if (existing[s.id]) loaded[s.id] = existing[s.id];
    });
    setMarks(loaded);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, className, classStudents]);

  const alreadyRecorded = classStudents.some((s) => records[date]?.[s.id]);
  const visible = classStudents.filter((s) => {
    const q = search.trim().toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
  });

  const counts = { P: 0, L: 0, A: 0 };
  Object.values(marks).forEach((m) => (counts[m] += 1));
  const unmarked = classStudents.length - Object.keys(marks).length;

  const setMark = (id, status) => setMarks((prev) => ({ ...prev, [id]: status }));
  const markAll = (status) =>
    setMarks(Object.fromEntries(classStudents.map((s) => [s.id, status])));

  const handleSave = (e) => {
    e.preventDefault();
    if (!date) return setError('Please choose a date.');
    if (date > todayISO()) return setError('Attendance cannot be recorded for a future date.');
    if (!className) return setError('Please choose a class.');
    if (classStudents.length === 0) return setError('This class has no students yet.');
    if (unmarked > 0)
      return setError(`${unmarked} student${unmarked > 1 ? 's are' : ' is'} not marked yet.`);
    setError('');
    saveAttendance(date, marks);
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Mark Attendance</h1>
          <p className="muted">Choose a date and class, then mark each student.</p>
        </div>
      </div>

      <form className="card" onSubmit={handleSave} noValidate>
        <div className="toolbar">
          <label className="field inline">
            <span>Date</span>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field inline">
            <span>Class</span>
            <select value={className} onChange={(e) => setClassName(e.target.value)}>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <input
            className="search"
            type="search"
            placeholder="Find a student…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {date && (
          <p className={`notice ${alreadyRecorded ? 'notice-info' : ''}`}>
            {alreadyRecorded
              ? `Attendance for ${className} on ${formatDate(date)} was already saved — you are editing it.`
              : `New session: ${className} on ${formatDate(date)}.`}
          </p>
        )}

        <div className="bulk-bar">
          <div className="counts">
            <span className="pill pill-P">Present {counts.P}</span>
            <span className="pill pill-L">Late {counts.L}</span>
            <span className="pill pill-A">Absent {counts.A}</span>
            <span className="pill">Unmarked {unmarked}</span>
          </div>
          <div className="bulk-actions">
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => markAll('P')}>All present</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => markAll('A')}>All absent</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setMarks({})}>Clear</button>
          </div>
        </div>

        {classStudents.length === 0 ? (
          <EmptyState title="No students in this class.">Add students from the Students page first.</EmptyState>
        ) : (
          <ul className="mark-list">
            {visible.map((s) => (
              <li key={s.id} className={marks[s.id] ? `marked-${marks[s.id]}` : 'unmarked'}>
                <div className="mark-student">
                  <span className="mono small muted">{s.rollNo}</span>
                  <strong>{s.name}</strong>
                </div>
                <div className="segmented" role="radiogroup" aria-label={`Status for ${s.name}`}>
                  {Object.entries(STATUS).map(([key, { label }]) => (
                    <button
                      type="button"
                      key={key}
                      role="radio"
                      aria-checked={marks[s.id] === key}
                      className={`seg seg-${key} ${marks[s.id] === key ? 'on' : ''}`}
                      onClick={() => setMark(s.id, key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save attendance</button>
        </div>
      </form>
    </section>
  );
}
