# Student Attendance Tracker — Application Workflow

1. **Open the app → Dashboard.** On first launch, 12 demo students in 3 classes (CSE-A, CSE-B, ECE-A) with 20 days of attendance are loaded. The dashboard shows totals, the average attendance, class-wise averages and the list of students below 75 %.
2. **Manage students (Students page).** Fill in roll number, name, class and email and click **Add student**. Invalid input shows inline error messages and blocks saving. Use **Edit** to load a student back into the form and **Save changes**, or **Delete** (with a confirmation dialog) to remove a student and their records. The search box and class filter narrow the table instantly.
3. **Record attendance (Mark Attendance page).** Choose a date (today by default) and a class. Mark each student **Present / Late / Absent**, or use **All present** and then change the exceptions. Live counters show how many are present, late, absent and unmarked. Click **Save attendance** — the app checks that the date is not in the future and that everyone is marked. Choosing a date that was already saved loads it for editing.
4. **Calculations update automatically.** Every saved change updates React state, which re-computes each student's present/late/absent counts and percentage, and `useEffect` writes the data to `localStorage`.
5. **Review reports (Reports page).** See each student's P / L / A / total and percentage with a colour-coded bar. Move the **threshold slider** to change the required percentage, tick **Only low attendance** to list defaulters, filter by class or date range, sort, and **Export CSV**. Low students show how many consecutive classes they need to attend to recover.

```
Add students ──► Mark attendance (date + class) ──► Save
       ▲                                              │
       │                                              ▼
  Edit / delete ◄── Reports & Dashboard ◄── % calculated per student
                    (low-attendance list)
```

---
