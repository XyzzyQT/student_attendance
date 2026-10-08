import { useMemo, useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { classesNeeded, downloadCSV, getStudentStats } from '../utils/attendance';

const SORTS = {
  pctAsc: { label: 'Attendance: low → high', fn: (a, b) => a.percentage - b.percentage },
  pctDesc: { label: 'Attendance: high → low', fn: (a, b) => b.percentage - a.percentage },
  roll: { label: 'Roll number', fn: (a, b) => a.rollNo.localeCompare(b.rollNo) },
  name: { label: 'Name', fn: (a, b) => a.name.localeCompare(b.name) },
};

export default function Reports() {
  const { students, records, classes, threshold, setThreshold, resetDemoData } = useAttendance();
  const [classFilter, setClassFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('pctAsc');
  const [onlyLow, setOnlyLow] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const rangeError = from && to && from > to ? '“From” date must be before the “To” date.' : '';

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const range = rangeError ? {} : { from, to };
    return students
      .filter((s) => classFilter === 'All' || s.className === classFilter)
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q))
      .map((s) => {
        const stats = getStudentStats(s.id, records, range);
        return { ...s, ...stats, needed: classesNeeded(stats, threshold) };
      })
      .filter((s) => !onlyLow || (s.total > 0 && s.percentage < threshold))
      .sort(SORTS[sortBy].fn);
  }, [students, records, classFilter, search, sortBy, onlyLow, from, to, threshold, rangeError]);

  const lowCount = rows.filter((r) => r.total > 0 && r.percentage < threshold).length;

  const exportCSV = () => {
    downloadCSV('attendance-report.csv', [
      ['Roll No', 'Name', 'Class', 'Present', 'Late', 'Absent', 'Total', 'Percentage', 'Status'],
      ...rows.map((r) => [
        r.rollNo, r.name, r.className, r.present, r.late, r.absent, r.total,
        r.percentage, r.percentage < threshold ? 'LOW' : 'OK',
      ]),
    ]);
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Attendance Report</h1>
          <p className="muted">Percentages per student and the list of students below the required attendance.</p>
        </div>
        <button className="btn btn-primary" onClick={exportCSV} disabled={!rows.length}>Export CSV</button>
      </div>

      <div className="card">
        <div className="threshold">
          <label htmlFor="threshold">
            Minimum required attendance: <strong>{threshold}%</strong>
          </label>
          <input
            id="threshold"
            type="range"
            min="50"
            max="95"
            step="5"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </div>

        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search name or roll no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="All">All classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <label className="field inline">
            <span>From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="field inline">
            <span>To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="check">
            <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
            Only low attendance
          </label>
        </div>
        {rangeError && <p className="form-error">{rangeError}</p>}

        <p className={`notice ${lowCount ? 'notice-danger' : 'notice-good'}`}>
          {lowCount
            ? `${lowCount} student${lowCount > 1 ? 's are' : ' is'} below ${threshold}% attendance.`
            : `All listed students meet the ${threshold}% requirement.`}
        </p>

        {rows.length === 0 ? (
          <EmptyState title="No matching students." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll no</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th className="center">P</th>
                  <th className="center">L</th>
                  <th className="center">A</th>
                  <th className="center">Total</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const low = r.total > 0 && r.percentage < threshold;
                  return (
                    <tr key={r.id} className={low ? 'row-low' : ''}>
                      <td className="mono">{r.rollNo}</td>
                      <td>{r.name}</td>
                      <td><span className="tag">{r.className}</span></td>
                      <td className="center">{r.present}</td>
                      <td className="center">{r.late}</td>
                      <td className="center">{r.absent}</td>
                      <td className="center">{r.total}</td>
                      <td className="min-180"><ProgressBar percentage={r.percentage} threshold={threshold} /></td>
                      <td>
                        {r.total === 0 ? (
                          <span className="muted small">No data</span>
                        ) : low ? (
                          <span className="badge badge-danger" title="Consecutive classes needed to reach the threshold">
                            Low · needs {r.needed}
                          </span>
                        ) : (
                          <span className="badge badge-good">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted small mt">
          Percentage = (Present + Late) ÷ Total sessions × 100. “Needs N” = classes the student must attend in a row to reach {threshold}%.
        </p>
      </div>

      <div className="reset-row">
        <button className="btn btn-sm btn-ghost" onClick={resetDemoData}>Reset demo data</button>
      </div>
    </section>
  );
}
