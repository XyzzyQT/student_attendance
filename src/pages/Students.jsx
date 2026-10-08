import { useMemo, useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import StudentForm from '../components/StudentForm';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import { getStudentStats } from '../utils/attendance';

export default function Students() {
  const { students, records, classes, threshold, deleteStudent } = useAttendance();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students
      .filter((s) => classFilter === 'All' || s.className === classFilter)
      .filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      )
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo))
      .map((s) => ({ ...s, stats: getStudentStats(s.id, records) }));
  }, [students, records, search, classFilter]);

  const startEdit = (student) => {
    setEditing(student);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Students</h1>
          <p className="muted">Add, edit, search and remove students.</p>
        </div>
      </div>

      <StudentForm key={editing?.id ?? 'new'} editing={editing} onDone={() => setEditing(null)} />

      <div className="card">
        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search by name, roll no or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="All">All classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="muted small">{filtered.length} of {students.length} students</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No students found.">Try a different search or add a new student above.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll no</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th className="hide-sm">Email</th>
                  <th>Attendance</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className={editing?.id === s.id ? 'row-editing' : ''}>
                    <td className="mono">{s.rollNo}</td>
                    <td>{s.name}</td>
                    <td><span className="tag">{s.className}</span></td>
                    <td className="hide-sm muted">{s.email || '—'}</td>
                    <td className="min-180">
                      {s.stats.total ? (
                        <ProgressBar percentage={s.stats.percentage} threshold={threshold} />
                      ) : (
                        <span className="muted small">No sessions yet</span>
                      )}
                    </td>
                    <td className="right nowrap">
                      <button className="btn btn-sm btn-ghost" onClick={() => startEdit(s)}>Edit</button>
                      <button className="btn btn-sm btn-danger-ghost" onClick={() => setToDelete(s)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete student?"
          message={`${toDelete.name} (${toDelete.rollNo}) and all of their attendance records will be removed.`}
          onCancel={() => setToDelete(null)}
          onConfirm={() => {
            deleteStudent(toDelete.id);
            if (editing?.id === toDelete.id) setEditing(null);
            setToDelete(null);
          }}
        />
      )}
    </section>
  );
}
