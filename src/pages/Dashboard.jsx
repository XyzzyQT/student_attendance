import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { formatDate, getStudentStats, todayISO } from '../utils/attendance';

export default function Dashboard() {
  const { students, records, classes, threshold } = useAttendance();

  const stats = useMemo(
    () => students.map((s) => ({ ...s, ...getStudentStats(s.id, records) })),
    [students, records]
  );

  const sessionDates = Object.keys(records).sort();
  const withData = stats.filter((s) => s.total > 0);
  const average = withData.length
    ? withData.reduce((sum, s) => sum + s.percentage, 0) / withData.length
    : 0;
  const lowAttendance = stats
    .filter((s) => s.total > 0 && s.percentage < threshold)
    .sort((a, b) => a.percentage - b.percentage);

  const classAverages = classes.map((c) => {
    const list = withData.filter((s) => s.className === c);
    const avg = list.length ? list.reduce((sum, s) => sum + s.percentage, 0) / list.length : 0;
    return { className: c, count: list.length, avg: Math.round(avg * 10) / 10 };
  });

  const recent = sessionDates.slice(-5).reverse().map((date) => {
    const marks = Object.values(records[date]);
    return {
      date,
      present: marks.filter((m) => m === 'P').length,
      late: marks.filter((m) => m === 'L').length,
      absent: marks.filter((m) => m === 'A').length,
    };
  });

  const markedToday = Boolean(records[todayISO()]);

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Overview of attendance across all classes.</p>
        </div>
        <Link to="/attendance" className="btn btn-primary">
          {markedToday ? 'Update today’s attendance' : 'Mark today’s attendance'}
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard label="Total students" value={students.length} hint={`${classes.length} classes`} />
        <StatCard label="Sessions recorded" value={sessionDates.length} hint={sessionDates.length ? `Last: ${formatDate(sessionDates.at(-1))}` : 'None yet'} />
        <StatCard
          label="Average attendance"
          value={`${average.toFixed(1)}%`}
          tone={average >= threshold ? 'good' : 'danger'}
          hint={`Required: ${threshold}%`}
        />
        <StatCard
          label="Low attendance"
          value={lowAttendance.length}
          tone={lowAttendance.length ? 'danger' : 'good'}
          hint={`Below ${threshold}%`}
        />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Students below {threshold}%</h2>
            <Link to="/reports" className="link">View report →</Link>
          </div>
          {lowAttendance.length === 0 ? (
            <EmptyState title="Everyone is above the threshold 🎉" />
          ) : (
            <ul className="low-list">
              {lowAttendance.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{s.name}</strong>
                    <span className="muted small">{s.rollNo} · {s.className}</span>
                  </div>
                  <ProgressBar percentage={s.percentage} threshold={threshold} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Class-wise average</h2>
          <ul className="class-list">
            {classAverages.map((c) => (
              <li key={c.className}>
                <div className="class-row">
                  <strong>{c.className}</strong>
                  <span className="muted small">{c.count} students</span>
                </div>
                <ProgressBar percentage={c.avg} threshold={threshold} />
              </li>
            ))}
          </ul>

          <h2 className="card-title mt">Recent sessions</h2>
          {recent.length === 0 ? (
            <EmptyState title="No attendance recorded yet." />
          ) : (
            <div className="table-wrap">
              <table className="table compact">
                <thead>
                  <tr><th>Date</th><th>Present</th><th>Late</th><th>Absent</th></tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.date}>
                      <td>{formatDate(r.date)}</td>
                      <td><span className="pill pill-P">{r.present}</span></td>
                      <td><span className="pill pill-L">{r.late}</span></td>
                      <td><span className="pill pill-A">{r.absent}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
