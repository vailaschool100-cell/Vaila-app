'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, CheckCircle2, AlertCircle, RefreshCw,
  Eye, Check, X, LogOut, ChevronLeft, ChevronRight, Search, Trash2, Edit2, UserPlus
} from 'lucide-react';


const PAGE_SIZE = 10;
const SIDEBAR_PAGE_SIZE = 15;

function Pagination({ page, pageCount, onPageChange }: { page: number; pageCount: number; onPageChange: (p: number) => void }) {
  if (pageCount <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '18px' }}>
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: page === 1 ? '#475569' : '#e2e8f0', padding: '6px 14px', borderRadius: '8px', cursor: page === 1 ? 'default' : 'pointer', fontWeight: 600, fontSize: '13px' }}>
        <ChevronLeft size={14} /> Prev
      </button>
      <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Page {page} of {pageCount}</span>
      <button onClick={() => onPageChange(Math.min(pageCount, page + 1))} disabled={page === pageCount}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: page === pageCount ? '#475569' : '#e2e8f0', padding: '6px 14px', borderRadius: '8px', cursor: page === pageCount ? 'default' : 'pointer', fontWeight: 600, fontSize: '13px' }}>
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}

interface UserItem {
  id: number; username: string; email: string; registration_screenshot: string;
  is_approved: number; is_active: number; registration_month: string;
  last_payment_month: string; created_at: string; payment_status_badge: string; status_text: string;
}
interface PaymentRequest {
  id: number; user_id: number; username: string; month: string; year: string;
  screenshot_url: string; status: string; created_at: string;
}
interface SessionLog {
  id?: number; student: string; alphabet: string; spoken_sound?: string;
  whisper_transcription?: string; accuracy: number; passed: boolean | number;
  source?: string; timestamp: string;
}
interface Teacher {
  id?: number | string; username: string; email: string; created_at?: string;
}
interface StudentListItem {
  username: string; email: string; created_at: string; is_active: number;
}
interface StudentEvaluations {
  student: string;
  phonics: SessionLog[];
  numbers: SessionLog[];
  urdu: SessionLog[];
}

