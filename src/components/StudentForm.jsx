import { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { validateStudent } from '../utils/attendance';

const emptyForm = { rollNo: '', name: '', className: '', email: '' };

/**
 * Add / edit form with client-side validation.
 * When `editing` is set the form is pre-filled and saves an update.
 */
export default function StudentForm({ editing, onDone }) {
  const { students, classes, addStudent, updateStudent } = useAttendance();
  // The parent remounts this form (via `key`) when a different student is
  // chosen, so the initial state is the student being edited.
  const [values, setValues] = useState(() => (editing ? { ...emptyForm, ...editing } : emptyForm));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (touched[name]) setErrors(validateStudent(next, students, editing?.id));
      return next;
    });
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validateStudent(values, students, editing?.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateStudent(values, students, editing?.id);
    setErrors(found);
    setTouched({ rollNo: true, name: true, className: true, email: true });
    if (Object.keys(found).length) return;

    const clean = {
      rollNo: values.rollNo.trim().toUpperCase(),
      name: values.name.trim().replace(/\s+/g, ' '),
      className: values.className,
      email: values.email.trim().toLowerCase(),
    };
    if (editing) updateStudent(editing.id, clean);
    else addStudent(clean);
    setValues(emptyForm);
    setTouched({});
    onDone?.();
  };

  const fieldError = (name) => touched[name] && errors[name];

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2 className="card-title">{editing ? 'Edit student' : 'Add a student'}</h2>

      <div className="form-grid">
        <label className={`field ${fieldError('rollNo') ? 'has-error' : ''}`}>
          <span>Roll number *</span>
          <input
            name="rollNo"
            value={values.rollNo}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 23CS005"
            maxLength={10}
          />
          {fieldError('rollNo') && <small className="error">{errors.rollNo}</small>}
        </label>

        <label className={`field ${fieldError('name') ? 'has-error' : ''}`}>
          <span>Full name *</span>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Neha Gupta"
            maxLength={50}
          />
          {fieldError('name') && <small className="error">{errors.name}</small>}
        </label>

        <label className={`field ${fieldError('className') ? 'has-error' : ''}`}>
          <span>Class *</span>
          <select name="className" value={values.className} onChange={handleChange} onBlur={handleBlur}>
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {fieldError('className') && <small className="error">{errors.className}</small>}
        </label>

        <label className={`field ${fieldError('email') ? 'has-error' : ''}`}>
          <span>Email (optional)</span>
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="name@college.edu"
          />
          {fieldError('email') && <small className="error">{errors.email}</small>}
        </label>
      </div>

      <div className="form-actions">
        {editing && (
          <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
        )}
        <button type="submit" className="btn btn-primary">
          {editing ? 'Save changes' : 'Add student'}
        </button>
      </div>
    </form>
  );
}
