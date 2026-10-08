import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import MarkAttendance from './pages/MarkAttendance';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/attendance" element={<MarkAttendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">Student Attendance Tracker · Built with ReactJS</footer>
      <Toast />
    </div>
  );
}
