import { useAttendance } from '../context/AttendanceContext';

export default function Toast() {
  const { toast } = useAttendance();
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      {toast.message}
    </div>
  );
}