// ─── Shared: Student Evaluations Panel ────────────────────────────────────────
function StudentEvalsPanel({
  students, apiUrl, searchQuery, setSearchQuery, studentsPage, setStudentsPage,
  selectedStudent, setSelectedStudent, studentEvals, studentEvalsLoading, studentEvalsTab, setStudentEvalsTab,
  evalsPage, setEvalsPage
}: {
  students: StudentListItem[];
  apiUrl: string;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  studentsPage: number;
  setStudentsPage: (v: number) => void;
  selectedStudent: string | null;
  setSelectedStudent: (v: string | null) => void;
  studentEvals: StudentEvaluations | null;
  studentEvalsLoading: boolean;
  studentEvalsTab: 'phonics' | 'numbers' | 'urdu';
  setStudentEvalsTab: (v: 'phonics' | 'numbers' | 'urdu') => void;
  evalsPage: number;
  setEvalsPage: (v: number) => void;
}) {
  const filtered = students.filter(s => s.username.toLowerCase().includes(searchQuery.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / SIDEBAR_PAGE_SIZE));
  const paginated = filtered.slice((studentsPage - 1) * SIDEBAR_PAGE_SIZE, studentsPage * SIDEBAR_PAGE_SIZE);

  const currentLogs: SessionLog[] = studentEvals
    ? (studentEvalsTab === 'phonics' ? studentEvals.phonics : studentEvalsTab === 'numbers' ? studentEvals.numbers : studentEvals.urdu)
    : [];

  return (
    <div className="evals-panel-wrap">
      {/* Sidebar */}
      <div className="evals-sidebar" style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={16} color="#60a5fa" /> Students
        </div>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Search student..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setStudentsPage(1); }}
            style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '8px 12px 8px 36px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '200px' }}>
          {paginated.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No students found</div>
          ) : paginated.map(s => (
            <button key={s.username} onClick={() => setSelectedStudent(s.username)}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                backgroundColor: selectedStudent === s.username ? 'rgba(67,97,238,0.3)' : 'rgba(255,255,255,0.04)',
                color: selectedStudent === s.username ? '#93c5fd' : '#cbd5e1',
                fontWeight: selectedStudent === s.username ? 700 : 500, fontSize: '13px',
                borderLeft: selectedStudent === s.username ? '3px solid #4361ee' : '3px solid transparent',
                transition: 'all 0.15s'
              }}>
              <div>{s.username}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{s.is_active ? '● Active' : '○ Inactive'}</div>
            </button>
          ))}
        </div>
        {pageCount > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            <button onClick={() => setStudentsPage(Math.max(1, studentsPage - 1))} disabled={studentsPage === 1}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: studentsPage === 1 ? '#475569' : '#e2e8f0', padding: '4px 10px', borderRadius: '6px', cursor: studentsPage === 1 ? 'default' : 'pointer', fontSize: '12px' }}>
              <ChevronLeft size={12} />
            </button>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{studentsPage}/{pageCount}</span>
            <button onClick={() => setStudentsPage(Math.min(pageCount, studentsPage + 1))} disabled={studentsPage === pageCount}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: studentsPage === pageCount ? '#475569' : '#e2e8f0', padding: '4px 10px', borderRadius: '6px', cursor: studentsPage === pageCount ? 'default' : 'pointer', fontSize: '12px' }}>
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <div className="evals-detail" style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '400px' }}>
        {!selectedStudent ? (
          <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '80px', fontSize: '15px' }}>
            ← Select a student from the list to view their evaluations
          </div>
        ) : studentEvalsLoading ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '80px' }}>Loading evaluations...</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #4361ee, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '16px' }}>
                {selectedStudent[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>{selectedStudent}</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>
                  {(studentEvals?.phonics.length || 0) + (studentEvals?.numbers.length || 0) + (studentEvals?.urdu.length || 0)} total attempts
                </div>
              </div>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {(['phonics', 'numbers', 'urdu'] as const).map(tab => (
                <button key={tab} onClick={() => setStudentEvalsTab(tab)}
                  style={{
                    padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                    backgroundColor: studentEvalsTab === tab ? (tab === 'phonics' ? '#4361ee' : tab === 'numbers' ? '#10b981' : '#a855f7') : '#0f172a',
                    color: '#fff'
                  }}>
                  {tab === 'phonics' ? '📚 Phonics' : tab === 'numbers' ? '🔢 Numbers' : '🕌 Urdu'} ({tab === 'phonics' ? studentEvals?.phonics.length : tab === 'numbers' ? studentEvals?.numbers.length : studentEvals?.urdu.length})
                </button>
              ))}
            </div>

            {currentLogs.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No {studentEvalsTab} evaluations recorded yet.</div>
            ) : (() => {
              const totalPages = Math.max(1, Math.ceil(currentLogs.length / PAGE_SIZE));
              const pageLogs = currentLogs.slice((evalsPage - 1) * PAGE_SIZE, evalsPage * PAGE_SIZE);
              return (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                          <th style={{ padding: '10px 12px', textAlign: 'left' }}>Letter/Number</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left' }}>Spoken</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left' }}>Accuracy</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left' }}>Result</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left' }}>Platform</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageLogs.map((log, i) => {
                          const isPassed = Boolean(log.passed === true || log.passed === 1);
                          return (
                            <tr key={log.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '8px', backgroundColor: studentEvalsTab === 'phonics' ? 'rgba(99,102,241,0.2)' : studentEvalsTab === 'numbers' ? 'rgba(16,185,129,0.2)' : 'rgba(168,85,247,0.2)', color: studentEvalsTab === 'phonics' ? '#818cf8' : studentEvalsTab === 'numbers' ? '#34d399' : '#c084fc', fontWeight: 800, fontSize: '13px', border: `1px solid ${studentEvalsTab === 'phonics' ? 'rgba(99,102,241,0.4)' : studentEvalsTab === 'numbers' ? 'rgba(16,185,129,0.4)' : 'rgba(168,85,247,0.4)'}` }}>
                                  {log.alphabet || ''}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', fontStyle: 'italic', color: '#e2e8f0' }}>"{log.spoken_sound || log.whisper_transcription || ''}"</td>
                              <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                                <span style={{ color: log.accuracy >= 90 ? '#34d399' : log.accuracy >= 60 ? '#fbbf24' : '#f87171' }}>{log.accuracy}%</span>
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: isPassed ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', color: isPassed ? '#34d399' : '#f87171', border: `1px solid ${isPassed ? '#10b981' : '#f43f5e'}`, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  {isPassed ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} {isPassed ? 'Passed' : 'Needs Practice'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: log.source === 'web' ? 'rgba(6,182,212,0.15)' : 'rgba(168,85,247,0.15)', color: log.source === 'web' ? '#38bdf8' : '#c084fc' }}>
                                  {log.source === 'web' ? '🌐 Web' : '📱 App'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: '12px' }}>{log.timestamp || ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={evalsPage} pageCount={totalPages} onPageChange={setEvalsPage} />
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'admin' | 'teacher' | null>(null);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [slowLoad, setSlowLoad] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'student-evals' | 'teachers'>('users');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [usersPage, setUsersPage] = useState(1);

  // Students sidebar state
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentsPage, setStudentsPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentEvals, setStudentEvals] = useState<StudentEvaluations | null>(null);
  const [studentEvalsLoading, setStudentEvalsLoading] = useState(false);
  const [studentEvalsTab, setStudentEvalsTab] = useState<'phonics' | 'numbers' | 'urdu'>('phonics');
  const [evalsPage, setEvalsPage] = useState(1);

  // Teacher management state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [addTeacherForm, setAddTeacherForm] = useState({ username: '', email: '', password: '' });
  const [addTeacherLoading, setAddTeacherLoading] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editTeacherForm, setEditTeacherForm] = useState({ new_email: '', new_password: '' });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const token = localStorage.getItem('vaila_admin_token');
    const role = localStorage.getItem('vaila_admin_role') as 'admin' | 'teacher' | null;
    if (!token) {
      router.push('/login');
      return;
    }
    setUserRole(role || 'admin');
    if (role === 'teacher') setActiveTab('student-evals');
  }, [router]);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    const slowTimer = setTimeout(() => setSlowLoad(true), 4000);
    try {
      const userRes = await fetch(`${API_URL}/api/admin/users`);
      if (userRes.ok) { const d = await userRes.json(); setUsers(d.users || []); setPayments(d.payments || []); }
    } catch (e) { console.log('Error fetching admin data:', e); }
    finally { clearTimeout(slowTimer); setLoading(false); setSlowLoad(false); }
  }, [API_URL]);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/students`);
      if (res.ok) { const d = await res.json(); setStudents(d.students || []); }
    } catch (e) { console.log('Error fetching students:', e); }
  }, [API_URL]);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/teachers`);
      if (res.ok) { const d = await res.json(); setTeachers(d.teachers || []); }
    } catch (e) { console.log('Error fetching teachers:', e); }
  }, [API_URL]);

  useEffect(() => {
    if (!userRole) return;
    fetchStudents();
    if (userRole === 'admin') {
      fetchAdminData();
      fetchTeachers();
      const interval = setInterval(() => { fetchAdminData(); fetchStudents(); }, 6000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(fetchStudents, 8000);
      return () => clearInterval(interval);
    }
  }, [userRole, fetchAdminData, fetchStudents, fetchTeachers]);

  useEffect(() => { setEvalsPage(1); }, [selectedStudent, studentEvalsTab]);

  useEffect(() => {
    if (!selectedStudent) return;
    setStudentEvalsLoading(true);
    setStudentEvals(null);
    fetch(`${API_URL}/api/admin/student-evaluations/${encodeURIComponent(selectedStudent)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStudentEvals(d); })
      .finally(() => setStudentEvalsLoading(false));
  }, [selectedStudent, API_URL]);

  const handleApproveUser = async (user: UserItem) => {
    try {
      const formData = new FormData();
      formData.append('user_id', String(user.id));
      formData.append('username', user.username);
      const res = await fetch(`${API_URL}/api/admin/approve-user`, { method: 'POST', body: formData });
      if (res.ok) { alert(`User '${user.username}' has been approved successfully!`); fetchAdminData(); }
    } catch (e) { console.error(e); }
  };

  const handleDeactivateUser = async (user: UserItem) => {
    try {
      const formData = new FormData();
      formData.append('user_id', String(user.id));
      formData.append('username', user.username);
      const res = await fetch(`${API_URL}/api/admin/deactivate-user`, { method: 'POST', body: formData });
      if (res.ok) { alert(`User '${user.username}' deactivated.`); fetchAdminData(); }
    } catch (e) { console.error(e); }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTeacherLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', addTeacherForm.username);
      formData.append('email', addTeacherForm.email);
      formData.append('password', addTeacherForm.password);
      const res = await fetch(`${API_URL}/api/admin/add-teacher`, { method: 'POST', body: formData });
      if (res.ok) {
        alert(`Teacher '${addTeacherForm.username}' added successfully!`);
        setAddTeacherForm({ username: '', email: '', password: '' });
        fetchTeachers();
      } else {
        const d = await res.json();
        alert(d.detail || 'Failed to add teacher');
      }
    } catch (e) { console.error(e); }
    finally { setAddTeacherLoading(false); }
  };

  const handleDeleteTeacher = async (username: string) => {
    if (!confirm(`Delete teacher '${username}'? This cannot be undone.`)) return;
    try {
      const formData = new FormData();
      formData.append('username', username);
      const res = await fetch(`${API_URL}/api/admin/delete-teacher`, { method: 'POST', body: formData });
      if (res.ok) fetchTeachers();
    } catch (e) { console.error(e); }
  };

  const handleEditTeacher = async (username: string) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      if (editTeacherForm.new_email) formData.append('new_email', editTeacherForm.new_email);
      if (editTeacherForm.new_password) formData.append('new_password', editTeacherForm.new_password);
      const res = await fetch(`${API_URL}/api/admin/edit-teacher`, { method: 'POST', body: formData });
      if (res.ok) {
        setEditingTeacher(null);
        setEditTeacherForm({ new_email: '', new_password: '' });
        fetchTeachers();
        alert('Teacher updated successfully!');
      }
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('vaila_admin_token');
    localStorage.removeItem('vaila_admin_role');
    localStorage.removeItem('vaila_admin_username');
    router.push('/login');
  };

  if (!userRole) return null;

  const sharedEvalsProps = {
    students, apiUrl: API_URL, searchQuery, setSearchQuery, studentsPage, setStudentsPage,
    selectedStudent, setSelectedStudent, studentEvals, studentEvalsLoading, studentEvalsTab, setStudentEvalsTab,
    evalsPage, setEvalsPage
  };

  // ─── Teacher View ──────────────────────────────────────────────────────────
  if (userRole === 'teacher') {
    const teacherUsername = typeof window !== 'undefined' ? localStorage.getItem('vaila_admin_username') || 'Teacher' : 'Teacher';
    return (
      <main className="dashboard-container">
        <header className="header-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo-group">
            <div className="logo-badge">V</div>
            <div className="title-text">
              <h1>Vaila Teacher Portal</h1>
              <p>Welcome, {teacherUsername} — Student Evaluations</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid #f43f5e', color: '#fda4af', padding: '0.6rem 1.2rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>
        <div style={{ marginTop: '24px' }}>
          <StudentEvalsPanel {...sharedEvalsProps} />
        </div>
      </main>
    );
  }

  // ─── Admin View ────────────────────────────────────────────────────────────
  return (
    <main className="dashboard-container">
      <header className="header-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo-group">
          <div className="logo-badge">V</div>
          <div className="title-text">
            <h1>Vaila Teaching Admin Portal</h1>
            <p>Registration Approval, Monthly Fee Alerts & Analytics</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={fetchAdminData} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={handleLogout} style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid #f43f5e', color: '#fda4af', padding: '0.6rem 1.2rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Slow-load hint */}
      {slowLoad && (
        <div style={{ backgroundColor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '10px 16px', marginBottom: '8px', color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={14} className="animate-spin" />
          Server is waking up — data will appear shortly…
        </div>
      )}

      {/* Tabs */}
      <div className="tab-row">
        {[
          { key: 'users', label: `👥 Approvals (${users.filter(u => !u.is_approved).length} Pending)`, color: '#4361ee' },
          { key: 'student-evals', label: '🎓 Student Evaluations', color: '#06b6d4' },
          { key: 'teachers', label: `👨‍🏫 Teachers (${teachers.length})`, color: '#f59e0b' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === tab.key ? tab.color : '#1e293b', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px', fontWeight: 700 }}>Student Registrations & Monthly Fee Verification</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>User Details</th>
                  <th style={{ padding: '12px' }}>Registration Date</th>
                  <th style={{ padding: '12px' }}>Payment Screenshot</th>
                  <th style={{ padding: '12px' }}>Fee Expiry Status</th>
                  <th style={{ padding: '12px' }}>Approval Action</th>
                </tr>
              </thead>
              <tbody>
                {users.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE).map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{u.username}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '16px 12px' }}><div style={{ fontWeight: 600, color: '#fff' }}>{u.created_at || u.registration_month || ''}</div></td>
                    <td style={{ padding: '16px 12px' }}>
                      {u.registration_screenshot ? (
                        <button onClick={() => setSelectedImage(`${API_URL}${u.registration_screenshot}`)}
                          style={{ backgroundColor: 'rgba(6,182,212,0.15)', border: '1px solid #06b6d4', color: '#38bdf8', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                          <Eye size={14} /> View Screenshot
                        </button>
                      ) : <span style={{ color: '#64748b' }}>No Screenshot</span>}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: u.payment_status_badge === 'green' ? 'rgba(16,185,129,0.2)' : u.payment_status_badge === 'orange' ? 'rgba(245,158,11,0.2)' : 'rgba(244,63,94,0.2)', color: u.payment_status_badge === 'green' ? '#34d399' : u.payment_status_badge === 'orange' ? '#fbbf24' : '#f87171', border: `1px solid ${u.payment_status_badge === 'green' ? '#10b981' : u.payment_status_badge === 'orange' ? '#f59e0b' : '#f43f5e'}` }}>
                        ● {u.status_text}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      {!u.is_approved ? (
                        <button onClick={() => handleApproveUser(u)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={16} /> Approve User</button>
                      ) : (!u.is_active || u.payment_status_badge === 'red') ? (
                        <button onClick={() => handleApproveUser(u)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={16} /> Re-activate</button>
                      ) : (
                        <button onClick={() => handleDeactivateUser(u)} style={{ backgroundColor: 'rgba(244,63,94,0.2)', border: '1px solid #f43f5e', color: '#f87171', padding: '6px 12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Deactivate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={usersPage} pageCount={Math.max(1, Math.ceil(users.length / PAGE_SIZE))} onPageChange={setUsersPage} />
        </div>
      )}



      {activeTab === 'student-evals' && (
        <StudentEvalsPanel {...sharedEvalsProps} />
      )}

      {activeTab === 'teachers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Add Teacher Form */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={20} color="#f59e0b" /> Add New Teacher
            </h2>
            <form onSubmit={handleAddTeacher} className="teacher-form-row">
              {[
                { label: 'Username', key: 'username', type: 'text', placeholder: 'e.g. MissAyesha' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'teacher@school.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '180px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>{field.label}</label>
                  <input type={field.type} required placeholder={field.placeholder}
                    value={addTeacherForm[field.key as keyof typeof addTeacherForm]}
                    onChange={e => setAddTeacherForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
                </div>
              ))}
              <button type="submit" disabled={addTeacherLoading}
                style={{ backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '42px' }}>
                <UserPlus size={16} /> {addTeacherLoading ? 'Adding...' : 'Add Teacher'}
              </button>
            </form>
          </div>

          {/* Teachers List */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px', fontWeight: 700 }}>👨‍🏫 Teacher Accounts ({teachers.length})</h2>
            {teachers.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '32px' }}>No teachers added yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '14px' }}>
                <thead><tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Username</th><th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Created</th><th style={{ padding: '12px' }}>Actions</th>
                </tr></thead>
                <tbody>
                  {teachers.map(t => (
                    <React.Fragment key={String(t.id || t.username)}>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '14px 12px', fontWeight: 700, color: '#fff' }}>{t.username}</td>
                        <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{t.email}</td>
                        <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '13px' }}>{t.created_at || ''}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setEditingTeacher(editingTeacher === t.username ? null : t.username); setEditTeacherForm({ new_email: '', new_password: '' }); }}
                              style={{ backgroundColor: 'rgba(99,102,241,0.2)', border: '1px solid #6366f1', color: '#818cf8', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeleteTeacher(t.username)}
                              style={{ backgroundColor: 'rgba(244,63,94,0.2)', border: '1px solid #f43f5e', color: '#f87171', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {editingTeacher === t.username && (
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(99,102,241,0.05)' }}>
                          <td colSpan={4} style={{ padding: '16px 12px' }}>
                            <div className="teacher-form-row teacher-edit-row" style={{ alignItems: 'flex-end' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>New Email (optional)</label>
                                <input type="email" placeholder="Leave blank to keep current" value={editTeacherForm.new_email}
                                  onChange={e => setEditTeacherForm(prev => ({ ...prev, new_email: e.target.value }))}
                                  style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', width: '220px' }} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>New Password (optional)</label>
                                <input type="password" placeholder="Leave blank to keep current" value={editTeacherForm.new_password}
                                  onChange={e => setEditTeacherForm(prev => ({ ...prev, new_password: e.target.value }))}
                                  style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', width: '220px' }} />
                              </div>
                              <button onClick={() => handleEditTeacher(t.username)}
                                style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Check size={16} /> Save Changes
                              </button>
                              <button onClick={() => setEditingTeacher(null)}
                                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Screenshot Viewer Modal */}
      {selectedImage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ position: 'relative', backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', maxWidth: '90%', maxHeight: '90%' }}>
            <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'red', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
            <img src={selectedImage} alt="Payment Proof" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px' }} />
          </div>
        </div>
      )}
    </main>
  );
}
