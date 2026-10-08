import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/students', label: 'Students' },
  { to: '/attendance', label: 'Mark Attendance' },
  { to: '/reports', label: 'Reports' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">✓</span>
          <span>Attendance<span className="brand-light">Tracker</span></span>
        </NavLink>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
