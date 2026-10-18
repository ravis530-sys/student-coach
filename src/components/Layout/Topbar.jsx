import { Menu, Settings, Globe } from 'lucide-react';
import useAppStore, { MODES, ALL_LANGUAGES } from '../../store/appStore';

export default function Topbar({ currentView }) {
  const { toggleSidebar, toggleSettings, explanationLanguage, setExplanationLanguage, name, role } = useAppStore();

  const viewTitles = {
    home: `Welcome back, ${name}! 👋`,
    learn: '📚 Learning Mode',
    qna: '❓ Q&A Mode',
    exam_prep: '🎯 Exam Preparation',
    quiz: '🧠 Quiz Mode',
    exam_generate: '📝 Exam Paper Generator',
    upload: '📂 Upload Material',
  };

  return (
    <div className="topbar">
      <button className="btn btn-ghost btn-icon" onClick={toggleSidebar} title="Toggle Sidebar">
        <Menu size={20} />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {viewTitles[currentView] || 'Student Coach AI'}
        </div>
      </div>

      {/* Language Switcher */}
      {role === 'student' && (
        <div className="lang-switcher" title="Change explanation language">
          <Globe size={14} color="var(--text-muted)" />
          <select
            className="select"
            value={explanationLanguage}
            onChange={e => setExplanationLanguage(e.target.value)}
          >
            {ALL_LANGUAGES.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      )}

      <button className="btn btn-ghost btn-icon" onClick={toggleSettings} title="Settings">
        <Settings size={18} />
      </button>
    </div>
  );
}
