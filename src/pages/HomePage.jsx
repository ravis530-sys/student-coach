import useAppStore from '../store/appStore';
import UploadZone from '../components/Upload/UploadZone';

const studentModeCards = [
  {
    id: 'learn',
    emoji: '📚',
    title: 'Learn',
    description: 'Let me explain a topic in simple language with real-life examples',
    badge: 'Recommended',
    badgeClass: 'badge-primary',
  },
  {
    id: 'qna',
    emoji: '❓',
    title: 'Q & A',
    description: 'Ask any question from your material and get clear explanations',
    badge: null,
  },
  {
    id: 'exam_prep',
    emoji: '🎯',
    title: 'Exam Prep',
    description: 'Focus on important topics and tips to score well in board exams',
    badge: 'Popular',
    badgeClass: 'badge-amber',
  },
  {
    id: 'quiz',
    emoji: '🧠',
    title: 'Quick Quiz',
    description: 'Test yourself with AI-generated questions and get instant feedback',
    badge: null,
  },
];

const teacherModeCards = [
  {
    id: 'exam_generate',
    emoji: '📝',
    title: 'Generate Exam Paper',
    description: 'Upload chapters and generate a complete model question paper',
    badge: 'Teacher Tool',
    badgeClass: 'badge-amber',
  },
  {
    id: 'qna',
    emoji: '💬',
    title: 'Ask AI',
    description: 'Get teaching ideas, explanations, and classroom resources from AI',
    badge: null,
  },
];

export default function HomePage({ onNavigate }) {
  const { role, name, studentClass, board, teacherSubjects, uploadedContent } = useAppStore();

  const isStudent = role === 'student';
  const modeCards = isStudent ? studentModeCards : teacherModeCards;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="content-area">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2>{greeting()}, {name}! 👋</h2>
            <p style={{ marginTop: '6px' }}>
              {isStudent
                ? `Your AI tutor is ready for ${studentClass} grade · ${board}`
                : `AI assistant for ${teacherSubjects?.slice(0, 3).join(', ')}${teacherSubjects?.length > 3 ? '...' : ''}`
              }
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
              {isStudent ? '🎓 Student' : '👨‍🏫 Teacher'}
            </span>
            {uploadedContent && (
              <span className="badge badge-emerald" style={{ fontSize: '0.8rem', maxWidth: '200px' }}>
                📄 {uploadedContent.filename.slice(0, 25)}{uploadedContent.filename.length > 25 ? '...' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📂 Upload Study Material
          <span className="badge badge-cyan">Optional</span>
        </div>
        <UploadZone />
        {!uploadedContent && (
          <p className="text-xs text-muted mt-3">
            Upload a PDF, Word doc, image, or paste a URL. Or skip this and just ask any question!
          </p>
        )}
      </div>

      {/* Mode Cards */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
          {isStudent ? '🚀 What do you want to do today?' : '🛠️ Teacher Tools'}
        </h3>
        <p className="text-secondary text-sm">Choose a mode to get started</p>
      </div>

      <div className="mode-cards">
        {modeCards.map((card) => (
          <div
            key={card.id}
            className="mode-card"
            onClick={() => onNavigate(card.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onNavigate(card.id)}
          >
            {card.badge && (
              <span className={`badge ${card.badgeClass}`} style={{ marginBottom: '12px', display: 'inline-flex' }}>
                {card.badge}
              </span>
            )}
            <span className="mode-emoji">{card.emoji}</span>
            <div className="mode-name">{card.title}</div>
            <div className="mode-desc">{card.description}</div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div style={{
        marginTop: '24px',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(6, 182, 212, 0.06)',
        border: '1px solid rgba(6, 182, 212, 0.15)',
        fontSize: '0.83rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>💡</span>
        <div>
          <strong style={{ color: 'var(--accent-cyan)' }}>Pro Tip: </strong>
          {isStudent
            ? "Upload your textbook chapter first, then choose 'Learn' for a personalized explanation in your language!"
            : "Upload a chapter PDF, then use 'Generate Exam Paper' to create a complete question paper with answer key!"}
        </div>
      </div>
    </div>
  );
}
