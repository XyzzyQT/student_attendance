import { getStatusBand } from '../utils/attendance';

export default function ProgressBar({ percentage, threshold }) {
  const band = getStatusBand(percentage, threshold);
  return (
    <div className="progress" title={`${percentage}%`}>
      <div className="progress-track">
        <div className={`progress-fill band-${band}`} style={{ width: `${percentage}%` }} />
        <div className="progress-threshold" style={{ left: `${threshold}%` }} />
      </div>
      <span className={`progress-value band-text-${band}`}>{percentage.toFixed(1)}%</span>
    </div>
  );
}
