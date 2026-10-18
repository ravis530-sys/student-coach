import useAppStore from '../../store/appStore';

const studentNav = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'upload', icon: '📂', label: 'Upload Material' },
  { section: 'Modes' },
  { id: 'learn', icon: '📚', label: 'Learn' },
  { id: 'qna', icon: '❓', label: 'Q & A' },
  { id: 'exam_prep', icon: '🎯', label: 'Exam Prep' },
  { id: 'quiz', icon: '🧠', label: 'Quick Quiz' },
];

const teacherNav = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'upload', icon: '📂', label: 'Upload Chapters' },
  { section: 'Teacher Tools' },
  { id: 'exam_generate', icon: '📝', label: 'Generate Exam Paper' },
  { id: 'qna', icon: '💬', label: 'Ask AI' },
];

export default function Sidebar({ currentView, onNavigate }) {
  const { role, name, studentClass, board, teacherSubjects, sidebarOpen, apiKey } = useAppStore();

  const navItems = role === 'teacher' ? teacherNav : studentNav;

  if (!sidebarOpen) return null;

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h1>🎓 Student Coach AI</h1>
        <p>Your personal AI tutor</p>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <div key={i} className="nav-section-title">{item.section}</div>;
          }
          return (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!apiKey && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            fontSize: '0.75rem',
            color: 'var(--secondary-light)',
            marginBottom: '8px',
          }}>
            ⚠️ No API key set. Go to Settings ⚙️ to add your Gemini key.
          </div>
        )}
        <div className="user-chip">
          <div className="user-avatar">
            {name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="user-info">
            <div className="name">{name || 'User'}</div>
            <div className="role">
              {role === 'student'
                ? `${studentClass || ''} · ${board || 'Student'}`
                : `Teacher · ${teacherSubjects?.slice(0, 2).join(', ') || 'All Subjects'}`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
